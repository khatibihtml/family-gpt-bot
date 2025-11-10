import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 تنظیمات اصلی
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = "https://api.telegram.org";
const WEBHOOK_URL = "https://falkon.tfsh.onrender.com";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 📩 دریافت پیام از تلگرام
app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  console.log("📩 پیام از تلگرام:", msg.text);

  try {
    // 🧠 ارسال پیام به OpenRouter و دریافت پاسخ
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "تو یک دستیار فارسی‌زبان مودب و باهوش هستی." },
          { role: "user", content: msg.text }
        ]
      })
    });

    const data = await aiResponse.json();
    const aiReply = data?.choices?.[0]?.message?.content || "❌ پاسخی از هوش مصنوعی دریافت نشد.";

    // ✉ ارسال پاسخ به تلگرام
    await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: aiReply
      })
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("AI Error:", err);
    res.sendStatus(500);
  }
});

// ✅ راه‌اندازی وبهوک مخصوص Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    const webhookUrl = `${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`;
    console.log("🔗 Setting webhook to:", webhookUrl);

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`);
    const data = await res.json();
    console.log("📡 Webhook setup result:", data);
  } catch (err) {
    console.error("❌ Webhook error:", err);
  }
});
