import express from "express";
import multer from "multer";
import { auth, requireFarmer } from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================
// Multer configuration
// =====================================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// =====================================
// Image Classification (Farmer only)
// =====================================
router.post(
  "/classify",
  auth,
  requireFarmer,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      // Simulated AI predictions (prototype)
      const predictions = [
        { label: "tomato", confidence: 0.95 },
        { label: "potato", confidence: 0.87 },
        { label: "corn", confidence: 0.92 },
        { label: "wheat", confidence: 0.88 },
        { label: "rice", confidence: 0.85 },
        { label: "carrot", confidence: 0.83 },
        { label: "onion", confidence: 0.81 },
        { label: "non_agricultural", confidence: 0.91 },
      ];

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const prediction =
        predictions[Math.floor(Math.random() * predictions.length)];

      res.json({
        success: true,
        prediction: prediction.label,
        confidence: prediction.confidence,
        message: `Crop identified as ${prediction.label}`,
      });
    } catch (error) {
      console.error("Image classification error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to process image",
      });
    }
  }
);

export default router;
