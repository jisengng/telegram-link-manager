# Telegram Link Manager - Project Documentation

## Project Overview
A personal Telegram bot + web application for organizing and managing saved links. Links sent to the Telegram bot are automatically saved, categorized, and made searchable through a beautiful web interface.

## Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database via `sql.js` (pure JavaScript, no compilation needed)
- **Telegram Bot API** via `node-telegram-bot-api`
- **Metadata Extraction**: Axios + Cheerio for web scraping
- **Port**: 3000

### Frontend
- **React 18** with Vite
- **Modern CSS** with glassmorphism and gradient design
- **Port**: 5173

## Project Structure

```
telegram-link-manager/
├── backend/
│   ├── bot.js                 # Telegram bot logic
│   ├── server.js              # Express API server
│   ├── database.js            # SQLite operations (sql.js)
│   ├── metadataExtractor.js   # URL metadata scraping
│   ├── package.json
│   └── .env                   # Bot token and config
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Main styles (gradient background)
│   │   ├── api.js             # API client
│   │   └── components/
│   │       ├── LinkCard.jsx/css      # Individual link display
│   │       ├── FilterPanel.jsx/css   # Status & category filters
│   │       ├── SearchBar.jsx/css     # Search input
│   │       └── EditModal.jsx/css     # Edit link modal
│   ├── package.json
│   └── index.html
├── INSTALL.bat                # Windows: Install dependencies
├── START.bat                  # Windows: Start both servers
├── UPDATES.md                 # Feature changelog
└── UI_REDESIGN.md            # UI design documentation
```

## Database Schema

### Links Table
```sql
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  image_url TEXT,
  category TEXT,
  completed INTEGER DEFAULT 0,        -- 0 = incomplete, 1 = completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Key Features

### 1. Telegram Bot Integration
- **Auto-save**: Paste any URL in Telegram, it's automatically saved
- **No tags needed**: Simplified from original tag-based system
- **Metadata extraction**: Automatically fetches title, description, image
- **Special handling**: X.com/Twitter links get custom fallback

### 2. Web Interface
- **Search**: Real-time search across titles, descriptions, URLs
- **Filters**:
  - Status: All / To Read / Completed
  - Category: Dropdown with all auto-detected categories
- **Completion tracking**: Mark links as read with checkmark button
- **CRUD operations**: Edit, delete, bulk operations
- **Responsive design**: Modern glassmorphism UI

### 3. Auto-Categorization
Categories are detected from URL patterns:
- **video**: YouTube, Vimeo, Twitch, TikTok
- **tech**: GitHub, Stack Overflow, GitLab, Bitbucket
- **product**: Amazon, Product Hunt, Etsy, eBay
- **article**: Medium, Dev.to, Substack, news sites
- **docs**: URLs containing "docs" or "documentation"
- **social**: Twitter/X, Reddit, LinkedIn, Facebook, Instagram

### 4. Completion System
- Circle button (○) on each link
- Click to mark as complete (✓ with green gradient)
- Completed links show:
  - 50% opacity
  - Strikethrough title
  - Grayed out description/URL
  - Muted category badge
- Filter by completion status

### 5. X.com/Twitter Handling
- **Problem**: X.com blocks simple web scraping
- **Solution**: Early detection and fallback
  - Extracts username from URL: `x.com/username/status/123` → "Tweet by @username"
  - Always uses X.com logo as preview image
  - Default description: "Click to view on X"
  - Category: "social"

## API Endpoints

### Links
- `GET /api/links` - Get all links
- `GET /api/links/:id` - Get single link
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `POST /api/links/:id/toggle-complete` - Toggle completion status

### Search & Filter
- `GET /api/search?q=query&category=tech` - Search links

### Categories
- `GET /api/categories` - Get all categories with counts

### Bulk Operations
- `POST /api/bulk/delete` - Delete multiple links

## UI Design System

### Color Palette
```css
/* Primary Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success (Complete) */
background: linear-gradient(135deg, #27ae60 0%, #229954 100%);

/* Danger (Delete) */
background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);

/* Glass Effect */
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
```

### Design Features
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Gradient theme**: Purple-to-blue throughout
- **Smooth animations**: 0.3s ease on all transitions
- **Hover effects**: Cards lift, buttons scale, colors shift
- **Shadows**: Multiple layers for depth (4px, 8px, 12px, 24px)
- **Custom dropdowns**: Styled selects with gradient arrow

### Component Highlights
- **Background**: Animated gradient purple-blue
- **Cards**: White frosted glass with soft shadows
- **Buttons**: Gradient fills with glow effects
- **Filters**: Compact dropdowns instead of long lists
- **Search**: Gradient border with focus glow
- **Completion**: Green gradient checkmark button

## Important Notes

### Why sql.js Instead of better-sqlite3?
- User runs **Node.js v24.12.0**
- better-sqlite3 requires C++ compilation
- Node v24 caused compilation errors (C++20 required)
- **Solution**: Switched to sql.js (pure JavaScript, no compilation)
- Database file: `links.db` (SQLite format)

### Auto-Migration
The database automatically adds new columns if they don't exist:
```javascript
// Check and add completed column if missing
db.exec(`
  ALTER TABLE links ADD COLUMN completed INTEGER DEFAULT 0
`);
```

### Bot Token
Located in `backend/.env`:
```
TELEGRAM_BOT_TOKEN=8488518827:AAGV0btqMhw8X_tWuNmp6XaJ_XTSR6YayXA
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Metadata Extraction Logic
1. **Try to fetch page** with Axios
2. **Parse HTML** with Cheerio
3. **Extract OpenGraph tags** (og:title, og:description, og:image)
4. **Fallback to Twitter tags** (twitter:title, etc.)
5. **Fallback to basic HTML** (title tag, meta description, first img)
6. **Special handling for X.com**: Skip scraping, use URL-based fallback
7. **Category detection**: Pattern match URL
8. **Fallback images**: Site-specific logos (GitHub, YouTube, etc.) or generic icon

