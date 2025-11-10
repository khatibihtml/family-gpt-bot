import express from "express";
import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";

const app = express();
app.use(express.json());

// ---------------------- تنظیمات اصلی ----------------------
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://api.telegram.org";
const WEBHOOK_URL = "https://falkon-itsh.onrender.com";

// ساخت ربات تلگرام
const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });
bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);

// ---------------------- واکنش به پیام ----------------------
bot.on("message", async (msg) => {
  console.log("📩 Message received:", msg.text);

  const userText = msg.text || "";
  bot.sendMessage(msg.chat.id, "✅ پیام‌ات رسید! در حال فکر کردن...");

  try {
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
    const aiReply = data.choices?.[0]?.message?.content || "❌ پاسخی از هوش مصنوعی دریافت نشد.";
    bot.sendMessage(msg.chat.id, aiReply);
  } catch (err) {
    console.error("AI error:", err);
    bot.sendMessage(msg.chat.id, "🚫 خطا در پاسخ هوش مصنوعی.");
  }
});

// ---------------------- سرور اکسپرس ----------------------
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log("🚀 Server running on port 8443");

  try {
    const res = await fetch(`${BASE_URL}/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
    const data = await res.json();
    console.log("Webhook setup:", data);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});
