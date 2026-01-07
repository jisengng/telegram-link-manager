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
├── .git/                      # Git repository
├── .gitignore                 # Git ignore patterns
├── backend/
│   ├── bot.js                 # Telegram bot logic
│   ├── server.js              # Express API server
│   ├── database.js            # SQLite operations (sql.js)
│   ├── metadataExtractor.js   # URL metadata scraping
│   ├── package.json           # Backend dependencies (ES modules)
│   ├── .env                   # Bot token and config
│   ├── .env.example           # Environment variable template
│   ├── .node-version          # Node version specification (20)
│   └── .gitignore             # Backend-specific ignores
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Main styles (gradient background)
│   │   ├── api.js             # API client
│   │   └── components/
│   │       ├── LinkCard.jsx/css      # Individual link display
│   │       ├── FilterPanel.jsx/css   # Status & category filters
│   │       ├── SearchBar.jsx/css     # Search input
│   │       ├── EditModal.jsx/css     # Edit link modal
│   │       └── BulkActions.jsx/css   # Bulk operations toolbar
│   ├── package.json
│   └── index.html
├── channel-forwarder/         # Optional: Python auto-forwarder (advanced)
│   ├── forwarder.py           # Auto-forward script
│   ├── setup_session.py       # Session generator
│   └── README.md              # Forwarder documentation
├── INSTALL.bat                # Windows: Install dependencies
├── START.bat                  # Windows: Start both servers
├── START_ALL.bat              # Windows: Start all + forwarder (optional)
├── UPDATES.md                 # Feature changelog
├── UI_REDESIGN.md             # UI design documentation
├── README.md                  # General project readme
├── SETUP.md                   # Setup instructions
└── render.yaml                # Render.com deployment config
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
  source TEXT DEFAULT 'manual',       -- Link source: 'manual', 'channel_forward'
  source_name TEXT,                   -- Channel name or other source identifier
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tags Table
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Link Tags Junction Table
```sql
CREATE TABLE link_tags (
  link_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (link_id, tag_id),
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
)
```

### Database Indexes
```sql
CREATE INDEX idx_links_category ON links(category);
CREATE INDEX idx_links_created_at ON links(created_at);
CREATE INDEX idx_tags_name ON tags(name);
```

## Key Features

### 1. Telegram Bot Integration
- **Auto-save**: Paste any URL in Telegram, it's automatically saved
- **Channel forwarding**: Forward messages from any Telegram channel to auto-capture links
- **Source tracking**: Links remember where they came from (manual vs channel)
- **Auto-tagging**: Channel-forwarded links automatically tagged with channel name
- **Metadata extraction**: Automatically fetches title, description, image
- **Special handling**: X.com/Twitter links get custom fallback
- **Auto-categorization**: URLs automatically categorized by domain patterns

### 2. Web Interface
- **Search**: Real-time search across titles, descriptions, URLs
- **Filters**:
  - Status: All / To Read / Completed
  - Category: Dropdown with all auto-detected categories
- **Completion tracking**: Mark links as read with checkmark button
- **CRUD operations**: Edit, delete, bulk operations
- **Responsive design**: Modern glassmorphism UI
- **Bulk mode**: Select multiple links for batch operations

### 3. Tagging System
- **Flexible tagging**: Add custom tags to organize links
- **Tag management**: Create, add, remove tags from individual links
- **Bulk tag operations**: Add or remove tags from multiple links at once
- **Tag filtering**: Filter links by tags (when searching)
- **Tag suggestions**: Quick tag selection from existing tags
- **Many-to-many relationship**: Links can have multiple tags, tags can be on multiple links

### 4. Auto-Categorization
Categories are detected from URL patterns:
- **video**: YouTube, Vimeo, Twitch, TikTok
- **tech**: GitHub, Stack Overflow, GitLab, Bitbucket
- **product**: Amazon, Product Hunt, Etsy, eBay
- **article**: Medium, Dev.to, Substack, news sites
- **docs**: URLs containing "docs" or "documentation"
- **social**: Twitter/X, Reddit, LinkedIn, Facebook, Instagram

### 5. Completion System
- Circle button (○) on each link
- Click to mark as complete (✓ with green gradient)
- Completed links show:
  - 50% opacity
  - Strikethrough title
  - Grayed out description/URL
  - Muted category badge
- Filter by completion status

### 6. X.com/Twitter Handling
- **Problem**: X.com blocks simple web scraping
- **Solution**: Early detection and fallback
  - Extracts username from URL: `x.com/username/status/123` → "Tweet by @username"
  - Always uses X.com logo as preview image
  - Default description: "Click to view on X"
  - Category: "social"