### Filter Implementation
- **Status filter**: Applied locally in frontend (filters links array)
- **Category filter**: Sent to backend API
- **Search**: Sent to backend API with SQL LIKE queries
- Both dropdowns update URL and trigger re-render

## Running the Project

### Initial Setup
```batch
# Run once to install dependencies
INSTALL.bat
```

### Start Development
```batch
# Opens 2 terminals: backend (port 3000) + frontend (port 5173)
START.bat
```

### Manual Start
```bash
# Backend
cd backend
npm start

# Frontend (separate terminal)
cd frontend
npm run dev
```

## Common Tasks

### Add New Category Pattern
Edit `backend/metadataExtractor.js`:
```javascript
const categorizeUrl = (url) => {
  const urlLower = url.toLowerCase();

  // Add your pattern
  if (urlLower.includes('yoursite.com')) return 'yourcategory';

  // ...existing patterns
};
```

### Add New Fallback Logo
Edit `backend/metadataExtractor.js`:
```javascript
const getDefaultLogo = (url) => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('yoursite.com')) {
    return 'https://yoursite.com/logo.png';
  }

  // ...existing logos
};
```

### Update Database Schema
Edit `backend/database.js` in the `initDb()` function:
```javascript
db.exec(`
  ALTER TABLE links ADD COLUMN your_column TEXT
`);
```
Database auto-migrates on next restart.

## Design Evolution

### Version 1: Original
- Tag-based system with inline buttons
- Grid card layout
- Basic colors and styling
- better-sqlite3 database

### Version 2: Simplified
- Removed tagging complexity
- Auto-save on paste
- Added site-specific logos
- Switched to sql.js

### Version 3: Vertical UI
- Changed to vertical list layout
- Added completion tracking
- Smaller action buttons in corner
- Enhanced visual states

### Version 4: Enhanced Completion
- Increased completed opacity (50%)
- Added Status filter
- X.com description extraction
- Universal fallback system

### Version 5: Modern Aesthetic (Current)
- Gradient purple-blue theme
- Glassmorphism throughout
- Smooth animations
- Premium visual effects
- Compact dropdown filters

## Troubleshooting

### Bot Not Responding
1. Check `.env` has correct `TELEGRAM_BOT_TOKEN`
2. Ensure backend is running on port 3000
3. Check terminal for error messages

### Frontend Not Loading
1. Ensure backend is running first (port 3000)
2. Frontend should be on port 5173
3. Check CORS settings in `backend/server.js`

### Database Locked Error
1. Only use sql.js (not better-sqlite3)
2. Check `saveDb()` is called after writes
3. Restart backend if issues persist

### X.com Links Show "Untitled"
This is now fixed. The system:
1. Detects X.com URLs early
2. Skips scraping attempt
3. Extracts username from URL
4. Returns proper fallback data

### Metadata Not Extracting
1. Check target website allows scraping
2. Some sites require JavaScript rendering (won't work)
3. Check timeout (10 seconds)
4. Fallback system provides generic data

## Future Enhancement Ideas

- [ ] Export links to JSON/CSV
- [ ] Import links from bookmarks
- [ ] Tags system (if needed later)
- [ ] Link preview in modal
- [ ] Reading time estimation
- [ ] Archive old links
- [ ] Mobile app
- [ ] Chrome extension
- [ ] Multiple users/accounts
- [ ] Link collections/folders
- [ ] Statistics dashboard
- [ ] Dark mode toggle

## Key Files to Reference

### Core Logic
- `backend/bot.js:20-50` - Message handling and URL detection
- `backend/database.js:30-60` - Database operations
- `backend/metadataExtractor.js:128-140` - X.com special handling
- `backend/metadataExtractor.js:5-50` - Category patterns

### UI Components
- `frontend/src/App.jsx:55-80` - Filter logic
- `frontend/src/components/LinkCard.jsx:24-28` - Completion state
- `frontend/src/components/FilterPanel.jsx:28-57` - Dropdown filters

### Styling
- `frontend/src/App.css:1-7` - Gradient background
- `frontend/src/components/FilterPanel.css:62-96` - Custom dropdown styles
- `frontend/src/components/LinkCard.css:1-18` - Glassmorphism cards

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "node-telegram-bot-api": "^0.66.0",
  "sql.js": "^1.10.3",
  "axios": "^1.6.5",
  "cheerio": "^1.0.0-rc.12",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.5",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8"
}
```

## Contact & Context

- **Platform**: Windows (uses .bat files)
- **Node Version**: v24.12.0
- **Development Mode**: Local only (not deployed)
- **Primary Use**: Personal link organization
- **Link Source**: Telegram messages

---

**Last Updated**: 2026-01-07
**Version**: 5.0 (Modern Aesthetic)
**Status**: Production Ready ✅
