# Fix Vercel "Failed to load data" Error

**Issue**: Frontend shows "Failed to load data. Make sure the backend server is running."

**Cause**: Frontend can't connect to backend due to missing environment variables or CORS issues.

---

## Quick Fix Steps

### Step 1: Get Your Backend URL

1. Go to https://dashboard.render.com
2. Click on your backend service (e.g., `telegram-link-manager-backend`)
3. Copy the URL at the top (looks like: `https://telegram-link-manager-backend.onrender.com`)

**Important**: Copy the FULL URL including `https://`

---

### Step 2: Test Backend is Working

Open this URL in your browser (replace with YOUR backend URL):

```
https://YOUR-BACKEND-URL.onrender.com/api/health
```

**Expected response**:
```json
{"status":"ok","timestamp":"2026-01-07T..."}
```

**If you see this**: ✅ Backend is working!

**If you see error or timeout**:
- Wait 30-60 seconds (free tier wakes up from sleep)
- Refresh the page
- If still not working, check Render logs (Step 7 below)

---

### Step 3: Add Environment Variable to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project (`telegram-link-manager` or similar)
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar
5. Add new environment variable:

   **Name**: `VITE_API_URL`

   **Value**: `https://YOUR-BACKEND-URL.onrender.com/api`

   ⚠️ **IMPORTANT**: Add `/api` at the end!

   Example: `https://telegram-link-manager-backend.onrender.com/api`

6. Select **All** (Production, Preview, Development)
7. Click **"Save"**

---

### Step 4: Add Environment Variable to Render

1. Go back to https://dashboard.render.com
2. Click on your backend service
3. Click **"Environment"** tab in left sidebar
4. Click **"Add Environment Variable"**
5. Add:

   **Key**: `FRONTEND_URL`

   **Value**: Your Vercel URL (e.g., `https://telegram-link-manager.vercel.app`)

   ⚠️ **Do NOT add** `/api` or anything else - just the domain!

6. Click **"Save Changes"**

---

### Step 5: Redeploy Both Services

**Render (Backend)**:
1. Your service will automatically redeploy after adding environment variable
2. Wait for "Live" status (takes 1-2 minutes)
3. Check logs to verify: "✅ Server running on port 3000"

**Vercel (Frontend)**:
1. In Vercel dashboard → Your project → "Deployments" tab
2. Click the **"..."** menu on latest deployment → "Redeploy"
3. ✅ Check "Use existing Build Cache"
4. Click **"Redeploy"**
5. Wait for deployment (takes 1-2 minutes)

---

### Step 6: Test Your App

1. Open your Vercel URL in browser
2. Wait a few seconds for the page to load
3. You should now see your links interface (may be empty if no data yet)

**If still not working**, continue to Step 7.

---

### Step 7: Check Logs for Errors

**Check Render Logs (Backend)**:
1. Render dashboard → Your service → "Logs" tab
2. Look for errors or CORS messages
3. Should see: `✅ Server running on port 3000`

**Common issues in logs**:
- `ECONNREFUSED` → Backend not started
- `CORS` error → Frontend URL not whitelisted
- `Database error` → Database not initialized

**Check Vercel Logs (Frontend)**:
1. Vercel dashboard → Your project → "Deployments" tab
2. Click on latest deployment
3. Click "View Function Logs" or "Build Logs"
4. Look for console errors

**Common issues**:
- `Network Error` → Backend URL not set
- `404` → Wrong API URL (missing `/api`)
- `CORS policy` → FRONTEND_URL not set in Render

---

## Environment Variables Checklist

### Vercel (Frontend) Should Have:

| Variable | Example Value | Required |
|----------|---------------|----------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | ✅ YES |

**Note**: Must start with `VITE_` for Vite to recognize it!

### Render (Backend) Should Have:

| Variable | Example Value | Required |
|----------|---------------|----------|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABCdef...` | ✅ YES |
| `PORT` | `3000` | Auto-set by Render |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ YES |
| `NODE_ENV` | `production` | Optional |

---

## Testing Checklist

Once both are deployed, test in this order:

### ✅ Backend Health Check
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
```
Should return: `{"status":"ok",...}`

### ✅ Backend API Test
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/links
```
Should return: JSON array of links (may be empty: `[]`)

### ✅ Frontend Loads
Open your Vercel URL in browser - should see interface

### ✅ End-to-End Test
1. Open Telegram
2. Send link to your bot
3. Bot responds: "✅ Link Saved!"
4. Refresh Vercel page
5. Link appears in interface

---

## Common Issues and Solutions

### Issue 1: "Failed to load data" (CORS Error)

**Symptoms**:
- Console shows: `Access to XMLHttpRequest blocked by CORS policy`
- Frontend loads but shows error message

**Solution**:
1. Check `FRONTEND_URL` is set in Render environment variables
2. Verify it matches your Vercel URL exactly (no trailing slash)
3. Redeploy backend after adding variable
4. Check Render logs for CORS errors

---

### Issue 2: Frontend Tries to Connect to Localhost

**Symptoms**:
- Console shows: `Failed to fetch http://localhost:3000/api/...`
- Works locally but not on Vercel

