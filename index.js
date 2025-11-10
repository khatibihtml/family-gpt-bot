import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = process.env.BASE_URL;

const webhookUrl = `${BASE_URL}/${TELEGRAM_TOKEN}`;

// تنظیم وبهوک
const setWebhook = async () => {
  const res = await fetch(https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl});
  const data = await res.json();
  console.log("Webhook setup:", data);
};
setWebhook();

// هندل پیام‌ها
app.post(/${TELEGRAM_TOKEN}, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const userText = message.text;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": Bearer ${OPENROUTER_API_KEY},
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "تو یک دستیار فارسی‌زبان مودب و باهوش هستی." },
        { role: "user", content: userText }
      ]
    })
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";

  await fetch(https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: reply
    })
  });

  res.sendStatus(200);
});

app.listen(8443, () => console.log("🚀 Server running on port 8443"));
