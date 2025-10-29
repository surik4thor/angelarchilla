const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const FormData = require('form-data');

// Config
const SQLITE_DB = process.env.SQLITE_DB || '/tmp/strapi_data.db';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nebulosamagica.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.STRAPI_ADMIN_PASSWORD || '';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || '';

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD not set. Provide via env ADMIN_PASSWORD or STRAPI_ADMIN_PASSWORD');
  process.exit(1);
}

async function loginAdmin() {
  if (ADMIN_API_TOKEN) {
    console.log('Using ADMIN_API_TOKEN from env');
    return ADMIN_API_TOKEN;
  }
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD not set and no ADMIN_API_TOKEN provided');
  }
  const url = `${STRAPI_URL}/admin/login`;
  // Try with 'email' first, then fallback to 'identifier'
  try {
    const res = await axios.post(url, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    return res.data.data.token;
  } catch (e) {
    try {
      const res2 = await axios.post(url, { identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      return res2.data.data.token;
    } catch (e2) {
      // Re-throw original error for visibility
      throw e2;
    }
  }
}

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function createEntry(token, contentType, data) {
  const url = `${STRAPI_URL}/api/${contentType}`;
  if (DRY_RUN) {
    console.log(`[DRY_RUN] would POST to ${url} with`, data);
    return { data: { id: null } };
  }
  const res = await axios.post(url, { data }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

async function uploadFile(token, filepath, field = 'files') {
  const url = `${STRAPI_URL}/api/upload`;
  const form = new FormData();
  form.append('files', fs.createReadStream(filepath));
  const res = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders()
    }
  });
  return res.data;
}

async function migrate() {
  if (!fs.existsSync(SQLITE_DB)) {
    console.error('SQLite DB not found at', SQLITE_DB);
    process.exit(1);
  }

  const db = new sqlite3.Database(SQLITE_DB, sqlite3.OPEN_READONLY);
  const token = await loginAdmin();
  console.log('Authenticated with Strapi. Token length:', token ? String(token).length : 'N/A');

  // Example: migrate categories
  db.serialize(async () => {
  db.all('SELECT * FROM categories', async (err, rows) => {
      if (err) { console.error(err); return; }
      console.log('Found categories:', rows.length);
      for (const r of rows) {
        const data = { title: r.title, slug: r.slug, description: r.description };
        try {
          const res = await createEntry(token, 'categories', data);
          console.log('Created category', res.data?.id || '(dry)');
        } catch (e) {
          console.error('Failed category', r.id, e?.response?.data || e.message);
        }
      }
    });

    // Migrate blog posts (example, adjust column names)
  db.all('SELECT * FROM blog_posts', async (err2, posts) => {
      if (err2) { console.error(err2); return; }
      console.log('Found blog_posts:', posts.length);
      for (const p of posts) {
        const data = {
          title: p.title,
          content: p.content,
          publishedAt: p.published_at || null
        };
        try {
          const res = await createEntry(token, 'blog-posts', data);
          console.log('Created blog_post', res.data?.id || '(dry)');
        } catch (e) {
          console.error('Failed blog_post', p.id, e?.response?.data || e.message);
        }
      }
    });
  });
}

migrate().catch((e) => { console.error(e); process.exit(1); });
