"""
Setup script to generate Telegram session for deployment
Run this locally once to get your session string
"""

from telethon import TelegramClient
from telethon.sessions import StringSession
import asyncio

# You'll need to get these from https://my.telegram.org
API_ID = input("Enter your API ID: ")
API_HASH = input("Enter your API HASH: ")

async def main():
    # Create client with StringSession
    client = TelegramClient(StringSession(), API_ID, API_HASH)

    await client.start()

    # Get the session string
    session_string = client.session.save()

    print("\n" + "="*50)
    print("✅ Successfully logged in!")
    print("="*50)
    print("\n📋 Copy this SESSION_STRING to your environment variables:")
    print("\n" + session_string)
    print("\n⚠️  Keep this secret! Don't share it publicly.")
    print("="*50)

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
