import os
import logging
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

logging.basicConfig(level=logging.INFO)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("سلام! من ربات ChatGPT هستم از OpenRouter 🌍 بپرس تا جواب بدم!")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "gpt-4o-mini",  # مدل رایگان و سریع
        "messages": [
            {"role": "system", "content": "تو یک دستیار فارسی‌زبان مودب و باهوش هستی."},
            {"role": "user", "content": user_message},
        ],
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    if response.status_code == 200:
        reply = response.json()["choices"][0]["message"]["content"]
        await update.message.reply_text(reply)
    else:
        await update.message.reply_text("❌ خطا در دریافت پاسخ از سرور OpenRouter.")

app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

if _name_ == "_main_":
    print("🤖 ربات OpenRouter در حال اجراست...")
    app.run_polling()
