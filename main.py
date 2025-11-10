// index.js
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const RENDER_EXTERNAL_HOSTNAME = process.env.RENDER_EXTERNAL_HOSTNAME;

if (!TELEGRAM_TOKEN || !OPENROUTER_API_KEY || !RENDER_EXTERNAL_HOSTNAME) {
  console.error("❌ لطفاً TELEGRAM_TOKEN، OPENROUTER_API_KEY و RENDER_EXTERNAL_HOSTNAME را ست کنید.");
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

// وبهوک با TLS خود Render
const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });
const webhookUrl = https://${RENDER_EXTERNAL_HOSTNAME}/${TELEGRAM_TOKEN};
await bot.setWebHook(webhookUrl);
console.log("🌍 Webhook:", webhookUrl);

// سرور Express برای دریافت آپدیت‌ها
app.post(/${TELEGRAM_TOKEN}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 8443;
app.listen(PORT, () => console.log(🚀 Server on ${PORT}));

// --- handlers --- //

// /start (PV یا گروه)
bot.onText(/^\/start\b/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "سلام 👋 من یک دستیار فارسی‌زبان هستم. آماده‌ام!"
  );
});

// تست سلامت در گروه‌ها
bot.onText(/^\/ping\b/, async (msg) => {
  await bot.sendChatAction(msg.chat.id, "typing");
  await bot.sendMessage(msg.chat.id, "فعّالم ✅");
});

// پیام‌های عادی (PV/گروه) — فعلاً فقط لاگ و یک پاسخ ساده
bot.on("message", async (msg) => {
  try {
    // جلوگیری از لوپ/بات‌ها
    if (!msg || msg.from?.is_bot) return;

    const chatType = msg.chat?.type; // "private" | "group" | "supergroup" | ...
    const text = msg.text?.trim();

    // پیام‌های فرمانی /... رو اینجا هندل نکنیم
    if (text?.startsWith("/")) return;

    // فقط برای تست: اگر در گروه پیام رسید، یک پاسخ کوتاه بدهیم
    if (chatType === "group" || chatType === "supergroup") {
      await bot.sendChatAction(msg.chat.id, "typing");
      await bot.sendMessage(
        msg.chat.id,
        "پیام گروه دریافت شد ✅ (مرحله ۱). به‌زودی پاسخ‌دهی خودکار منطقی فعال می‌شود."
      );
    }
  } catch (err) {
    console.error("on message error:", err);
  }
});
