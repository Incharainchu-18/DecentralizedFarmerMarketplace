import express from "express";

const router = express.Router();

// Demo APMC market data (for academic purpose)
const markets = [
  {
    name: "Mumbai APMC",
    location: "Mumbai",
    products: ["Rice", "Wheat", "Vegetables"],
  },
  {
    name: "Bangalore APMC",
    location: "Bangalore",
    products: ["Sugarcane", "Mango", "Tomato"],
  },
  {
    name: "Delhi APMC",
    location: "Delhi",
    products: ["Onion", "Potato", "Apple"],
  },
];

// =====================================
// Search APMC markets by city
// =====================================
router.get("/search/:city", (req, res) => {
  const city = req.params.city.toLowerCase();

  const result = markets.filter((market) =>
    market.location.toLowerCase().includes(city)
  );

  if (!result.length) {
    return res.json({
      success: false,
      message: "No APMC market found for the given city",
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

export default router;
