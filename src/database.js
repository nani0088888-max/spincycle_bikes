const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const configuredPath = process.env.DB_PATH || './data/spincycle.db';
const dbPath = path.resolve(configuredPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row || null));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS riders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bikes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'rented', 'maintenance')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rider_id INTEGER NOT NULL,
      bike_id INTEGER NOT NULL,
      rented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      returned_at TEXT,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'returned')),
      FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE RESTRICT,
      FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE RESTRICT
    )
  `);
}

module.exports = { db, run, get, all, initializeDatabase };