import express from "express";
import TrainingData from "../models/TrainingData.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================
// Upload training data (Admin only)
// =====================================
router.post("/upload-training-data", auth, async (req, res) => {
  try {
    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { images, diseases, crops, locations } = req.body;

    if (
      !Array.isArray(images) ||
      !Array.isArray(diseases) ||
      !Array.isArray(crops) ||
      !Array.isArray(locations)
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields must be arrays",
      });
    }

    if (
      images.length !== diseases.length ||
      images.length !== crops.length ||
      images.length !== locations.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Array lengths must match",
      });
    }

    const trainingData = images.map((image, index) => ({
      image,                 // IPFS hash or URL
      disease: diseases[index],
      crop: crops[index],
      symptoms: [],
      location: locations[index],
      verified: false,
    }));

    await TrainingData.insertMany(trainingData);

    res.json({
      success: true,
      message: "Training data uploaded successfully",
      count: trainingData.length,
    });
  } catch (error) {
    console.error("Upload training data error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload training data",
    });
  }
});

// =====================================
// Get dataset statistics (Public)
// =====================================
router.get("/dataset-stats", async (req, res) => {
  try {
    const stats = await TrainingData.aggregate([
      {
        $group: {
          _id: "$disease",
          totalSamples: { $sum: 1 },
          verifiedSamples: {
            $sum: { $cond: ["$verified", 1, 0] },
          },
        },
      },
      { $sort: { totalSamples: -1 } },
    ]);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Dataset stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dataset statistics",
    });
  }
});

export default router;
