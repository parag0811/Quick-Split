import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import auth_route from "./routes/auth-route.js";
import group_route from "./routes/group-route.js"
import expense_route from "./routes/expense-route.js"
import settlement_route from "./routes/settlement-route.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(auth_route);
app.use(group_route);
app.use(expense_route)
app.use(settlement_route)

app.get("/", (req, res) => {
  res.send("Quick Split API is running...");
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
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
