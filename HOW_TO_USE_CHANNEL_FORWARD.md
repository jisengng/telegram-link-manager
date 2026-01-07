# How to Use Channel Forward (Manual)

## Quick Start - 30 Seconds

### Step 1: Start Your Bot
```bash
cd telegram-link-manager
START.bat
```

This starts:
- ✅ Backend server (port 3000)
- ✅ Frontend web interface (port 5173)

### Step 2: Forward a Channel Message

1. **Open Telegram** and go to any channel you follow
2. **Find a message** with a link you want to save
3. **Forward it to your bot**:
   - **Desktop**: Right-click message → Forward → Select your bot
   - **Mobile**: Long-press message → Forward → Select your bot

### Step 3: Bot Saves It Automatically

Your bot will respond with:
```
✅ Link Saved!

📢 From: Channel Name
Title: Article Title
Description: ...
Category: article
URL: https://...
```

### Step 4: View in Web Interface

Open http://localhost:5173

- Link appears in your list
- Tagged with `channel:channel-name`
- Filter by channel using tags

---

## 🎯 That's It!

You're done! The feature is already working. Just forward messages and they're saved.

---

## 📋 Features

### ✅ What Happens Automatically

When you forward a channel message:
- Bot detects it's from a channel
- Extracts the channel name
- Finds all URLs in the message
- Saves each link with:
  - Source: "channel_forward"
  - Source name: The channel's name
  - Auto-tag: `channel:channel-name`
- Confirms with channel attribution

### ✅ Works With

- ✅ Public channels
- ✅ Private channels you're subscribed to
- ✅ Messages with one or multiple links
- ✅ Any channel type (news, articles, tech, etc.)

### ✅ No Setup Required

- ✅ No API credentials needed
- ✅ No additional software
- ✅ No deployment
- ✅ Works immediately
- ✅ 100% reliable

---

## 💡 Tips

### Filter by Channel

In the web interface, search by tag:
- Click search bar
- Type: `channel:tech-news`
- See all links from that channel

### Multiple Links in One Message

If a channel message has multiple links, all are saved separately with the same channel tag.

### Channel Name Format

Channel names are auto-converted to tag format:
- "Tech News" → `channel:tech-news`
- "Daily Articles" → `channel:daily-articles`
- Spaces become dashes, all lowercase

---

## 🔍 Example Workflow

### Scenario: You follow "Tech Daily" channel

1. **Morning**: Tech Daily posts 3 articles
2. **You**: Forward each interesting message to your bot
3. **Bot**: Saves all 3 links with `channel:tech-daily` tag
4. **Later**: Open web app, search `channel:tech-daily`, see all articles
5. **Read**: Click links, mark as complete when done

---

## ❓ FAQ

### Q: Do I need to forward every message?
**A:** No! Only forward messages you're interested in. That's the beauty of manual forwarding - full control.

### Q: What if I forward a message without a link?
**A:** Bot will ignore it. Only messages with `http://` or `https://` are saved.

### Q: Can I forward from groups too?
**A:** Yes, but groups are treated as "manual" source, not "channel_forward". Channel detection only works for actual Telegram channels.

### Q: Will it save duplicate links?
**A:** The database checks for duplicate URLs. If you forward the same link twice, it updates the existing entry.

### Q: What about the Python auto-forwarder?
**A:** That's optional and advanced. Manual forwarding is recommended for most users. The auto-forwarder script is in `channel-forwarder/` if you want to explore it later.

---

## 🚀 Advanced: Auto-Forwarder (Optional)

If you later decide you want automatic forwarding:

1. See `channel-forwarder/README.md`
2. See `channel-forwarder/QUICKSTART.md`
3. Requires Python setup and cloud deployment

**But honestly, manual is simpler and works great!**

---

## 🛠️ Troubleshooting

### Bot doesn't detect channel name

**Check:**
- Did you forward or copy-paste? Must forward
- Is it a channel or group? Only channels show attribution
- Is the channel public? Private channels may show "Unknown Channel"

### Link not appearing in web interface

**Check:**
- Refresh the page
- Backend must be running (check terminal)
- Check backend logs for errors

### No confirmation from bot

**Check:**
- Bot is running (`START.bat`)
- You forwarded a message with a link
- Bot has permissions to send messages

---

## 📖 Related Docs

- `claude.md` - Full project documentation
- `channel-forwarder/README.md` - Auto-forwarder (advanced)
- `UPDATES.md` - Feature changelog

---

**Last Updated**: 2026-01-07
**Recommendation**: Stick with manual forwarding - it's simple, reliable, and gives you full control! 🎉
