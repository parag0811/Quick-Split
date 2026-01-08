import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
