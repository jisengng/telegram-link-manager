"""
Local testing script for the channel forwarder
Run this to test before deploying
"""

import os
import sys

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...\n")

    errors = []

    # Check Python version
    if sys.version_info < (3, 8):
        errors.append("❌ Python 3.8+ required")
    else:
        print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")

    # Check dependencies
    try:
        import telethon
        print(f"✅ Telethon installed (v{telethon.__version__})")
    except ImportError:
        errors.append("❌ Telethon not installed: pip install telethon")

    # Check environment variables
    required_vars = [
        'TELEGRAM_API_ID',
        'TELEGRAM_API_HASH',
        'BOT_USERNAME',
        'CHANNELS_TO_MONITOR'
    ]

    # Try to load from .env file
    if os.path.exists('.env'):
        print("✅ .env file found")
        from dotenv import load_dotenv
        load_dotenv()
    else:
        print("⚠️  No .env file (checking system environment variables)")

    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'HASH' in var or 'SESSION' in var:
                display = value[:10] + "..." if len(value) > 10 else value
            else:
                display = value
            print(f"✅ {var}: {display}")
        else:
            errors.append(f"❌ Missing: {var}")

    # Check optional SESSION_STRING
    session = os.getenv('SESSION_STRING')
    if session:
        print(f"✅ SESSION_STRING: {session[:20]}...")
    else:
        print("ℹ️  No SESSION_STRING (will create session file)")

    print()

    if errors:
        print("❌ Errors found:\n")
        for error in errors:
            print(f"   {error}")
        print("\n💡 Fix these issues before running the forwarder")
        return False
    else:
        print("✅ All checks passed! Ready to run.\n")
        return True

def main():
    print("=" * 60)
    print("Telegram Channel Forwarder - Local Test")
    print("=" * 60)
    print()

    if check_requirements():
        print("To start the forwarder, run:")
        print("  python forwarder.py")
        print()
        print("Press Ctrl+C to stop")
    else:
        print("\nSetup steps:")
        print("1. Create .env file with your configuration")
        print("2. Or run: python setup_session.py")
        print("3. Then run this test again")

if __name__ == '__main__':
    main()
