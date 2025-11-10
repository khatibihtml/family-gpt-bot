// index.js
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// آدرس کامل سرویس روی Render را اینجا بده، مثلا: https://family-gpt-bot1.onrender.com
const BASE_URL = process.env.BASE_URL; 

if (!TELEGRAM_TOKEN || !OPENROUTER_API_KEY || !BASE_URL) {
  console.error("❌ لطفاً TELEGRAM_TOKEN، OPENROUTER_API_KEY و BASE_URL را در Env تنظیم کنید.");
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

// ساخت و تنظیم وبهوک
const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });
const webhookUrl = `${BASE_URL.replace(/\/+$/, "")}/${TELEGRAM_TOKEN}`;
const setHook = await bot.setWebHook(webhookUrl);
console.log("🌍 Webhook:", webhookUrl, " -> ", setHook);

// مسیر دریافت آپدیت‌ها از تلگرام
app.post(/${TELEGRAM_TOKEN}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// دستورات ساده
bot.onText(/^\/start\b/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "سلام 👋 من یک دستیار فارسی‌زبان هستم. آماده‌ام!");
});
bot.onText(/^\/ping\b/, async (msg) => {
  await bot.sendChatAction(msg.chat.id, "typing");
  await bot.sendMessage(msg.chat.id, "فعّالم ✅");
});

// پیام‌های عادی (PV/گروه)
bot.on("message", async (msg) => {
  try {
    if (!msg || msg.from?.is_bot) return;
    const text = msg.text?.trim();
    if (!text || text.startsWith("/")) return;

    await bot.sendChatAction(msg.chat.id, "typing");

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": Bearer ${OPENROUTER_API_KEY},
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "تو یک دستیار فارسی‌زبان مودب و باهوش هستی." },
          { role: "user", content: text }
        ]
      })
    });

    if (!r.ok) throw new Error(OpenRouter error: ${r.status});
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || "پاسخی دریافت نشد 😕";
    await bot.sendMessage(msg.chat.id, reply);
  } catch (e) {
    console.error(e);
    await bot.sendMessage(msg.chat.id, "⚠ خطای ارتباطی. کمی بعد دوباره تلاش کن.");
  }
});

const PORT = process.env.PORT || 8443;
app.listen(PORT, () => console.log(🚀 Server on ${PORT}));
