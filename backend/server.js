import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbOps, initDatabase } from './database.js';
import { initBot } from './bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// API Routes

// Get all links
app.get('/api/links', (req, res) => {
  try {
    const links = dbOps.getAllLinks();
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Search links
app.get('/api/links/search', (req, res) => {
  try {
    const { query, category, tags } = req.query;
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];
    const links = dbOps.searchLinks(query, category, tagArray);
    res.json(links);
  } catch (error) {
    console.error('Error searching links:', error);
    res.status(500).json({ error: 'Failed to search links' });
  }
});

// Get single link
app.get('/api/links/:id', (req, res) => {
  try {
    const link = dbOps.getLinkById(parseInt(req.params.id));
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

// Update link
app.put('/api/links/:id', (req, res) => {
  try {
    const { title, description, image_url, category, tags } = req.body;
    const linkId = parseInt(req.params.id);

    // Update basic link info
    dbOps.updateLink(linkId, title, description, image_url, category);

    // Update tags
    if (tags) {
      // Get current link to find existing tags
      const link = dbOps.getLinkById(linkId);
      const currentTags = link.tags || [];

      // Remove tags that are no longer present
      for (const tag of currentTags) {
        if (!tags.includes(tag)) {
          const tagObj = dbOps.getOrCreateTag(tag);
          dbOps.removeTagFromLink(linkId, tagObj.id);
        }
      }

      // Add new tags
      for (const tag of tags) {
        if (!currentTags.includes(tag)) {
          const tagObj = dbOps.getOrCreateTag(tag);
          dbOps.addTagToLink(linkId, tagObj.id);
        }
      }
    }

    const updatedLink = dbOps.getLinkById(linkId);
    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
app.delete('/api/links/:id', (req, res) => {
  try {
    dbOps.deleteLink(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Toggle complete status
app.post('/api/links/:id/toggle-complete', (req, res) => {
  try {
    dbOps.toggleComplete(parseInt(req.params.id));
    const link = dbOps.getLinkById(parseInt(req.params.id));
    res.json(link);
  } catch (error) {
    console.error('Error toggling complete:', error);
    res.status(500).json({ error: 'Failed to toggle complete' });
  }
});

// Get all tags
app.get('/api/tags', (req, res) => {
  try {
    const tags = dbOps.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = dbOps.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Bulk operations

// Bulk add tags
app.post('/api/bulk/add-tags', (req, res) => {
  try {
    const { linkIds, tags } = req.body;

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ error: 'linkIds array is required' });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'tags array is required' });
    }

    dbOps.bulkAddTags(linkIds, tags);
    res.json({ success: true, affected: linkIds.length });
  } catch (error) {
    console.error('Error in bulk add tags:', error);
    res.status(500).json({ error: 'Failed to add tags' });
  }
});

// Bulk remove tags
app.post('/api/bulk/remove-tags', (req, res) => {
  try {
    const { linkIds, tags } = req.body;

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ error: 'linkIds array is required' });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'tags array is required' });
    }

    dbOps.bulkRemoveTags(linkIds, tags);
    res.json({ success: true, affected: linkIds.length });
  } catch (error) {
    console.error('Error in bulk remove tags:', error);
    res.status(500).json({ error: 'Failed to remove tags' });
  }
});

// Bulk delete
app.post('/api/bulk/delete', (req, res) => {
  try {
    const { linkIds } = req.body;

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ error: 'linkIds array is required' });
    }

    for (const id of linkIds) {
      dbOps.deleteLink(id);
    }

    res.json({ success: true, deleted: linkIds.length });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Failed to delete links' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and bot, then start server
const startServer = async () => {
  // Initialize database first
  await initDatabase();

  // Initialize Telegram bot
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
  }
  initBot(process.env.TELEGRAM_BOT_TOKEN);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend should be accessible at ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
};

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
