import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
    },
  },
  { _id: false },
);

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    splitType: {
      type: String,
      required: true,
      enum: ["equal", "manual", "percentage"],
      default: "equal",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    splits: {
      type: [splitSchema], // custom % (default is 50-50)
      required: true,
    },

    category: {
      type: String,
      enum: ["food", "travel", "rent", "shopping", "other"],
      default: "other",
    },

    notes: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

     isDeleted: {
      type: Boolean,
      default: false,
    },

    anomalyScore: {
      type: Number,
    },

    isAnomalous: {
      type: Boolean,
    },

    anomalyReason: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
