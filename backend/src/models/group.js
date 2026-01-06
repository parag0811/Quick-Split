import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  inviteToken: {
    type: String,
    default: true,
  },

  isPrivate: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Group", groupSchema);
