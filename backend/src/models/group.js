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
    default: null,
  },

  inviteTokenExpiresAt: {
    type: Date,
  },

  lastActivityAt: {
    type: Date,
    default: Date.now,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
});

groupSchema.index({ "members.user": 1 });

groupSchema.index({ inviteToken: 1 });

export default mongoose.model("Group", groupSchema);
