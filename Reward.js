import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    // One reward wallet per user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Total reward points
    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Reward history
    history: [
      {
        points: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["earned", "redeemed", "expired"],
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// ==============================
// Add reward points
// ==============================
rewardSchema.methods.addPoints = async function (
  points,
  reason,
  orderId = null
) {
  this.points += points;
  this.history.push({
    points,
    type: "earned",
    reason,
    order: orderId,
  });
  return this.save();
};

// ==============================
// Redeem reward points
// ==============================
rewardSchema.methods.redeemPoints = async function (points, reason) {
  if (this.points < points) {
    throw new Error("Insufficient reward points");
  }

  this.points -= points;
  this.history.push({
    points,
    type: "redeemed",
    reason,
  });

  return this.save();
};

export default mongoose.model("Reward", rewardSchema);
