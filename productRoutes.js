import express from "express";
import Product from "../models/Product.js";
import { auth, requireFarmer } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================
   GET ALL PRODUCTS (PUBLIC)
===================================== */
router.get("/", async (req, res) => {
  try {
    const {
      category,
      farmer,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = { isAvailable: true };

    if (category) filter.category = category;
    if (farmer) filter.farmer = farmer;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("farmer", "name farmName state rating")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/* =====================================
   FARMER – GET MY PRODUCTS
===================================== */
router.get("/farmer/my-products", auth, requireFarmer, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ farmer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments({ farmer: req.user.id });

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Farmer products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer products",
    });
  }
});

/* =====================================
   GET SINGLE PRODUCT (PUBLIC)
===================================== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name farmName state rating"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

/* =====================================
   ADD PRODUCT (FARMER)
===================================== */
router.post("/", auth, requireFarmer, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      farmer: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add product",
    });
  }
});

/* =====================================
   UPDATE PRODUCT (FARMER)
===================================== */
router.put("/:id", auth, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
});

/* =====================================
   DELETE PRODUCT (FARMER)
===================================== */
router.delete("/:id", auth, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
});

export default router;
