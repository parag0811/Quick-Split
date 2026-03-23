import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    currency: {
      type: String,
      default: "INR",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    method: {
      type: String,
      enum: ["cash", "upi", "bank", "other"],
      default: "other",
    },

    notes: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

settlementSchema.index({ group: 1, from: 1, to: 1 });

settlementSchema.path("from").validate(function (value) {
  return value.toString() !== this.to.toString();
}, "Sender and receiver cannot be the same");

export default mongoose.model("Settlement", settlementSchema);
