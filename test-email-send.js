// test-email-send.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async function run() {
  console.log('🔍 Checking SMTP configuration...');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  // Step 1 — verify credentials
  try {
    await transporter.verify();
    console.log('✅ SMTP verification success — credentials are valid!');
  } catch (err) {
    console.error('❌ SMTP verify FAILED:', err.message);
    process.exit(1);
  }

  // Step 2 — send test email
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TEST_TO || process.env.SMTP_USER,
      subject: 'Test OTP email (Farmer Marketplace)',
      text: 'This is a test email sent from your Farmer Marketplace backend to verify SMTP settings.'
    });

    console.log('📩 Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ sendMail error:', err.message);
  }

  process.exit(0);
})();
