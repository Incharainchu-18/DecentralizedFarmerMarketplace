/****************************************************
 * Farmer Marketplace – Backend Server (FINAL WORKING)
 * ✔ Register
 * ✔ Login
 * ✔ Forgot Password
 * ✔ Reset Password
 * ✔ AgriAI Chatbot (OpenAI)
 ****************************************************/

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const OpenAI = require("openai"); // ✅ NEW

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

/* ===============================
   DATABASE
================================ */
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/farmer_marketplace"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

/* ===============================
   OPENAI CONFIG (NEW)
================================ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===============================
   USER MODEL
================================ */
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["farmer", "user"] },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

/* ===============================
   REGISTER
================================ */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: "Registration successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* ===============================
   LOGIN
================================ */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* ===============================
   FORGOT PASSWORD
================================ */
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, reset link generated"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&userId=${user._id}`;

    console.log("\n🔗 PASSWORD RESET LINK:");
    console.log(resetUrl, "\n");

    res.json({
      success: true,
      message: "Password reset link generated",
      resetUrl
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ===============================
   RESET PASSWORD
================================ */
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, userId, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      _id: userId,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ===============================
   🤖 AGRIAI CHAT API (NEW)
================================ */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are AgriAI, an assistant for a decentralized farmer marketplace. " +
            "Answer like ChatGPT. Help with farming, prices, orders, blockchain, support."
        },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({
      reply: "⚠️ AI service unavailable. Please try again."
    });
  }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`
🚀 Farmer Marketplace Backend Running
🌐 http://localhost:${PORT}
📦 Environment: ${process.env.NODE_ENV || "development"}
🤖 AgriAI Enabled
`);
});
