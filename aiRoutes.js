import express from "express";
import multer from "multer";
import AIServices from "../services/aiServices.js";
import { auth, requireFarmer } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =====================================
// Weather Data API
// =====================================
router.get("/weather", async (req, res) => {
  try {
    const { lat, lon, location } = req.query;

    let latitude = lat;
    let longitude = lon;

    if (!lat || !lon) {
      const coordinates = getCoordinatesByLocation(
        location || "Karwar, Karnataka"
      );
      latitude = coordinates.lat;
      longitude = coordinates.lon;
    }

    const weatherData = await AIServices.getRealWeatherData(
      latitude,
      longitude
    );

    res.json({ success: true, data: weatherData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
    });
  }
});

// =====================================
// Crop Disease Analysis (Farmer only)
// =====================================
router.post(
  "/analyze-crop",
  auth,
  requireFarmer,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Crop image is required",
        });
      }

      const { location, cropType } = req.body;
      const imageBuffer = req.file.buffer;

      const analysis = await AIServices.analyzeCropDisease(
        imageBuffer,
        location,
        cropType
      );

      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Crop analysis failed",
      });
    }
  }
);

// =====================================
// Soil Health Analysis (Farmer only)
// =====================================
router.post(
  "/analyze-soil",
  auth,
  requireFarmer,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Soil image is required",
        });
      }

      const { location, previousCrop } = req.body;
      const imageBuffer = req.file.buffer;

      const analysis = await AIServices.analyzeSoilHealth(
        imageBuffer,
        location,
        previousCrop
      );

      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Soil analysis failed",
      });
    }
  }
);

// =====================================
// AI Farming Advice (Public)
// =====================================
router.post("/farming-advice", async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const advice = await AIServices.getAIAdvice(question, context);
    res.json({ success: true, advice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate farming advice",
    });
  }
});

// =====================================
// Live Market Prices
// =====================================
router.get("/market-prices", async (req, res) => {
  try {
    const { commodity } = req.query;

    const prices = await AIServices.getLiveMarketPrices(commodity);
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch market prices",
    });
  }
});

// =====================================
// Helper: Static coordinates
// =====================================
function getCoordinatesByLocation(location) {
  const locations = {
    "Karwar, Karnataka": { lat: 14.8136, lon: 74.1294 },
    "Bangalore, Karnataka": { lat: 12.9716, lon: 77.5946 },
    "Mumbai, Maharashtra": { lat: 19.076, lon: 72.8777 },
    Delhi: { lat: 28.6139, lon: 77.209 },
    Punjab: { lat: 31.1471, lon: 75.3412 },
  };

  return locations[location] || locations["Karwar, Karnataka"];
}

export default router;