**Solution**:
1. `VITE_API_URL` is missing in Vercel
2. Add it in Vercel → Settings → Environment Variables
3. Must redeploy Vercel after adding (environment variables are build-time)

---

### Issue 3: 404 Not Found on API Calls

**Symptoms**:
- Console shows: `GET https://your-backend.onrender.com/links 404`
- Missing `/api` in the path

**Solution**:
1. Check `VITE_API_URL` in Vercel
2. Must end with `/api`: `https://your-backend.onrender.com/api`
3. Frontend code adds the endpoint (e.g., `/links`)
4. Full URL becomes: `https://your-backend.onrender.com/api/links`

---

### Issue 4: Backend Takes Long to Respond

**Symptoms**:
- First request after inactivity takes 30-60 seconds
- Subsequent requests are fast

**Solution**:
- This is normal for Render free tier
- Backend "sleeps" after 15 minutes of inactivity
- First request wakes it up (cold start)
- Options:
  - Upgrade to Starter plan ($7/month) - no sleeping
  - Use UptimeRobot to ping every 14 minutes
  - Accept 30-second delay on first use

---

### Issue 5: "Service Unavailable" or 503 Error

**Symptoms**:
- Backend URL returns 503
- Render dashboard shows "Suspended" or "Failed"

**Solution**:
1. Check Render logs for crash errors
2. Common causes:
   - Missing `TELEGRAM_BOT_TOKEN`
   - Invalid bot token
   - Database initialization failed
3. Fix: Add/update environment variable and redeploy
4. Check "Manual Deploy" → "Clear build cache & deploy"

---

## Verify Your Setup

Run through this checklist:

### Render (Backend):
- [ ] Service status is "Live" (green)
- [ ] `TELEGRAM_BOT_TOKEN` is set
- [ ] `FRONTEND_URL` is set to Vercel URL
- [ ] Logs show: "✅ Server running on port 3000"
- [ ] Logs show: "✅ Telegram bot started successfully!"
- [ ] Health check returns 200 OK

### Vercel (Frontend):
- [ ] Deployment status is "Ready" (green checkmark)
- [ ] `VITE_API_URL` is set to backend URL + `/api`
- [ ] Build completed successfully
- [ ] No errors in deployment logs
- [ ] Frontend page loads (even if showing error message)

### Network:
- [ ] Backend health endpoint works in browser
- [ ] Backend `/api/links` returns JSON
- [ ] Frontend can reach backend (check console)
- [ ] No CORS errors in browser console

---

## Quick Reference

**What goes where**:

```
Frontend (Vercel) Environment Variables:
├─ VITE_API_URL = https://your-backend.onrender.com/api
│                 └─ Must include /api at the end!

Backend (Render) Environment Variables:
├─ TELEGRAM_BOT_TOKEN = 123456789:ABCdef...
├─ FRONTEND_URL = https://your-app.vercel.app
│                 └─ NO /api at the end!
└─ PORT = (auto-set by Render)
```

---

## Still Not Working?

### Check Browser Console (Frontend)

1. Open your Vercel URL
2. Press F12 to open Developer Tools
3. Click "Console" tab
4. Look for red error messages
5. Common errors:
   - `ERR_NAME_NOT_RESOLVED` → Backend URL wrong
   - `CORS policy` → FRONTEND_URL missing
   - `404` → Missing `/api` in URL
   - `Network Error` → Backend not running

### Check Render Logs (Backend)

1. Render dashboard → Your service
2. Click "Logs" tab
3. Look for recent errors
4. Should see startup messages:
   ```
   ✅ Database initialized successfully
   ✅ Telegram bot started successfully!
   ✅ Server running on port 3000
   ```

### Test with cURL

```bash
# Test health endpoint
curl https://YOUR-BACKEND-URL.onrender.com/api/health

# Test links endpoint
curl https://YOUR-BACKEND-URL.onrender.com/api/links

# Test with Vercel origin header
curl -H "Origin: https://your-app.vercel.app" \
     https://YOUR-BACKEND-URL.onrender.com/api/health
```

All three should return 200 OK responses.

---

## Need Help?

If you're still stuck:

1. **Provide these details**:
   - Your Render backend URL
   - Your Vercel frontend URL
   - Screenshot of Render logs
   - Screenshot of browser console errors
   - Screenshot of environment variables (blur sensitive values)

2. **Check these files locally**:
   - `frontend/src/api.js` - Verify API_BASE_URL logic
   - `backend/server.js` - Verify CORS configuration

3. **Common oversights**:
   - Forgot to redeploy after adding env vars
   - Typo in environment variable names
   - Missing `https://` in URLs
   - Extra trailing slashes

---

**Last Updated**: 2026-01-07
**Status**: Troubleshooting Guide
