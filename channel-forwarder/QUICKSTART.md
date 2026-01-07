# Quick Start - 5 Minutes to 24/7 Auto-Forward

Follow these steps to get your channel forwarder running 24/7 on Render.com (FREE).

## Prerequisites

- ✅ GitHub account
- ✅ Telegram account
- ✅ 5 minutes

## Step 1: Get Telegram API Credentials (2 minutes)

1. Open: https://my.telegram.org
2. Log in with your phone number
3. Click **"API development tools"**
4. Fill the form:
   - App title: `Link Manager Forwarder`
   - Short name: `linkforwarder`
   - Platform: `Other`
5. Click **"Create application"**
6. **Copy** your `api_id` and `api_hash` somewhere safe

## Step 2: Generate Session String (1 minute)

On your computer:

```bash
# Navigate to forwarder directory
cd telegram-link-manager/channel-forwarder

# Install dependencies
pip install telethon

# Run setup
python setup_session.py
```

Enter:
1. Your `api_id` from Step 1
2. Your `api_hash` from Step 1
3. Your phone number (e.g., `+12345678900`)
4. Verification code (sent to your Telegram)

**Copy the SESSION_STRING** (the long text that appears)

## Step 3: Push to GitHub (30 seconds)

```bash
cd ../..  # Back to telegram-link-manager root
git add .
git commit -m "Add channel forwarder"
git push
```

## Step 4: Deploy to Render (2 minutes)

1. Go to: https://render.com
2. **Sign up** (free, no credit card)
3. Click **"New +"** → **"Background Worker"**
4. **Connect GitHub** and select your repo
5. Configure:
   - **Name**: `channel-forwarder`
   - **Runtime**: `Python 3`
   - **Root Directory**: `channel-forwarder`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python forwarder.py`

6. Click **"Environment"** tab
7. Add these variables:

| Key | Value |
|-----|-------|
| `TELEGRAM_API_ID` | Your api_id from Step 1 |
| `TELEGRAM_API_HASH` | Your api_hash from Step 1 |
| `SESSION_STRING` | Your session from Step 2 |
| `BOT_USERNAME` | Your bot's @username |
| `CHANNELS_TO_MONITOR` | `@channel1,@channel2` (your channels) |

Example:
```
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abc123def456...
SESSION_STRING=1AgAOMTQ5...very_long_string...
BOT_USERNAME=@MyLinkBot
CHANNELS_TO_MONITOR=@technews,@articles
```

8. Click **"Create Background Worker"**

## Step 5: Test! (30 seconds)

1. Wait for deployment (1-2 minutes)
2. Go to **"Logs"** tab in Render
3. Look for: `✅ Forwarder is running!`
4. Post a link in one of your channels
5. Check logs: Should see `✅ Forwarded message...`
6. Check your bot: Message should arrive!
7. Check web interface: Link should be saved!

## 🎉 Done!

Your forwarder is now running 24/7, even when your computer is off!

---

## Common Issues

### "Could not find SESSION_STRING"
→ Make sure you added it as an environment variable in Render

### "Could not find the input entity"
→ Channel username is wrong. Use format: `@channelname` (with @)

### Session expired
→ Run `setup_session.py` again to get a new session string

---

## What's Next?

- Add more channels to `CHANNELS_TO_MONITOR`
- Check logs regularly for the first few days
- Restart backend of your Link Manager bot (to apply database changes)
- Test by forwarding a channel message!

---

## Need More Help?

- See **DEPLOYMENT_GUIDE.md** for detailed instructions
- See **README.md** for full documentation
- Check logs in Render dashboard for errors
