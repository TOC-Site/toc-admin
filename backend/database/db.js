const { createClient } = require('@libsql/client');

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL || 'file:' + __dirname + '/toc.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready = false;

async function init() {
  if (ready) return;

  await client.batch([
    { sql: 'PRAGMA foreign_keys = ON', args: [] },
    {
      sql: `CREATE TABLE IF NOT EXISTS admin_users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL DEFAULT 'Admin',
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS categories (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT UNIQUE NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS products (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        category     TEXT NOT NULL,
        sub          TEXT,
        flavor       TEXT DEFAULT 'Unflavored',
        weight       TEXT,
        servings     INTEGER DEFAULT 0,
        serving_size TEXT,
        protein      INTEGER,
        price        INTEGER NOT NULL DEFAULT 0,
        badge        TEXT,
        in_stock     INTEGER DEFAULT 1,
        img          TEXT,
        img_bg       TEXT DEFAULT '#f0ede4',
        sku          TEXT UNIQUE,
        description  TEXT,
        tags         TEXT DEFAULT '[]',
        variant_key  TEXT,
        variant_map  TEXT DEFAULT '{}',
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
  ], 'write');

  const cats = ['Sports Nutrition', 'Oats & Breakfast', 'Peanut Butter', 'Ayurvedic', 'Essentials'];
  for (let i = 0; i < cats.length; i++) {
    await client.execute({
      sql:  'INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)',
      args: [cats[i], i],
    });
  }

  const { rows } = await client.execute('SELECT COUNT(*) as c FROM admin_users');
  if (Number(rows[0].c) === 0) {
    const bcrypt = require('bcryptjs');
    await client.execute({
      sql: 'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
      args: ['admin@theorganiccosmos.com', bcrypt.hashSync('Admin@TOC2025', 12), 'TOC Admin'],
    });
    console.log('Auto-seeded admin user');
  }

  ready = true;
}

module.exports = { client, init };
