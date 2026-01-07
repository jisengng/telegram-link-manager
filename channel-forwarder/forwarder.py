"""
Telegram Channel Auto-Forwarder
Monitors specified channels and forwards messages with links to your bot
"""

from telethon import TelegramClient, events
import asyncio
import os
import logging

# Load .env file if it exists (for local testing)
try:
    from dotenv import load_dotenv
    if os.path.exists('.env'):
        load_dotenv()
        logger = logging.getLogger(__name__)
        logger.info("Loaded configuration from .env file")
except ImportError:
    pass  # python-dotenv not installed (production)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration from environment variables
API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
BOT_USERNAME = os.getenv('BOT_USERNAME', '@YourLinkManagerBot')
SESSION_STRING = os.getenv('SESSION_STRING', None)

# Channels to monitor (comma-separated in env var)
CHANNELS_STR = os.getenv('CHANNELS_TO_MONITOR', '')
CHANNELS = [ch.strip() for ch in CHANNELS_STR.split(',') if ch.strip()]

if not API_ID or not API_HASH:
    raise ValueError("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in environment variables")

if not CHANNELS:
    raise ValueError("CHANNELS_TO_MONITOR must be set (comma-separated list)")

# Create client
if SESSION_STRING:
    # Use session string for deployed environments
    client = TelegramClient('forwarder', API_ID, API_HASH)
else:
    # Use file-based session for local testing
    client = TelegramClient('forwarder_session', API_ID, API_HASH)

@client.on(events.NewMessage(chats=CHANNELS))
async def forward_handler(event):
    """Forward messages with links to the bot"""
    try:
        message = event.message
        text = message.message or message.caption or ''
        channel_name = event.chat.title if event.chat else 'Unknown'

        # Log ALL messages received (for debugging)
        logger.info(f"📨 New message in '{channel_name}': {text[:50]}...")

        # Check if message contains links
        if 'http://' in text or 'https://' in text:
            logger.info(f"🔗 Message contains link, forwarding...")

            # Forward to bot
            await client.forward_messages(BOT_USERNAME, message)

            logger.info(f"✅ Forwarded message from '{channel_name}' to {BOT_USERNAME}")
        else:
            logger.info(f"⏭️  No link in message, skipping")

    except Exception as e:
        logger.error(f"❌ Error forwarding message: {e}")

async def main():
    """Main entry point"""
    try:
        # Start the client
        await client.start()

        # Get current user info
        me = await client.get_me()
        logger.info(f"✅ Logged in as: {me.first_name} (@{me.username})")
        logger.info(f"✅ Monitoring {len(CHANNELS)} channels")
        logger.info(f"✅ Forwarding to: {BOT_USERNAME}")

        for channel in CHANNELS:
            logger.info(f"  📢 Monitoring: {channel}")

        logger.info("🚀 Forwarder is running! Press Ctrl+C to stop.")

        # Keep running
        await client.run_until_disconnected()

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())
