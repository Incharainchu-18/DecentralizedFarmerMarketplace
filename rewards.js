import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import Reward from "../models/Reward.js";

const router = express.Router();

/* ===============================
   GET USER REWARDS
================================ */
router.get("/", auth, async (req, res) => {
  try {
    let reward = await Reward.findOne({ user: req.user.id })
      .populate("history.order");

    // Create reward account if not exists
    if (!reward) {
      reward = await Reward.create({
        user: req.user.id,
        points: 0,
        history: [],
      });
    }

    res.json({
      success: true,
      reward,
    });
  } catch (error) {
    console.error("Fetch rewards error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reward details",
    });
  }
});

export default router;
