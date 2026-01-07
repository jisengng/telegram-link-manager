# Quick Deployment Guide - 24/7 Channel Forwarder

This guide walks you through deploying the channel forwarder to run 24/7, even when your computer is off.

## 🎯 Recommended: Render.com (Easiest, FREE)

### Why Render?
- ✅ 750 free hours per month (enough for 24/7)
- ✅ Auto-deploys from GitHub
- ✅ Simple environment variable setup
- ✅ Free tier doesn't require credit card
- ✅ Automatic restarts if script crashes

### Step-by-Step Setup

#### 1. Get Your Telegram Credentials

**A. Get API Credentials** (one-time setup):
1. Go to https://my.telegram.org
2. Log in with your phone number
3. Click "API development tools"
4. Fill in the form:
   - **App title**: "Link Manager Forwarder"
   - **Short name**: "linkforwarder"
   - **Platform**: Other
5. Click "Create application"
6. **Copy** your `api_id` and `api_hash`

**B. Generate Session String**:

On your computer:
```bash
cd channel-forwarder
pip install telethon
python setup_session.py
```

Enter:
- Your API ID
- Your API HASH
- Your phone number (when prompted)
- Verification code (sent to Telegram)

**Copy the SESSION_STRING** - it's a long string that looks like:
```
1AgAOMTQ5LjE1NC4xNjcuNDEBuwZ5...very_long_string...
```

⚠️ **IMPORTANT**: Keep this secret! It's like a password to your Telegram account.

#### 2. Push to GitHub

If you haven't already:

```bash
cd telegram-link-manager
git add .
git commit -m "Add channel forwarder"
git push
```

#### 3. Deploy to Render

**A. Sign up for Render**:
1. Go to https://render.com
2. Sign up (free, no credit card needed)
3. Connect your GitHub account

**B. Create New Service**:
1. Click "New +" → "Background Worker"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `channel-forwarder`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r channel-forwarder/requirements.txt`
   - **Start Command**: `python channel-forwarder/forwarder.py`

**C. Add Environment Variables**:
Click "Environment" tab and add:

| Key | Value |
|-----|-------|
| `TELEGRAM_API_ID` | Your api_id from step 1A |
| `TELEGRAM_API_HASH` | Your api_hash from step 1A |
| `SESSION_STRING` | Your session string from step 1B |
| `BOT_USERNAME` | Your bot username (e.g., `@MyLinkBot`) |
| `CHANNELS_TO_MONITOR` | Comma-separated: `@channel1,@channel2` |

Example:
```
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
SESSION_STRING=1AgAOMTQ5LjE1NC4xNjcuNDEBuwZ5...
BOT_USERNAME=@MyLinkManagerBot
CHANNELS_TO_MONITOR=@technews,@articles,@links
```

**D. Deploy**:
1. Click "Create Background Worker"
2. Wait for deployment (1-2 minutes)
3. Check logs to see: "✅ Forwarder is running!"

#### 4. Test It!

1. Post a link in one of your monitored channels
2. Check Render logs - should see: "✅ Forwarded message..."
3. Check your bot - should receive the forwarded message
4. Check web interface - link should be saved!

---

## 🚀 Alternative: Railway.app (Also FREE)

### Why Railway?
- ✅ 500 free hours per month
- ✅ Simpler interface than Render
- ✅ GitHub integration
- ✅ Easy logs viewing

### Setup:

1. **Sign up**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Variables**:
   - Same environment variables as Render
5. **Add Start Command**:
   ```
   python channel-forwarder/forwarder.py
   ```
6. **Deploy**!

---

## 💰 Alternative: Oracle Cloud Free Tier (Best for 24/7)

### Why Oracle?
- ✅ **Forever free** (not a trial)
- ✅ Always-on VM (no sleep)
- ✅ 1GB RAM, 1 CPU
- ✅ 100% uptime
- ✅ No time limits

### Setup:

1. **Sign up**: https://cloud.oracle.com/free
2. **Create Compute Instance**:
   - Shape: VM.Standard.A1.Flex (ARM - free forever)
   - Image: Ubuntu 22.04
   - Boot volume: 50GB
3. **SSH into instance**:
   ```bash
   ssh ubuntu@<your-instance-ip>
   ```
4. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip git
   ```
