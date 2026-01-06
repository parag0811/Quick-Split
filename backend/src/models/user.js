import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  image: {
    type: String, // optional for now
  },
  provider: {
    type: String,
    default: "credentials",
  },
});

export default mongoose.model("User", userSchema);
