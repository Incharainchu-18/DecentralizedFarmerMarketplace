import express from "express";
import { auth, requireCustomer, requireFarmer } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Reward from "../models/Reward.js";

const router = express.Router();

// Sample exchange rate
const MATIC_TO_INR = 70;

/* ===============================
   CREATE ORDER (CASH / ONLINE)
================================ */
router.post("/", auth, requireCustomer, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = "cash", notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Order items required" });
    }

    if (!deliveryAddress?.address || !deliveryAddress.city || !deliveryAddress.state) {
      return res.status(400).json({ success: false, message: "Complete delivery address required" });
    }

    const { orderItems, totalAmount, farmerId } = await processItems(items);

    const order = await Order.create({
      customer: req.user.id,
      farmer: farmerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      status: "pending",
      notes,
    });

    await reduceStock(items);

    if (paymentMethod !== "cash") {
      await Payment.create({
        user: req.user.id,
        order: order._id,
        amount: totalAmount,
        paymentMethod,
        paymentStatus: "completed",
      });
    }

    await rewardUser(req.user.id, totalAmount, order._id);

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("farmer", "name farmName")
      .populate("items.product", "name price unit");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

/* ===============================
   CRYPTO PAYMENT ORDER
================================ */
router.post("/crypto", auth, requireCustomer, async (req, res) => {
  try {
    const { items, deliveryAddress, cryptoAmount, walletAddress } = req.body;

    if (!cryptoAmount || !walletAddress) {
      return res.status(400).json({ success: false, message: "Crypto details required" });
    }

    const { orderItems, totalAmount, farmerId } = await processItems(items);
    const amountINR = cryptoAmount * MATIC_TO_INR;

    if (amountINR < totalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient crypto amount" });
    }

    const order = await Order.create({
      customer: req.user.id,
      farmer: farmerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: "crypto",
      paymentStatus: "paid",
      status: "confirmed",
    });

    await Payment.create({
      user: req.user.id,
      order: order._id,
      amount: totalAmount,
      paymentMethod: "crypto",
      paymentStatus: "completed",
      transactionId: `TXN_${Date.now()}`,
      paymentGatewayResponse: { cryptoAmount, walletAddress, amountINR },
    });

    await reduceStock(items);
    await rewardUser(req.user.id, totalAmount, order._id);

    res.status(201).json({
      success: true,
      message: "Crypto order placed successfully",
      order,
      exchangeRate: MATIC_TO_INR,
    });
  } catch (error) {
    console.error("Crypto order error:", error.message);
    res.status(500).json({ success: false, message: "Crypto order failed" });
  }
});

/* ===============================
   FARMER – UPDATE ORDER STATUS
================================ */
router.put("/:id/status", auth, requireFarmer, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      farmer: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (status === "delivered") order.deliveryDate = new Date();

    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Status update failed" });
  }
});

/* ===============================
   HELPER FUNCTIONS
================================ */
async function processItems(items) {
  let totalAmount = 0;
  let farmerId = null;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      throw new Error("Invalid or insufficient product stock");
    }

    if (!farmerId) farmerId = product.farmer;
    if (farmerId.toString() !== product.farmer.toString()) {
      throw new Error("All products must be from same farmer");
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    });
  }

  return { orderItems, totalAmount, farmerId };
}

async function reduceStock(items) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
}

async function rewardUser(userId, totalAmount, orderId) {
  const points = Math.floor(totalAmount / 100);
  if (points <= 0) return;

  let reward = await Reward.findOne({ user: userId });
  if (!reward) reward = await Reward.create({ user: userId });

  await reward.addPoints(points, `Order ${orderId}`, orderId);
}

export default router;
