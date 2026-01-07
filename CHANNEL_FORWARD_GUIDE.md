# Channel Auto-Forward Setup Guide

## Overview

This feature allows you to automatically capture and save links from any Telegram channel you follow by forwarding channel messages to your bot. The bot will:
- Detect that the message came from a channel
- Extract all URLs from the forwarded message
- Save them with the channel name as the source
- Automatically tag links with `channel:channel-name`
- Display the channel name in your web interface

## How It Works

When you forward a message from a Telegram channel to your bot:
1. Bot detects it's a forwarded message from a channel
2. Extracts the channel name (e.g., "Tech News Daily")
3. Finds all links in the message
4. Saves each link with:
   - `source`: "channel_forward"
   - `source_name`: The actual channel name
   - Auto-generated tag: `channel:tech-news-daily`
5. Shows confirmation with channel attribution

## Setup Instructions

### Option 1: Manual Forward (Simple)

1. **Open the channel** you want to save links from
2. **Find a message** with a link you want to save
3. **Forward the message** to your bot:
   - Desktop: Right-click message → Forward → Select your bot
   - Mobile: Long-press message → Forward → Select your bot
4. **Bot saves the link** automatically and confirms with channel name

**Advantages:**
- Works immediately, no setup needed
- Full control over which links to save
- Works with any public or private channel you're subscribed to

**Limitations:**
- Requires manual action for each message

---

### Option 2: Telegram Auto-Forward (Automatic)

Unfortunately, Telegram doesn't have a built-in "auto-forward all messages from channel X to bot Y" feature in the standard app.

However, you have these options:

#### A. Use Telegram Desktop + Third-Party Tools
Some users set up automation using:
- Telegram Desktop's folder filters
- Third-party automation tools (use at your own risk)

#### B. IFTTT Integration (If Channel Has RSS)
Some public channels offer RSS feeds:

1. Check if your channel has an RSS feed:
   - Format: `https://t.me/s/CHANNEL_USERNAME`
   - Example: `https://t.me/s/technews`

2. Use IFTTT or Zapier to monitor RSS
3. Configure to send new posts to your bot via Telegram

---

## How to Use After Setup

### Viewing Channel Links in Web Interface

All links forwarded from channels will:
- Show in your web interface normally
- Have `source_name` field populated with channel name
- Be tagged with `channel:channel-name` tag
- Can be filtered using the search/filter features

### Filtering by Channel

You can filter links by channel using tags:
1. In web interface, use search with tag filter
2. Search for tag: `channel:channel-name`
3. All links from that channel will appear

### Example Workflow

1. **Subscribe to "Tech News" channel on Telegram**
2. **See interesting article** → Forward message to your bot
3. **Bot saves link** with tag `channel:tech-news`
4. **In web app**, search by tag `channel:tech-news` to see all links from that channel

---

## Database Fields

Links saved from channels have these additional fields:

```javascript
{
  id: 123,
  url: "https://example.com/article",
  title: "Article Title",
  description: "Article description",
  category: "article",
  completed: 0,
  source: "channel_forward",        // Indicates it came from a channel
  source_name: "Tech News Daily",   // The channel's name
  tags: ["channel:tech-news-daily", "tech"], // Auto-tagged + manual tags
  created_at: "2026-01-07 ...",
  updated_at: "2026-01-07 ..."
}
```

---

## Tips & Best Practices

### 1. Channel Name Format
- Channel names are automatically converted to tag format
- Spaces become dashes: "Tech News" → `channel:tech-news`
- Lowercase: "TechNews" → `channel:technews`

### 2. Organize by Channel
- Use the auto-generated channel tags to filter
- Create collections in your web app by channel source
- Bulk operations work on channel-filtered results

### 3. Multiple Links in One Message
- If a channel message contains multiple links, all are extracted
- Each link is saved separately
- All get the same channel tag

### 4. Forward Only What You Need
- Don't feel obligated to forward every channel post
- Be selective to keep your link collection meaningful
- Use the completion feature to mark what you've read

---

## Troubleshooting

### Bot doesn't detect channel name
**Problem:** Link saved but no channel name shown

**Solutions:**
- Make sure you're forwarding, not copying and pasting
- Check if the channel is public (private channels may have limitations)
- Verify bot is running: `npm start` in backend folder

### Links not appearing in web interface
**Problem:** Bot confirms save but web app doesn't show it

**Solutions:**
- Refresh the web page
- Check backend is connected to database
- Look at backend console for errors

### Channel name shows as "Unknown Channel"
**Problem:** Source shows but name is generic

**Cause:** Some channels restrict metadata access

**Workaround:** Bot still saves the link, you can manually edit and add tags

---

## API Endpoints

The feature uses existing endpoints with additional fields:

### Get Links with Source Info
```javascript
GET /api/links
```

Response includes:
```json
{
  "id": 1,
  "url": "...",
  "source": "channel_forward",
  "source_name": "Tech News",
  "tags": ["channel:tech-news"]
}
```

### Filter by Source
```javascript
GET /api/links/search?tags=channel:tech-news
```

---

## Future Enhancements

Possible improvements for this feature:

- [ ] Channel source filter in sidebar
- [ ] Visual indicator for channel-sourced links
- [ ] Statistics by channel source
- [ ] Bulk operations on channel-specific links
- [ ] Channel management page (list all sources)
- [ ] RSS feed integration for true automation
- [ ] Whitelist/blacklist channels

---

## Privacy & Security

- ✅ Bot only sees messages **you** forward to it
- ✅ Bot **cannot** read channel messages unless you forward them
- ✅ Channel names are stored locally in your database
- ✅ No data leaves your machine (unless you deploy to cloud)
- ✅ Bot runs on your computer, you have full control

---

## Examples

### Example 1: Tech Articles Channel

**Channel:** "Daily Tech Articles" (@techarticles)

**Action:** Forward article message to bot

**Result:**
- Link saved with title, description, category
- Tagged: `channel:daily-tech-articles`
- Source name: "Daily Tech Articles"
- Visible in web interface immediately

### Example 2: Multiple Links in One Forward

**Channel:** "Link Roundup"

**Message contains:**
- https://example.com/article1
- https://example.com/article2
- https://example.com/article3

**Result:**
- All 3 links saved separately
- All tagged: `channel:link-roundup`
- Each with its own metadata extracted

---

## Need Help?

If you encounter issues:
1. Check the backend console for error messages
2. Ensure bot has latest code (restart backend)
3. Test with a simple channel forward first
4. Check database has source fields: `source`, `source_name`

---

**Last Updated:** 2026-01-07
**Version:** 6.1 (Channel Forward Feature)
