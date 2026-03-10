const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const isProduction = process.env.NODE_ENV === "production";

// Initialize Twilio client only if credentials exist
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// ================================
// Send OTP via SMS (Twilio / Fallback)
// ================================
const sendSmsOtp = async (phone, otp) => {
  try {
    // If Twilio not configured → console fallback
    if (!client || !twilioPhone) {
      console.log(`📱 OTP for ${phone}: ${otp} (Twilio not configured)`);
      return { success: true, messageId: "console" };
    }

    const message = await client.messages.create({
      body: `Your Farmer Marketplace OTP is ${otp}. Valid for 5 minutes.`,
      from: twilioPhone,
      to: phone,
    });

    console.log(`✅ OTP sent to ${phone} | SID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
    console.log(`📱 FALLBACK OTP for ${phone}: ${otp}`);
    return { success: true, messageId: "console-fallback" };
  }
};

// ================================
// Development Console OTP
// ================================
const sendConsoleOtp = async (phone, otp) => {
  console.log(`📱 DEVELOPMENT OTP for ${phone}: ${otp}`);
  return { success: true, messageId: "console-dev" };
};

// ================================
// Export Based on Environment
// ================================
module.exports = {
  sendSmsOtp: isProduction ? sendSmsOtp : sendConsoleOtp,
};
