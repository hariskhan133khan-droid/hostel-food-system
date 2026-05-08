const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file hostel_food.db naam se save hogi
const DB_PATH = path.join(__dirname, 'hostel_food.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connect nahi hua:', err.message);
  } else {
    console.log('✅ SQLite database connected: hostel_food.db');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {

    // ── Members table ──────────────────────────────
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL UNIQUE,
        paid       INTEGER NOT NULL DEFAULT 0,
        remaining  INTEGER NOT NULL DEFAULT 1500,
        image_url  TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── Expenses table ─────────────────────────────
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        amount     INTEGER NOT NULL,
        note       TEXT    DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── Seed members (agar pehle se nahi hain) ─────
    const members = [
      { name: 'Sadiq',    image: 'https://i.postimg.cc/xC8s0VgV/Whats-App-Image-2026-05-07-at-5-56-49-AM.jpg' },
      { name: 'Haris',    image: 'https://i.postimg.cc/G2n0t2BM/Whats-App-Image-2026-05-05-at-12-46-05-PM.jpg' },
      { name: 'Noor',     image: 'https://i.postimg.cc/WzjhGTyM/Whats-App-Image-2026-05-07-at-5-50-12-AM.jpg' },
      { name: 'Hamayoon', image: 'https://i.postimg.cc/VNDMLSHs/Whats-App-Image-2026-05-06-at-7-56-23-PM.jpg' },
      { name: 'Sajid',    image: 'https://i.postimg.cc/k5FsNX1s/Whats-App-Image-2026-05-06-at-1-12-12-PM.jpg' },
      { name: 'Ibrar',    image: 'https://i.postimg.cc/02jJc2jN/Whats-App-Image-2026-05-07-at-5-59-48-AM-(1).jpg' },
      { name: 'Usama',    image: 'https://i.postimg.cc/SRsjTDyn/Whats-App-Image-2026-05-07-at-5-59-48-AM.jpg' },
      { name: 'Zahid',    image: 'https://i.postimg.cc/Bn2Bsn0S/Whats-App-Image-2026-05-06-at-7-42-38-PM.jpg' },
      { name: 'Niaz',     image: 'https://i.postimg.cc/rwvWdX8F/Whats-App-Image-2026-05-07-at-5-59-48-AM-(2).jpg' },
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO members (name, paid, remaining, image_url)
      VALUES (?, 0, 1500, ?)
    `);

    members.forEach(m => stmt.run(m.name, m.image));
    stmt.finalize();

    console.log('✅ Tables ready, members seed ho gaye');
  });
}

module.exports = db;
