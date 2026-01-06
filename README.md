# Telegram Link Manager

A personal Telegram bot + web app that transforms random saved links into an organized, searchable collection with minimal context-switching.

## Features

- **Telegram Bot Integration**: Send links directly via Telegram
- **Automatic Metadata Extraction**: Grabs title, description, and preview images
- **Smart Categorization**: URL pattern-based auto-categorization (article, video, product, tech, docs, social)
- **Inline Tagging**: Tag links directly in Telegram with button interface
- **Web Interface**: Clean, modern UI for browsing and managing links
- **Full-Text Search**: Search across titles, descriptions, and URLs
- **Advanced Filtering**: Filter by category and tags
- **Bulk Operations**: Manage multiple links at once (add/remove tags, delete)
- **Edit Links**: Update metadata, tags, and categorization
- **Local First**: Runs entirely on your machine with SQLite database

## Tech Stack

**Backend:**
- Node.js + Express
- node-telegram-bot-api
- SQLite (better-sqlite3)
- Cheerio for web scraping

**Frontend:**
- React 18
- Vite
- CSS3 (no framework dependencies)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Telegram bot token ([get one from @BotFather](https://t.me/botfather))

## Installation

### 1. Get a Telegram Bot Token

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Choose a name and username for your bot
4. Save the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Clone and Set Up Backend

```bash
# Navigate to backend directory
cd telegram-link-manager/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Configure Backend

Edit `backend/.env` and add your bot token:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 4. Set Up Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

You'll need two terminal windows:

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

You should see:
```
Server running on http://localhost:3000
Telegram bot started successfully!
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Start Using Your Bot

1. Open Telegram and find your bot (search for the username you created)
2. Send `/start` to begin
3. Send any link to the bot
4. Use inline buttons to tag the link
5. Visit http://localhost:5173 in your browser to view and manage your links

## Usage Guide

### Sending Links via Telegram

1. **Send a link**: Just paste any URL in your chat with the bot
2. **Wait for extraction**: The bot will automatically fetch metadata
3. **Tag your link**: Use the inline buttons to add tags
   - Click common tags to toggle them
   - Use "Add Custom Tag" for your own tags
   - Click "Done" when finished

### Using the Web Interface

**Search:**
- Type in the search bar to find links by title, description, or URL
- Search updates in real-time

**Filter:**
- Click categories in the sidebar to filter by type
- Click tags to filter by specific tags
- Select multiple tags for AND filtering
- Click "Clear" to reset all filters

**Edit Links:**
- Click "Edit" on any link card
- Update title, description, image, category, or tags
- Click "Save Changes" to update

**Bulk Operations:**
1. Click "Bulk Select" in the header
2. Select multiple links by clicking on cards
3. Use the bulk actions bar to:
   - Add tags to all selected links
   - Remove tags from selected links
   - Delete multiple links at once

### Bot Commands

- `/start` - Show welcome message
- `/help` - Display help information
- `/stats` - View your link statistics

## Project Structure

```
telegram-link-manager/
├── backend/
│   ├── server.js              # Express server & API routes
│   ├── bot.js                 # Telegram bot logic
│   ├── database.js            # SQLite database operations
│   ├── metadataExtractor.js   # Link metadata extraction
│   ├── package.json
│   ├── .env                   # Environment variables (create this)
│   └── links.db               # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   │   ├── SearchBar.jsx
    │   │   ├── FilterPanel.jsx
    │   │   ├── LinkCard.jsx
    │   │   ├── EditModal.jsx
    │   │   └── BulkActions.jsx
    │   ├── App.jsx            # Main app component
    │   ├── api.js             # API client
    │   └── main.jsx           # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Database Schema

The app uses SQLite with three tables:

**links** - Stores link information
- id, url, title, description, image_url, category, created_at, updated_at

**tags** - Stores unique tags
- id, name, created_at

**link_tags** - Junction table for many-to-many relationship
- link_id, tag_id

## Customization

### Adding More URL Patterns

Edit `backend/metadataExtractor.js` and add patterns to the `categorizeUrl()` function:

```javascript
if (urlLower.includes('example.com')) return 'custom-category';
```

### Changing Common Tags

Edit `backend/bot.js` and modify the `COMMON_TAGS` array:

```javascript
const COMMON_TAGS = [
  'your', 'custom', 'tags', 'here'
];
```

### Styling

All styles are in individual CSS files next to their components. No build step needed for CSS changes.

## Troubleshooting

**Bot not responding:**
- Check that the backend server is running
- Verify your `TELEGRAM_BOT_TOKEN` in `.env` is correct
- Make sure you've started a chat with your bot in Telegram

**Frontend can't connect to backend:**
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

**Links not saving:**
- Check backend console for errors
- Some websites block scraping - the bot will save with minimal metadata
- Ensure the database file `links.db` is writable

**Search not working:**
- Try clearing all filters first
- Check that you're searching for text that exists in your links
- Search is case-insensitive and matches partial words

## Development

**Backend development mode (auto-restart on changes):**
```bash
cd backend
npm run dev
```

**Frontend development mode (already has hot reload):**
```bash
cd frontend
npm run dev
```

**Build frontend for production:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Backup Your Data

Your links are stored in `backend/links.db`. To backup:

```bash
cp backend/links.db backend/links.backup.db
```

To restore:
```bash
cp backend/links.backup.db backend/links.db
```

## License

MIT

## Contributing

This is a personal project, but feel free to fork and customize for your own use!
