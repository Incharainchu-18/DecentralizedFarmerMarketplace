import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Who paid
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Related order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Blockchain payment
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["blockchain"],
      default: "blockchain",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    // Blockchain transaction hash
    transactionHash: {
      type: String,
      unique: true,
    },

    // Optional raw blockchain response
    blockchainResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
