const nodemailer = require("nodemailer");

// ================================
// Create Email Transporter
// ================================
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // avoids SSL issues on some hosts
  },
});

// ================================
// Verify Email Configuration
// ================================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error.message);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// ================================
// Send Password Reset Email
// ================================
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Farmer Marketplace" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Farmer Marketplace - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background:#2E8B57; padding:20px; color:white; text-align:center;">
            <h1>🌱 Farmer Marketplace</h1>
          </div>

          <div style="padding:20px;">
            <h2>Password Reset</h2>
            <p>You requested to reset your password.</p>
            <p>Click the button below to continue:</p>

            <div style="text-align:center; margin:20px;">
              <a href="${resetUrl}"
                 style="background:#2E8B57; color:white; padding:12px 25px;
                        text-decoration:none; border-radius:5px; font-weight:bold;">
                Reset Password
              </a>
            </div>

            <p>If the button doesn't work, copy this link:</p>
            <p style="background:#f4f4f4; padding:10px; border-radius:5px;">
              ${resetUrl}
            </p>

            <p style="color:#666; font-size:14px;">
              ⚠ This link will expire in <b>1 hour</b>.
            </p>

            <p>If you didn’t request this, ignore this email.</p>

            <hr>
            <p style="text-align:center; color:#777;">
              Farmer Marketplace Team
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Password reset email sent to ${email}`);

    return {
      success: true,
      messageId: result.messageId,
      previewUrl: nodemailer.getTestMessageUrl(result),
    };
  } catch (error) {
    console.error("❌ Password reset email failed:", error.message);
    return { success: false, error: error.message };
  }
};

// ================================
// Send Welcome Email
// ================================
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Farmer Marketplace" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Welcome to Farmer Marketplace 🌱",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2 style="color:#2E8B57;">Welcome, ${name}! 🎉</h2>
          <p>Your account has been created successfully.</p>
          <p>Start exploring fresh products and connect with farmers.</p>
          <p>Happy shopping! 🛒</p>
          <hr>
          <p style="color:#777;">Farmer Marketplace Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Welcome email failed:", error.message);
    return { success: false, error: error.message };
  }
};

// ================================
module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
