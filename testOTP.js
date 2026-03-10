const fetch = require("node-fetch"); // install if Node <18

(async () => {
  try {
    const res = await fetch("http://localhost:5000/register/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error:", err);
  }
})();
