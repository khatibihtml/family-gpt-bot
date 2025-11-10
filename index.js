import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = "https://api.telegram.org";
const WEBHOOK_URL = "https://falkon-itsh.onrender.com";

// ✅ دریافت پیام از تلگرام
app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  console.log("📩 پیام از تلگرام:", msg.text);

  // پاسخ ساده تستی برای اطمینان
  const replyText = "✅ بات با موفقیت وصله!";

  await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: msg.chat.id,
      text: replyText,
    }),
  });

  res.sendStatus(200);
});

// ✅ راه‌اندازی وبهوک
app.listen(8443, async () => {
  console.log("🚀 Server running on port 8443");
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
    const data = await res.json();
    console.log("Webhook setup:", data);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});
