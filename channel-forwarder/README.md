# Telegram Channel Auto-Forwarder

This script monitors specified Telegram channels and automatically forwards messages containing links to your Link Manager bot.

## Features

- ✅ Monitors multiple channels simultaneously
- ✅ Auto-forwards messages with links only
- ✅ Runs 24/7 on cloud platforms
- ✅ Preserves channel attribution
- ✅ Lightweight and efficient

## Prerequisites

1. **Telegram API Credentials**
   - Go to https://my.telegram.org
   - Log in with your phone number
   - Click "API development tools"
   - Create an app to get `api_id` and `api_hash`

2. **Your Bot Username**
   - Get your Link Manager bot's username (e.g., `@MyLinkManagerBot`)

3. **Channel Usernames**
   - List of channels to monitor (e.g., `@technews`, `@articles`)

## Setup

### Step 1: Install Dependencies

```bash
cd channel-forwarder
pip install -r requirements.txt
```

### Step 2: Get Your Session String

Run the setup script locally (only once):

```bash
python setup_session.py
```

Enter your:
- API ID
- API HASH
- Phone number (when prompted)
- Verification code (sent to your Telegram)

**Important**: Copy the SESSION_STRING output. You'll need it for deployment.

### Step 3: Test Locally

Create a `.env` file:

```env
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
BOT_USERNAME=@YourLinkManagerBot
CHANNELS_TO_MONITOR=@channel1,@channel2,@channel3
SESSION_STRING=your_session_string_from_step2
```

Run:

```bash
python forwarder.py
```

Test by posting a link in one of your monitored channels!

## Deployment Options

### Option A: Render.com (Recommended - FREE)

1. **Push to GitHub** (if not already):
```bash
git add .
git commit -m "Add channel forwarder"
git push
```

2. **Update render.yaml**:
Add a new service for the forwarder (or deploy separately).

3. **Set Environment Variables** in Render dashboard:
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - `BOT_USERNAME`
   - `CHANNELS_TO_MONITOR`
   - `SESSION_STRING`

4. **Deploy**: Render will automatically run the script 24/7

### Option B: Railway.app (Alternative - FREE tier)

1. Sign up at https://railway.app
2. Create new project
3. Deploy from GitHub
4. Set environment variables
5. Railway keeps it running 24/7

### Option C: Heroku (Free tier ended, but still popular)

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   worker: python channel-forwarder/forwarder.py
   ```
3. Deploy:
   ```bash
   heroku create
   heroku config:set TELEGRAM_API_ID=...
   heroku config:set TELEGRAM_API_HASH=...
   heroku config:set BOT_USERNAME=...
   heroku config:set CHANNELS_TO_MONITOR=...
   heroku config:set SESSION_STRING=...
   git push heroku main
   heroku ps:scale worker=1
   ```

### Option D: Google Cloud Run / AWS Lambda

More complex but very reliable. Let me know if you want instructions.

### Option E: Oracle Cloud Free Tier

Oracle offers an always-free VM instance:
- 1GB RAM
- ARM or AMD CPU
- Ubuntu/Linux
- 100% uptime

Perfect for this script!

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_API_ID` | Your API ID from my.telegram.org | `12345678` |
| `TELEGRAM_API_HASH` | Your API hash | `abcdef1234567890...` |
| `BOT_USERNAME` | Your bot's username | `@MyLinkBot` |
| `CHANNELS_TO_MONITOR` | Comma-separated channel list | `@tech,@news,@articles` |
| `SESSION_STRING` | Session from setup_session.py | Long string... |

### Adding/Removing Channels

Update the `CHANNELS_TO_MONITOR` environment variable:

```env
CHANNELS_TO_MONITOR=@channel1,@channel2,@channel3
```

Or use channel IDs (get from Telegram):

```env
CHANNELS_TO_MONITOR=-1001234567890,-1009876543210
```

## How It Works

1. Script connects to Telegram using your account
2. Monitors specified channels for new messages
3. When a message contains `http://` or `https://`:
   - Forwards the entire message to your bot
   - Preserves channel attribution
4. Your bot (already updated) detects it's forwarded from a channel
5. Bot extracts links and saves with channel info

## Security

- ✅ Session string is encrypted
- ✅ Only forwards to your specific bot
- ✅ Only monitors channels you specify
- ✅ No data storage or logging of message content
- ⚠️  Keep your SESSION_STRING secret!
- ⚠️  Don't share your .env file

## Troubleshooting

### "Could not find the input entity"

**Problem**: Channel username is incorrect

**Solution**:
- Use correct format: `@channelname` (with @)
- Or use channel ID: `-1001234567890`
- Make sure you're subscribed to the channel

### "Session expired"

**Problem**: Session string is invalid

**Solution**: Run `setup_session.py` again to get a new session string

### "Bot not responding"

**Problem**: Bot might be offline

**Solution**:
- Check your Link Manager bot is running
- Verify bot username is correct
- Test by manually forwarding a message

### Logs show "Forwarded" but bot doesn't save

**Problem**: Bot might not detect forwarded messages

**Solution**:
- Restart your Link Manager bot backend
- Check backend logs for errors
- Verify database has `source` and `source_name` columns

## Monitoring

The script logs all activity:

```
2026-01-07 10:30:00 - INFO - ✅ Logged in as: John Doe (@johndoe)
2026-01-07 10:30:00 - INFO - ✅ Monitoring 3 channels
2026-01-07 10:30:00 - INFO -   📢 Monitoring: @technews
2026-01-07 10:30:00 - INFO -   📢 Monitoring: @articles
2026-01-07 10:30:00 - INFO -   📢 Monitoring: @links
2026-01-07 10:30:00 - INFO - 🚀 Forwarder is running!
2026-01-07 10:35:00 - INFO - ✅ Forwarded message from 'Tech News' to @MyBot
```

## Cost

- **Render.com Free Tier**: $0/month (750 hours free)
- **Railway.app Free Tier**: $0/month (500 hours free)
- **Oracle Cloud Free Tier**: $0/month forever
- **VPS (DigitalOcean/Linode)**: $5-10/month

## Limitations

- Telegram API has rate limits (30 requests/second)
- Free tier hosting may sleep after inactivity (use cron jobs to ping)
- Session expires if you log out from Telegram

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Test locally first before deploying
4. Ensure your bot backend is running

## Privacy & Terms

- This uses your personal Telegram account
- You're responsible for following Telegram's Terms of Service
- Don't use for spam or abuse
- Only monitor channels you have permission to access

---

**Last Updated**: 2026-01-07