### 7. Bulk Operations
- **Bulk mode toggle**: Enable selection mode from header
- **Visual selection**: Checkboxes appear on cards in bulk mode
- **Select all/none**: Quick toggle for all visible links
- **Bulk delete**: Delete multiple links at once
- **Bulk tag operations**: Add or remove tags from multiple links
  - Quick tag selection from existing tags
  - Custom tag input (comma-separated)
  - Dropdown menus with tag suggestions

### 8. Channel Manual Forward
- **Manual forwarding**: Forward messages from any channel you subscribe to
- **Automatic link extraction**: Bot detects forwarded messages and extracts all URLs
- **Source attribution**: Saves channel name with each link
- **Auto-tagging**: Links automatically tagged with `channel:channel-name` format
- **Multiple links support**: Extracts all links from a single forwarded message
- **Visual feedback**: Bot confirms with channel name in success message
- **Filter by source**: Use tags to filter links by originating channel
- **No admin required**: Works without needing admin rights to the channel
- **Quick & Simple**: Takes 2 seconds per message, full control over what to save

**How it works:**
1. See an interesting article in a Telegram channel
2. Forward the message to your bot (right-click → Forward)
3. Bot detects it's from a channel, extracts links
4. Saves with channel name and auto-generated tag
5. View in web interface with source attribution

**Note**: An optional Python auto-forwarder script is available in the `channel-forwarder/` directory for automated forwarding, but manual forwarding is recommended for simplicity and reliability.

## API Endpoints

### Links
- `GET /api/links` - Get all links
- `GET /api/links/:id` - Get single link
- `POST /api/links` - Create new link (typically via Telegram bot)
- `PUT /api/links/:id` - Update link (title, description, image_url, category, tags)
- `DELETE /api/links/:id` - Delete link
- `POST /api/links/:id/toggle-complete` - Toggle completion status

### Search & Filter
- `GET /api/links/search?query=...&category=...&tags=...` - Search links with filters
  - `query`: Search text (searches title, description, URL)
  - `category`: Filter by category
  - `tags`: Comma-separated list of tags

### Categories
- `GET /api/categories` - Get all categories with counts

### Tags
- `GET /api/tags` - Get all tags with usage counts

### Bulk Operations
- `POST /api/bulk/delete` - Delete multiple links
  - Body: `{ linkIds: [1, 2, 3] }`
- `POST /api/bulk/add-tags` - Add tags to multiple links
  - Body: `{ linkIds: [1, 2, 3], tags: ["tag1", "tag2"] }`
- `POST /api/bulk/remove-tags` - Remove tags from multiple links
  - Body: `{ linkIds: [1, 2, 3], tags: ["tag1", "tag2"] }`

### System
- `GET /api/health` - Health check endpoint

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

### Node.js Version & Modules
- **Development**: Node.js v24.12.0
- **Production**: Node.js v20 (specified in .node-version and package.json)
- **Module system**: ES modules (type: "module" in package.json)
- **Import syntax**: Uses `import/export` instead of `require/module.exports`

### Why sql.js Instead of better-sqlite3?
- User originally ran **Node.js v24.12.0**
- better-sqlite3 requires C++ compilation
- Node v24 caused compilation errors (C++20 required)
- **Solution**: Switched to sql.js (pure JavaScript, no compilation)
- Database file: `links.db` (SQLite format)
- Compatible with Node v20+ for deployment

### Version Control
- Project is now a **Git repository**
- `.gitignore` configured to exclude:
  - node_modules/
  - .env files
  - Database files (*.db, *.sqlite)
  - Build outputs
  - IDE files
  - Logs

### Auto-Migration
The database automatically adds new columns if they don't exist:
```javascript
// Check and add completed column if missing
try {
  db.run(`ALTER TABLE links ADD COLUMN completed INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists, ignore error
}
```

### Environment Variables
Located in `backend/.env` (see `.env.example` for template):
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Security Note**: The `.env` file is excluded from version control via `.gitignore`

### Deployment Configuration
The `render.yaml` file configures deployment to Render.com:
- Service type: Web
- Runtime: Node.js 20
- Root directory: backend
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: NODE_VERSION=20, PORT=3000

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
Edit `backend/database.js` in the `initDatabase()` function:
```javascript
// Add new column with auto-migration
try {
  db.run(`ALTER TABLE links ADD COLUMN your_column TEXT`);
} catch (e) {
  // Column already exists, ignore error
}
```
Database auto-migrates on next restart.

### Working with Tags
```javascript
// Add tag to a link (in EditModal or via API)
const updatedLink = {
  ...link,
  tags: [...(link.tags || []), 'newtag']
};
await linkApi.updateLink(link.id, updatedLink);

// Bulk add tags to multiple links
await linkApi.bulkAddTags([1, 2, 3], ['tag1', 'tag2']);

