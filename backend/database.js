import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'links.db');

let db;
let SQL;

// Initialize SQL.js
const initDatabase = async () => {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Initialize database schema
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      description TEXT,
      image_url TEXT,
      category TEXT,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add completed column if it doesn't exist (for existing databases)
  try {
    db.run(`ALTER TABLE links ADD COLUMN completed INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Add source column for tracking where link came from (manual, channel_forward, etc.)
  try {
    db.run(`ALTER TABLE links ADD COLUMN source TEXT DEFAULT 'manual'`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Add source_name column for storing channel name or other source identifier
  try {
    db.run(`ALTER TABLE links ADD COLUMN source_name TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS link_tags (
      link_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (link_id, tag_id),
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_links_category ON links(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);

  console.log('Database initialized successfully');
};

// Save database to file
const saveDb = () => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, data);
  }
};

// Auto-save every 5 seconds if there are changes
setInterval(saveDb, 5000);

// Database operations
export const dbOps = {
  // Insert or update link
  saveLink: (url, title, description, imageUrl, category, source = 'manual', sourceName = null) => {
    try {
      // Try to insert
      db.run(
        `INSERT INTO links (url, title, description, image_url, category, source, source_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [url, title, description, imageUrl, category, source, sourceName]
      );
    } catch (e) {
      // If URL exists, update
      db.run(
        `UPDATE links SET title = ?, description = ?, image_url = ?, category = ?, source = ?, source_name = ?, updated_at = CURRENT_TIMESTAMP WHERE url = ?`,
        [title, description, imageUrl, category, source, sourceName, url]
      );
    }

    const result = db.exec(`SELECT id FROM links WHERE url = ?`, [url]);
    saveDb();
    return { id: result[0].values[0][0] };
  },

  // Get or create tag
  getOrCreateTag: (tagName) => {
    const normalizedTag = tagName.toLowerCase().trim();

    try {
      db.run(`INSERT INTO tags (name) VALUES (?)`, [normalizedTag]);
    } catch (e) {
      // Tag already exists
    }

    const result = db.exec(`SELECT id FROM tags WHERE name = ?`, [normalizedTag]);
    saveDb();
    return { id: result[0].values[0][0] };
  },

  // Add tag to link
  addTagToLink: (linkId, tagId) => {
    try {
      db.run(`INSERT INTO link_tags (link_id, tag_id) VALUES (?, ?)`, [linkId, tagId]);
      saveDb();
    } catch (e) {
      // Already exists, ignore
    }
  },

  // Remove tag from link
  removeTagFromLink: (linkId, tagId) => {
    db.run(`DELETE FROM link_tags WHERE link_id = ? AND tag_id = ?`, [linkId, tagId]);
    saveDb();
  },

  // Get all links with tags
  getAllLinks: () => {
    const result = db.exec(`
      SELECT
        l.*,
        GROUP_CONCAT(t.name) as tags
      FROM links l
      LEFT JOIN link_tags lt ON l.id = lt.link_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `);

    if (!result.length) return [];

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      obj.tags = obj.tags ? obj.tags.split(',') : [];
      return obj;
    });
  },

  // Search links
  searchLinks: (query, category, tags) => {
    let sql = `
      SELECT DISTINCT
        l.*,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM links l
      LEFT JOIN link_tags lt ON l.id = lt.link_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (query) {
      sql += ` AND (l.title LIKE ? OR l.description LIKE ? OR l.url LIKE ?)`;
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      sql += ` AND l.category = ?`;
      params.push(category);
    }

    if (tags && tags.length > 0) {
      sql += ` AND l.id IN (
        SELECT link_id FROM link_tags lt2
        JOIN tags t2 ON lt2.tag_id = t2.id
        WHERE t2.name IN (${tags.map(() => '?').join(',')})
        GROUP BY link_id
        HAVING COUNT(DISTINCT t2.name) = ?
      )`;
      params.push(...tags, tags.length);
    }

    sql += ` GROUP BY l.id ORDER BY l.created_at DESC`;

    const result = db.exec(sql, params);

    if (!result.length) return [];

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      obj.tags = obj.tags ? obj.tags.split(',') : [];
      return obj;
    });
  },

  // Get link by ID
  getLinkById: (id) => {
    const result = db.exec(`
      SELECT
        l.*,
        GROUP_CONCAT(t.name) as tags
      FROM links l
      LEFT JOIN link_tags lt ON l.id = lt.link_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE l.id = ?
      GROUP BY l.id
    `, [id]);

    if (!result.length) return null;

    const columns = result[0].columns;
    const row = result[0].values[0];
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    obj.tags = obj.tags ? obj.tags.split(',') : [];
    return obj;
  },

  // Update link
  updateLink: (id, title, description, imageUrl, category) => {
    db.run(
      `UPDATE links SET title = ?, description = ?, image_url = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, description, imageUrl, category, id]
    );
    saveDb();
    return { changes: 1 };
  },

  // Toggle completed status
  toggleComplete: (id) => {
    db.run(
      `UPDATE links SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    saveDb();
    return { changes: 1 };
  },

  // Delete link
  deleteLink: (id) => {
    db.run(`DELETE FROM links WHERE id = ?`, [id]);
    saveDb();
    return { changes: 1 };
  },

  // Bulk add tags to multiple links
  bulkAddTags: (linkIds, tagNames) => {
    for (const tagName of tagNames) {
      const tag = dbOps.getOrCreateTag(tagName);
      for (const linkId of linkIds) {
        dbOps.addTagToLink(linkId, tag.id);
      }
    }
  },

  // Bulk remove tags from multiple links
  bulkRemoveTags: (linkIds, tagNames) => {
    for (const tagName of tagNames) {
      const normalizedTag = tagName.toLowerCase().trim();
      const result = db.exec(`SELECT id FROM tags WHERE name = ?`, [normalizedTag]);
      if (result.length && result[0].values.length) {
        const tagId = result[0].values[0][0];
        for (const linkId of linkIds) {
          dbOps.removeTagFromLink(linkId, tagId);
        }
      }
    }
  },

  // Get all unique tags
  getAllTags: () => {
    const result = db.exec(`
      SELECT name, COUNT(lt.link_id) as count
      FROM tags t
      LEFT JOIN link_tags lt ON t.id = lt.tag_id
      GROUP BY t.id, t.name
      ORDER BY count DESC, name ASC
    `);

    if (!result.length) return [];

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Get all categories
  getCategories: () => {
    const result = db.exec(`
      SELECT category, COUNT(*) as count
      FROM links
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    if (!result.length) return [];

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }
};

// Export init function
export { initDatabase, saveDb };