5. **Clone your repo**:
   ```bash
   git clone <your-repo-url>
   cd telegram-link-manager/channel-forwarder
   pip3 install -r requirements.txt
   ```
6. **Create .env file**:
   ```bash
   nano .env
   ```

   Add:
   ```env
   TELEGRAM_API_ID=12345678
   TELEGRAM_API_HASH=your_hash
   SESSION_STRING=your_session
   BOT_USERNAME=@YourBot
   CHANNELS_TO_MONITOR=@channel1,@channel2
   ```

   Save: `Ctrl+X`, `Y`, `Enter`

7. **Create systemd service** (runs on boot):
   ```bash
   sudo nano /etc/systemd/system/channel-forwarder.service
   ```

   Add:
   ```ini
   [Unit]
   Description=Telegram Channel Forwarder
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/telegram-link-manager/channel-forwarder
   Environment="PATH=/home/ubuntu/.local/bin:/usr/local/bin:/usr/bin:/bin"
   EnvironmentFile=/home/ubuntu/telegram-link-manager/channel-forwarder/.env
   ExecStart=/usr/bin/python3 forwarder.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

8. **Start the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable channel-forwarder
   sudo systemctl start channel-forwarder
   ```

9. **Check status**:
   ```bash
   sudo systemctl status channel-forwarder
   ```

10. **View logs**:
    ```bash
    sudo journalctl -u channel-forwarder -f
    ```

---

## 📊 Comparison

| Platform | Cost | Uptime | Setup | Best For |
|----------|------|--------|-------|----------|
| **Render.com** | FREE | 750hrs/mo | Easy | Quick start |
| **Railway.app** | FREE | 500hrs/mo | Easy | Simple projects |
| **Oracle Cloud** | FREE forever | 24/7 | Medium | Long-term |
| **VPS (DO/Linode)** | $5-10/mo | 24/7 | Medium | Full control |

---

## 🔍 Monitoring Your Forwarder

### Render/Railway:
- Go to dashboard
- Click on your service
- View "Logs" tab
- Should see: "✅ Forwarded message from..."

### Oracle/VPS:
```bash
# View logs
sudo journalctl -u channel-forwarder -f

# Restart service
sudo systemctl restart channel-forwarder

# Stop service
sudo systemctl stop channel-forwarder
```

---

## 🆘 Troubleshooting

### Forwarder not starting:
1. Check environment variables are set correctly
2. Verify SESSION_STRING is valid (no spaces/line breaks)
3. Check logs for errors

### Session expired:
Run `setup_session.py` again to get a new session string.

### Messages not forwarding:
1. Check you're subscribed to the channels
2. Verify channel usernames are correct (include @)
3. Ensure messages contain http:// or https://

### Service keeps crashing:
1. Check Python version (should be 3.8+)
2. Verify all dependencies installed
3. Check logs for specific errors

---

## 🎉 You're Done!

Your forwarder is now running 24/7!

**What happens now:**
1. New messages with links appear in monitored channels
2. Forwarder automatically forwards them to your bot
3. Bot detects channel source and saves links
4. Links appear in your web interface with channel tags

**To add more channels:**
- Update `CHANNELS_TO_MONITOR` environment variable
- Restart the service
- Done!

---

## 💡 Pro Tips

1. **Test locally first**: Run the script on your computer before deploying
2. **Monitor logs**: Check regularly for the first few days
3. **Start small**: Monitor 1-2 channels first, then add more
4. **Use channel IDs**: More reliable than @usernames (get from Telegram)
5. **Backup your session**: Keep SESSION_STRING in a safe place

---

Need help? Check the main README.md or the CHANNEL_FORWARD_GUIDE.md
