import express from "express";
import crypto from "crypto";

const router = express.Router();
const otpStore = {}; // demo only (mention in viva)

router.post("/send", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
  };

  // For demo: return OTP
  res.json({ success: true, otp });
});

router.post("/verify", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record || record.expires < Date.now())
    return res.status(400).json({ success: false });

  if (parseInt(otp) !== record.otp)
    return res.status(400).json({ success: false });

  delete otpStore[email];
  res.json({ success: true });
});

export default router;
