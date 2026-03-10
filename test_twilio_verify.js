// test_twilio_verify.js
require('dotenv').config();
const twilio = require('twilio');

console.log("env check:", {
  account: !!process.env.TWILIO_ACCOUNT_SID,
  token: !!process.env.TWILIO_AUTH_TOKEN,
  verify: !!process.env.TWILIO_VERIFY_SERVICE_SID
});

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

(async () => {
  try {
    const verification = await client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: '+91YOURNUMBER', channel: 'sms' });
    console.log('verify create success', verification);
  } catch (err) {
    console.error('verify create error full:', err);
    console.error('code:', err.code, 'moreInfo:', err.moreInfo);
  }
})();
