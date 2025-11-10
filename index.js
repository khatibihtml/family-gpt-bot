import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `https://${process.env.RENDER_EXTERNAL_URL}/${TELEGRAM_TOKEN}`;

app.post(`/${TELEGRAM_TOKEN}`, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const userText = message.text;

  try {
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userText }]
      })
    });

    const data = await aiResponse.json();
    const reply = data?.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";

    await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: reply
      })
    });
  } catch (err) {
    console.error("Error:", err);
  }

  res.sendStatus(200);
});

app.listen(8443, async () => {
  console.log("🚀 Server running on port 8443");

  try {
    const res = await fetch(`${BASE_URL}/setWebhook?url=${WEBHOOK_URL}`);
    const data = await res.json();
    console.log("Webhook setup:", data);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});