// Bulk remove tags
await linkApi.bulkRemoveTags([1, 2, 3], ['tag1']);
```

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

### Version 5: Modern Aesthetic
- Gradient purple-blue theme
- Glassmorphism throughout
- Smooth animations
- Premium visual effects
- Compact dropdown filters

### Version 6: Tags & Bulk Operations (Current)
- **Re-introduced tagging system** with proper many-to-many relationship
- **Bulk selection mode** with checkboxes
- **Bulk operations**: Delete, add tags, remove tags
- **Tag management UI**: Dropdown menus with quick tag selection
- **ES modules**: Migrated to modern import/export syntax
- **Git repository**: Version control with proper .gitignore
- **Deployment ready**: render.yaml configuration for Render.com
- **Environment templates**: .env.example for easy setup
- **Node version management**: .node-version file for consistency
- **Health check endpoint**: API monitoring capability

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

- [x] Tags system - ✅ Implemented in Version 6
- [x] Bulk operations - ✅ Implemented in Version 6
- [ ] Export links to JSON/CSV
- [ ] Import links from bookmarks
- [ ] Link preview in modal
- [ ] Reading time estimation
- [ ] Archive old links
- [ ] Mobile app
- [ ] Chrome extension
- [ ] Multiple users/accounts
- [ ] Link collections/folders
- [ ] Statistics dashboard
- [ ] Dark mode toggle
- [ ] Tag-based filtering in sidebar
- [ ] Tag autocomplete in EditModal
- [ ] Tag color coding
- [ ] Notes/comments on links
- [ ] Link sharing functionality
- [ ] API key authentication for deployment

## Key Files to Reference

### Core Logic
- `backend/bot.js` - Message handling and URL detection
- `backend/database.js:12-71` - Database initialization and schema
- `backend/database.js:85-280` - Database operations (CRUD, tags, bulk ops)
- `backend/server.js:18-205` - API endpoints
- `backend/metadataExtractor.js` - Metadata extraction and categorization

### UI Components
- `frontend/src/App.jsx:16-26` - Filter and bulk selection state
- `frontend/src/App.jsx:56-81` - Filter application logic
- `frontend/src/App.jsx:116-144` - Bulk operations handlers
- `frontend/src/components/LinkCard.jsx` - Individual link display
- `frontend/src/components/FilterPanel.jsx` - Status & category filters
- `frontend/src/components/BulkActions.jsx` - Bulk operations toolbar
- `frontend/src/components/EditModal.jsx` - Link editing modal

### Styling
- `frontend/src/App.css` - Gradient background and main layout
- `frontend/src/components/FilterPanel.css` - Custom dropdown styles
- `frontend/src/components/LinkCard.css` - Glassmorphism cards
- `frontend/src/components/BulkActions.css` - Bulk actions styling

### Configuration
- `backend/package.json` - Backend dependencies and ES module config
- `frontend/package.json` - Frontend dependencies
- `backend/.env.example` - Environment variable template
- `backend/.node-version` - Node version specification (20)
- `render.yaml` - Render.com deployment configuration
- `.gitignore` - Git exclusion patterns

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

- **Platform**: Windows (uses .bat files for development)
- **Node Version**:
  - Development: v24.12.0
  - Production: v20 (for deployment compatibility)
- **Module System**: ES Modules (import/export)
- **Deployment**: Ready for Render.com (see render.yaml)
- **Version Control**: Git repository initialized
- **Primary Use**: Personal link organization
- **Link Sources**: Direct messages to bot, forwarded channel messages

---

**Last Updated**: 2026-01-07
**Version**: 6.1 (Channel Forward)
**Status**: Production Ready ✅

### Recent Changes (Version 6.1)
- ✅ **Channel manual forward feature** - Forward messages from any Telegram channel
- ✅ **Source tracking** - Database tracks link origin (manual vs channel)
- ✅ **Auto-tagging by channel** - Automatic `channel:name` tags
- ✅ **Channel name attribution** - Shows which channel links came from
- ✅ **Optional auto-forwarder** - Python script available for automation (advanced)
- ✅ Updated bot help text with channel forward instructions

### Previous Changes (Version 6.0)
- ✅ Tagging system with many-to-many relationships
- ✅ Bulk selection mode and operations
- ✅ Bulk add/remove tags functionality
- ✅ ES modules migration (import/export)
- ✅ Git repository setup with .gitignore
- ✅ Deployment configuration (render.yaml)
- ✅ Environment variable templates (.env.example)
- ✅ Node version management (.node-version)
- ✅ Health check API endpoint
- ✅ Enhanced API with tag endpoints
- ✅ BulkActions component with dropdown menus
