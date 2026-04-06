import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
dotenv.config();

import Group from "./models/group.js";
import auth_route from "./routes/auth-route.js";
import group_route from "./routes/group-route.js";
import expense_route from "./routes/expense-route.js";
import settlement_route from "./routes/settlement-route.js";
import balance_route from "./routes/balance-route.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://quick-split-gamma.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Quick Split API is running...");
});

app.use(auth_route);
app.use(group_route);
app.use(expense_route);
app.use(settlement_route);
app.use(balance_route);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  let message = error.message;
  let data = error.data;

  if (status === 500) {
    message = "Internal Server Error";
    data = null;
  }

  if (status === 401) {
    message = "Authentication Failed! Please Login Again.";
    data = null;
  }

  res.status(status).json({ message, data });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Mongo DB Connected.");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Not Authenticated."));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      id: decodedToken.userId,
    };

    next();
  } catch (error) {
    next(new Error("Invalid Token."));
  }
});

io.on("connection", async (socket) => {
  console.log("Socket connected:", socket.user.id);

  try {
    const groups = await Group.find({
      "members.user": socket.user.id,
    }).select("_id");

    groups.forEach((group) => {
      const roomId = group._id.toString();
      socket.join(roomId);
    });

    console.log(
      "Joined rooms:",
      groups.map((g) => g._id.toString()),
    );
  } catch (error) {
    console.error("Error joining rooms:", error);
  }
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.user.id);
  });
});
