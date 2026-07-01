import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(path.join(DATA_DIR, 'agent.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mint TEXT NOT NULL,
  symbol TEXT NOT NULL,
  entry_price_usd REAL NOT NULL,
  peak_price_usd REAL NOT NULL,
  sol_spent REAL NOT NULL,
  token_amount REAL NOT NULL,
  opened_at INTEGER NOT NULL,
  closed_at INTEGER,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  position_id INTEGER,
  mint TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  price_usd REAL NOT NULL,
  sol_amount REAL NOT NULL,
  token_amount REAL NOT NULL,
  mode TEXT NOT NULL,
  tx_signature TEXT,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS seen_tokens (
  mint TEXT PRIMARY KEY,
  first_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_pnl (
  day TEXT PRIMARY KEY,
  realized_pnl_sol REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS paper_wallet (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  sol_balance REAL NOT NULL
);
`);
