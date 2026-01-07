import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Initialize database schema
const initDatabase = async () => {
  const client = await pool.connect();

  try {
    // Create links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title TEXT,
        description TEXT,
        image_url TEXT,
        category TEXT,
        completed INTEGER DEFAULT 0,
        source TEXT DEFAULT 'manual',
        source_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create link_tags junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS link_tags (
        link_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (link_id, tag_id),
        FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_links_category ON links(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database operations
export const dbOps = {
  // Insert or update link
  saveLink: async (url, title, description, imageUrl, category, source = 'manual', sourceName = null) => {
    const client = await pool.connect();
    try {
      // Try to insert, on conflict update
      const result = await client.query(`
        INSERT INTO links (url, title, description, image_url, category, source, source_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (url)
        DO UPDATE SET
          title = $2,
          description = $3,
          image_url = $4,
          category = $5,
          source = $6,
          source_name = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [url, title, description, imageUrl, category, source, sourceName]);

      return { id: result.rows[0].id };
    } finally {
      client.release();
    }
  },

  // Get or create tag
  getOrCreateTag: async (tagName) => {
    const normalizedTag = tagName.toLowerCase().trim();
    const client = await pool.connect();

    try {
      const result = await client.query(`
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = $1
        RETURNING id
      `, [normalizedTag]);

      return { id: result.rows[0].id };
    } finally {
      client.release();
    }
  },

  // Add tag to link
  addTagToLink: async (linkId, tagId) => {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO link_tags (link_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [linkId, tagId]);
    } finally {
      client.release();
    }
  },

  // Remove tag from link
  removeTagFromLink: async (linkId, tagId) => {
    const client = await pool.connect();
    try {
      await client.query(`
        DELETE FROM link_tags
        WHERE link_id = $1 AND tag_id = $2
      `, [linkId, tagId]);
    } finally {
      client.release();
    }
  },

  // Get all links with tags
  getAllLinks: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          l.*,
          COALESCE(
            array_to_string(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), ','),
            ''
          ) as tags
        FROM links l
        LEFT JOIN link_tags lt ON l.id = lt.link_id
        LEFT JOIN tags t ON lt.tag_id = t.id
        GROUP BY l.id
        ORDER BY l.created_at DESC
      `);

      return result.rows.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',') : []
      }));
    } finally {
      client.release();
    }
  },

  // Search links
  searchLinks: async (query, category, tags) => {
    const client = await pool.connect();
    try {
      let sql = `
        SELECT DISTINCT
          l.*,
          COALESCE(
            array_to_string(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), ','),
            ''
          ) as tags
        FROM links l
        LEFT JOIN link_tags lt ON l.id = lt.link_id
        LEFT JOIN tags t ON lt.tag_id = t.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (query) {
        sql += ` AND (l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount + 1} OR l.url ILIKE $${paramCount + 2})`;
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern, searchPattern);
        paramCount += 3;
      }

      if (category) {
        sql += ` AND l.category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (tags && tags.length > 0) {
        const tagPlaceholders = tags.map((_, i) => `$${paramCount + i}`).join(',');
        sql += ` AND l.id IN (
          SELECT link_id FROM link_tags lt2
          JOIN tags t2 ON lt2.tag_id = t2.id
          WHERE t2.name IN (${tagPlaceholders})
          GROUP BY link_id
          HAVING COUNT(DISTINCT t2.name) = $${paramCount + tags.length}
        )`;
        params.push(...tags, tags.length);
        paramCount += tags.length + 1;
      }

      sql += ` GROUP BY l.id ORDER BY l.created_at DESC`;

      const result = await client.query(sql, params);

      return result.rows.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',') : []
      }));
    } finally {
      client.release();
    }
  },

  // Get link by ID
  getLinkById: async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          l.*,
          COALESCE(
            array_to_string(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), ','),
            ''
          ) as tags
        FROM links l
        LEFT JOIN link_tags lt ON l.id = lt.link_id
        LEFT JOIN tags t ON lt.tag_id = t.id
        WHERE l.id = $1
        GROUP BY l.id
      `, [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? row.tags.split(',') : []
      };
    } finally {
      client.release();
    }
  },

  // Update link
  updateLink: async (id, title, description, imageUrl, category) => {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE links
        SET title = $1, description = $2, image_url = $3, category = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [title, description, imageUrl, category, id]);

      return { changes: 1 };
    } finally {
      client.release();
    }
  },

  // Toggle completed status
  toggleComplete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE links
        SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      return { changes: 1 };
    } finally {
      client.release();
    }
  },

  // Delete link
  deleteLink: async (id) => {
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM links WHERE id = $1`, [id]);
      return { changes: 1 };
    } finally {
      client.release();
    }
  },

  // Bulk add tags to multiple links
  bulkAddTags: async (linkIds, tagNames) => {
    for (const tagName of tagNames) {
      const tag = await dbOps.getOrCreateTag(tagName);
      for (const linkId of linkIds) {
        await dbOps.addTagToLink(linkId, tag.id);
      }
    }
  },

  // Bulk remove tags from multiple links
  bulkRemoveTags: async (linkIds, tagNames) => {
    const client = await pool.connect();
    try {
      for (const tagName of tagNames) {
        const normalizedTag = tagName.toLowerCase().trim();
        const result = await client.query(`SELECT id FROM tags WHERE name = $1`, [normalizedTag]);
        if (result.rows.length > 0) {
          const tagId = result.rows[0].id;
          for (const linkId of linkIds) {
            await dbOps.removeTagFromLink(linkId, tagId);
          }
        }
      }
    } finally {
      client.release();
    }
  },

  // Get all unique tags
  getAllTags: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT t.name, COUNT(lt.link_id) as count
        FROM tags t
        LEFT JOIN link_tags lt ON t.id = lt.tag_id
        GROUP BY t.id, t.name
        ORDER BY count DESC, name ASC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get all categories
  getCategories: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT category, COUNT(*) as count
        FROM links
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }
};

// Export init function
export { initDatabase };
