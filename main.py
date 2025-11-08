import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from openai import OpenAI

# فعال کردن لاگ‌ها برای دیباگ راحت‌تر
logging.basicConfig(level=logging.INFO)

# دریافت توکن‌ها از محیط
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
OPENAI_KEY = os.getenv("OPENAI_KEY")

# بررسی برای اطمینان از وجود کلیدها
if not TELEGRAM_TOKEN:
    raise ValueError("❌ TELEGRAM_TOKEN تنظیم نشده است!")
if not OPENAI_KEY:
    raise ValueError("❌ OPENAI_KEY تنظیم نشده است!")

# اتصال به OpenAI
client = OpenAI(api_key=OPENAI_KEY)

# دستور /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("سلام! من ربات خانوادگی ChatGPT هستم 🤖 بپرس تا جواب بدم!")

# پاسخ به پیام‌های کاربران
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    logging.info(f"📩 پیام کاربر: {user_message}")

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "تو یک ربات مودب و باهوش فارسی‌زبان هستی."},
                {"role": "user", "content": user_message}
            ]
        )
        reply = response.choices[0].message.content
        await update.message.reply_text(reply)
    except Exception as e:
        logging.error(f"❗ خطا در پاسخ OpenAI: {e}")
        await update.message.reply_text("متأسفم، مشکلی پیش آمده 😔")

# ساخت و اجرای اپ
app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

if _name_ == "_main_":
    print("🤖 ربات در حال اجراست...")
    app.run_polling()
