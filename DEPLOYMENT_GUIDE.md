# Complete Deployment Guide

**Date**: 2026-01-07
**Status**: Ready for Cloud Deployment
**Project**: Telegram Link Manager v6.1

---

## Table of Contents

1. [Publishing to GitHub](#1-publishing-to-github)
2. [Deploying Backend to Render](#2-deploying-backend-to-render)
3. [Deploying Frontend to Vercel](#3-deploying-frontend-to-vercel)
4. [Post-Deployment Configuration](#4-post-deployment-configuration)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Publishing to GitHub

### Prerequisites
- GitHub account created
- Git installed on your computer
- Repository cleaned of sensitive data ✅ (completed)

### Step 1.1: Verify Clean Repository

Open Command Prompt in your project folder and run:

```bash
cd C:\Users\PC\Desktop\claude\telegram-link-manager
git status
```

**Expected output**: Should NOT show any of these files:
- `.env` files
- `.session` files
- `.db` or `.sqlite` files
- `node_modules/` folders

**If you see sensitive files listed**, STOP and check your `.gitignore` files.

### Step 1.2: Initialize Git (if not already done)

```bash
git init
```

If you see "Reinitialized existing Git repository", that's fine - it means Git is already set up.

### Step 1.3: Stage All Files

```bash
git add .
```

### Step 1.4: Check What Will Be Committed

```bash
git status
```

Review the list carefully. Ensure:
- ✅ `.js`, `.jsx`, `.py`, `.md`, `.json` files are included
- ✅ `.gitignore` files are included
- ✅ `.env.example` file is included (template only)
- ❌ NO `.env` files (real credentials)
- ❌ NO `.session` files
- ❌ NO `.db` files

### Step 1.5: Create Commit

```bash
git commit -m "Clean deployment-ready version with channel forward feature

- Added manual channel forwarding feature
- Security cleanup: removed all private credentials
- Updated documentation
- Ready for production deployment"
```

### Step 1.6: Create GitHub Repository

**Option A: Via GitHub Website**

1. Go to https://github.com
2. Click the "+" icon (top right) → "New repository"
3. Fill in:
   - **Repository name**: `telegram-link-manager`
   - **Description**: "Telegram bot + web app for managing and organizing saved links"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (you already have files)
4. Click "Create repository"

**Option B: Via GitHub CLI** (if you have `gh` installed)

```bash
gh repo create telegram-link-manager --public --source=. --remote=origin --push
```

### Step 1.7: Link Local Repository to GitHub

Copy the commands from GitHub's "push an existing repository" section. They will look like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/telegram-link-manager.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

### Step 1.8: Verify Upload

1. Go to your GitHub repository URL
2. Check that all files are there
3. Click on a few files to verify content
4. **Critical**: Search for your bot token (`8488518827`) - should NOT appear anywhere

✅ **GitHub deployment complete!**

---

## 2. Deploying Backend to Render

### What Gets Deployed
- `backend/` folder (Node.js Express server + Telegram bot)
- Backend will run on Render's servers 24/7

### Prerequisites
- Render.com account (free tier available)
- GitHub repository created (from Step 1)

### Step 2.1: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended - easier deployment)

### Step 2.2: Create New Web Service

1. From Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository:
   - If first time: Click "Connect GitHub" and authorize Render
   - Select your `telegram-link-manager` repository
3. Click "Connect"

### Step 2.3: Configure Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `telegram-link-manager-backend` (or your choice)
- **Region**: Choose closest to you (e.g., Oregon USA, Frankfurt EU)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ IMPORTANT
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node bot.js`

**Instance Type:**
- Select "Free" (for testing) or "Starter" (for production)

### Step 2.4: Add Environment Variables

Scroll down to "Environment Variables" section and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `TELEGRAM_BOT_TOKEN` | `YOUR_NEW_BOT_TOKEN` | Get from @BotFather |
| `PORT` | `3000` | Backend server port |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Add after Vercel deployment |
| `NODE_ENV` | `production` | Optional |

**Getting a new bot token:**
1. Open Telegram and message @BotFather
2. Send `/newbot` or `/mybots` → Select your bot → "API Token" → "Generate New Token"
3. Copy the token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Paste into `TELEGRAM_BOT_TOKEN` field

⚠️ **DO NOT** use your old token `8488518827:AAGV...` - it was exposed in this conversation!

### Step 2.5: Deploy

1. Click "Create Web Service" at the bottom
2. Wait for deployment (takes 2-5 minutes)
3. Watch the logs for any errors

### Step 2.6: Verify Backend Deployment

Once deployed, you'll see:
- ✅ Green "Live" status indicator
- A URL like `https://telegram-link-manager-backend.onrender.com`

Check logs for:
```
✅ Telegram bot started successfully!
✅ Server running on port 3000
```

### Step 2.7: Update Telegram Bot Webhook (if using webhooks)

If your bot uses webhooks instead of polling:
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://telegram-link-manager-backend.onrender.com/webhook
```

✅ **Backend deployment complete!**

---

## 3. Deploying Frontend to Vercel

### What Gets Deployed
- `frontend/` folder (React/Vite web application)
- Frontend will be served via Vercel's CDN

### Prerequisites
- Vercel account (free tier available)
- GitHub repository created (from Step 1)

### Step 3.1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### Step 3.2: Import Project

1. From Vercel dashboard, click "Add New..." → "Project"
2. Click "Import" next to your `telegram-link-manager` repository
   - If not listed: Click "Adjust GitHub App Permissions" and grant access

### Step 3.3: Configure Project

**Framework Preset:**
- Vercel should auto-detect "Vite"
- If not, manually select "Vite"

**Root Directory:**
- Click "Edit" next to Root Directory
- Select `frontend` folder ⚠️ IMPORTANT
- Click "Continue"

**Build Settings:**
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Step 3.4: Add Environment Variables

Click "Environment Variables" and add:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_API_URL` | `https://telegram-link-manager-backend.onrender.com` | Backend URL from Render |

⚠️ Note: Vite requires `VITE_` prefix for environment variables.

### Step 3.5: Deploy

1. Click "Deploy"
2. Wait for build (takes 1-3 minutes)
3. Watch build logs for any errors

### Step 3.6: Verify Frontend Deployment

Once deployed:
- ✅ Green checkmark on deployment
- A URL like `https://telegram-link-manager.vercel.app`
- Click "Visit" to open your app

Test:
1. Open the Vercel URL in browser
2. Should see your Link Manager interface
3. Try searching, filtering (may be empty if no data yet)

✅ **Frontend deployment complete!**

---

## 4. Post-Deployment Configuration

### Step 4.1: Update CORS Settings

Your backend needs to allow requests from your Vercel frontend.

**Option A: Via Render Dashboard**

1. Go to Render dashboard → Your backend service
2. Environment → Add variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://telegram-link-manager.vercel.app` (your actual Vercel URL)
3. Click "Save Changes"
4. Backend will automatically redeploy

**Option B: Update backend/bot.js** (if needed)

If CORS errors occur, verify your `bot.js` has:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Step 4.2: Update Frontend API URL

Verify your frontend knows where to find the backend:

**File**: `frontend/src/config.js` or wherever API URL is defined

Should be:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

If you need to update:
1. Make changes locally
2. Commit: `git commit -am "Update API URL configuration"`
3. Push: `git push`
4. Vercel auto-deploys from GitHub

### Step 4.3: Test End-to-End

1. Open your Vercel frontend URL
2. Open Telegram and message your bot
3. Send a link: `https://example.com`
4. Check if link appears in web interface
5. Try forwarding a message from a channel
6. Verify it shows with `channel:name` tag

### Step 4.4: Set Up Custom Domains (Optional)

**For Vercel (Frontend):**
1. Go to project settings → Domains
2. Add your custom domain (e.g., `links.yourdomain.com`)
3. Update DNS records as shown

**For Render (Backend):**
1. Go to service settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as shown

✅ **Post-deployment configuration complete!**

---

## 5. Troubleshooting

### Issue: Backend Won't Start on Render

**Symptoms**: Service keeps crashing, logs show errors

**Solutions:**

1. **Check Node version**:
   - Render should use Node 20+
   - Add `engines` to `backend/package.json`:
     ```json
     "engines": {
       "node": ">=20.0.0"
     }
     ```

2. **Check environment variables**:
   - Verify `TELEGRAM_BOT_TOKEN` is set
   - Verify token is valid (test with @BotFather)

3. **Check logs**:
   - Click "Logs" tab in Render dashboard
   - Look for specific error messages

4. **Database initialization**:
   - sql.js should create `links.db` automatically
   - Check file system permissions

### Issue: Frontend Can't Connect to Backend

**Symptoms**: "Network error", "Failed to fetch", CORS errors

**Solutions:**

1. **Verify API URL**:
   - Check `VITE_API_URL` in Vercel environment variables
   - Should be full URL: `https://your-backend.onrender.com`

2. **Check CORS settings**:
   - Backend must have `FRONTEND_URL` set to Vercel URL
   - Verify `cors()` middleware is configured

3. **Check backend logs**:
   - See if requests are reaching backend
   - Look for CORS or 404 errors

4. **Test backend directly**:
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should return 200 OK

### Issue: Telegram Bot Not Responding

**Symptoms**: Messages to bot don't get responses

**Solutions:**

1. **Verify bot token**:
   - Check `TELEGRAM_BOT_TOKEN` in Render environment
   - Test token: Send message to bot in Telegram

2. **Check if bot is running**:
   - Render logs should show: "✅ Telegram bot started successfully!"

3. **Check for errors**:
   - Look at Render logs for API errors
   - Verify no rate limiting from Telegram

4. **Restart service**:
   - Render dashboard → Manual Deploy → "Clear build cache & deploy"

### Issue: Database Not Persisting

**Symptoms**: Links disappear after redeployment

**Solutions:**

1. **Render Free Tier Limitation**:
   - Free tier disk is ephemeral (resets on restart)
   - Need to upgrade to Starter plan for persistent disk

2. **Alternative**: Use external database:
   - PostgreSQL (Render provides free instance)
   - Update code to use PostgreSQL instead of SQLite
   - Requires code changes

### Issue: Build Fails on Vercel

**Symptoms**: "Build failed", errors during `npm run build`

**Solutions:**

1. **Check Node version**:
   - Add to `frontend/package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

2. **Check dependencies**:
   - Verify `package.json` is complete
   - Try locally: `cd frontend && npm run build`

3. **Environment variables**:
   - Ensure `VITE_API_URL` is set
   - Check for any missing env vars

4. **Root directory**:
   - Verify Root Directory is set to `frontend` in Vercel settings

### Issue: "Free Tier" Sleeping

**Symptoms**: First request after inactivity is slow or fails

**Solutions:**

1. **Render Free Tier**:
   - Backend sleeps after 15 minutes of inactivity
   - First request wakes it up (takes 30-60 seconds)
   - Upgrade to Starter ($7/month) to avoid sleeping

2. **Keep-alive service** (workaround):
   - Use a service like UptimeRobot to ping your backend every 14 minutes
   - Free tier limitation still applies

---

## Summary Checklist

### Before Deployment:
- [x] Deleted all `.env` files
- [x] Deleted all `.session` files
- [x] Deleted all `.db` files
- [x] Verified `.gitignore` is correct
- [x] Ran `git status` - no sensitive files

### GitHub:
- [ ] Created GitHub account
- [ ] Initialized git repository
- [ ] Verified no sensitive files staged
- [ ] Committed and pushed to GitHub
- [ ] Verified files on GitHub

### Render (Backend):
- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Added `TELEGRAM_BOT_TOKEN` environment variable
- [ ] Added `FRONTEND_URL` environment variable
- [ ] Deployed successfully
- [ ] Verified bot responds in Telegram

### Vercel (Frontend):
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Added `VITE_API_URL` environment variable
- [ ] Deployed successfully
- [ ] Verified web interface loads

### Post-Deployment:
- [ ] Updated backend CORS settings
- [ ] Tested bot → saves link
- [ ] Tested frontend → displays links
- [ ] Tested channel forwarding
- [ ] (Optional) Set up custom domains

---

## URLs and Credentials Tracker

Fill this in as you go:

**GitHub:**
- Repository URL: `https://github.com/YOUR_USERNAME/telegram-link-manager`

**Render (Backend):**
- Service URL: `https://telegram-link-manager-backend.onrender.com`
- Dashboard: `https://dashboard.render.com/web/YOUR_SERVICE_ID`

**Vercel (Frontend):**
- Production URL: `https://telegram-link-manager.vercel.app`
- Dashboard: `https://vercel.com/YOUR_USERNAME/telegram-link-manager`

**Telegram:**
- Bot Username: `@YourBot`
- Bot Token: `Store securely in password manager!`

---

## Getting Help

### Documentation
- GitHub: https://docs.github.com
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

### Community Support
- Render Community: https://community.render.com
- Vercel Discussions: https://github.com/vercel/vercel/discussions
- Telegram Bot API: https://core.telegram.org/bots/api

### Project-Specific
- Check `README.md` for feature documentation
- Check `claude.md` for technical details
- Check `CLEANUP_SUMMARY.md` for security info

---

**Last Updated**: 2026-01-07
**Version**: 1.0
**Status**: Production Ready ✅
