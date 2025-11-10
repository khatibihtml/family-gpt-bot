import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🧩 توکن ربات و URLها
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = "https://api.telegram.org";
const WEBHOOK_URL = "https://falkon-itsh.onrender.com";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 📩 مسیر دریافت پیام از تلگرام
app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  console.log("📥 Webhook called:", req.body); // برای بررسی لاگ
  const message = req.body.message;

  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const userText = message.text;

  try {
    // ارسال پیام به OpenRouter (مدل GPT)
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userText }],
      }),
    });

    const data = await aiResponse.json();
    const aiReply = data.choices?.[0]?.message?.content || "پاسخی دریافت نشد 😔";

    // ارسال پاسخ به کاربر
    await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: aiReply,
      }),
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }

  res.sendStatus(200);
});

// 🚀 راه‌اندازی سرور و تنظیم وبهوک
app.listen(8443, async () => {
  console.log("🚀 Server running on port 8443");

  try {
    const res = await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
    const data = await res.json();
    console.log("Webhook setup:", data);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});
