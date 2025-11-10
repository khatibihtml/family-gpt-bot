import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = "https://api.telegram.org";
const WEBHOOK_URL = "https://falkon-tfsh.onrender.com";

// ✅ دریافت پیام از تلگرام
app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  console.log("📩 پیام از تلگرام:", msg.text);

// 🧠 ارسال پیام به OpenRouter و دریافت پاسخ هوش مصنوعی
try {
  const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

  // ارسال پاسخ هوش مصنوعی به تلگرام
  await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: msg.chat.id,
      text: aiReply
    })
  });

} catch (err) {
  console.error("AI Error:", err);
}
  res.sendStatus(200);
});

// ✅ راه‌اندازی وبهوک
app.listen(8443, async () => {
  console.log("🚀 Server running on port 8443");
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}bot${TELEGRAM_TOKEN}`);
    const data = await res.json();
    console.log("Webhook setup:", data);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});
