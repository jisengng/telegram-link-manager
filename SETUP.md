# Quick Setup Guide

## Step 1: Get Telegram Bot Token

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow prompts to create your bot
5. Copy the token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

## Step 3: Configure Environment

```bash
# In backend directory
cp .env.example .env
```

Edit `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=paste_your_token_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## Step 4: Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 5: Test It Out

1. Open Telegram and find your bot
2. Send `/start`
3. Send any link (try: https://github.com)
4. Use inline buttons to add tags
5. Open http://localhost:5173 in browser
6. See your saved link!

## That's It!

You now have a fully functional link manager. Start sending links to your bot and organize them via the web interface.

### Quick Tips:

- **Search**: Use the search bar for instant filtering
- **Bulk mode**: Click "Bulk Select" to manage multiple links
- **Custom tags**: Add your own tags when saving links
- **Edit**: Click "Edit" on any link to modify details

### Need Help?

Check the full README.md for detailed documentation and troubleshooting.
