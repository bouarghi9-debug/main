import { config } from '../config';
import { Position, TradeRecord } from '../types';
import { db } from './db';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export function isSeen(mint: string): boolean {
  const row = db.prepare('SELECT 1 FROM seen_tokens WHERE mint = ?').get(mint);
  return !!row;
}

export function markSeen(mint: string): void {
  db.prepare('INSERT OR IGNORE INTO seen_tokens (mint, first_seen_at) VALUES (?, ?)').run(mint, Date.now());
}

export function getOpenPositions(): Position[] {
  const rows = db.prepare("SELECT * FROM positions WHERE status = 'open'").all() as any[];
  return rows.map(rowToPosition);
}

export function countOpenPositions(): number {
  const row = db.prepare("SELECT COUNT(*) as n FROM positions WHERE status = 'open'").get() as { n: number };
  return row.n;
}

export function hasOpenPosition(mint: string): boolean {
  const row = db.prepare("SELECT 1 FROM positions WHERE mint = ? AND status = 'open'").get(mint);
  return !!row;
}

function rowToPosition(row: any): Position {
  return {
    id: row.id,
    mint: row.mint,
    symbol: row.symbol,
    entryPriceUsd: row.entry_price_usd,
    peakPriceUsd: row.peak_price_usd,
    solSpent: row.sol_spent,
    tokenAmount: row.token_amount,
    openedAt: row.opened_at,
    status: row.status,
  };
}

export function openPosition(p: {
  mint: string;
  symbol: string;
  entryPriceUsd: number;
  solSpent: number;
  tokenAmount: number;
}): Position {
  const info = db
    .prepare(
      `INSERT INTO positions (mint, symbol, entry_price_usd, peak_price_usd, sol_spent, token_amount, opened_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`
    )
    .run(p.mint, p.symbol, p.entryPriceUsd, p.entryPriceUsd, p.solSpent, p.tokenAmount, Date.now());
  return { id: Number(info.lastInsertRowid), status: 'open', peakPriceUsd: p.entryPriceUsd, openedAt: Date.now(), ...p };
}

export function updatePeakPrice(positionId: number, peakPriceUsd: number): void {
  db.prepare('UPDATE positions SET peak_price_usd = ? WHERE id = ?').run(peakPriceUsd, positionId);
}

export function closePosition(positionId: number): void {
  db.prepare("UPDATE positions SET status = 'closed', closed_at = ? WHERE id = ?").run(Date.now(), positionId);
}

export function recordTrade(t: {
  positionId: number | null;
  mint: string;
  symbol: string;
  side: 'buy' | 'sell';
  priceUsd: number;
  solAmount: number;
  tokenAmount: number;
  txSignature: string | null;
  reason: string;
}): TradeRecord {
  const createdAt = Date.now();
  const info = db
    .prepare(
      `INSERT INTO trades (position_id, mint, symbol, side, price_usd, sol_amount, token_amount, mode, tx_signature, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      t.positionId,
      t.mint,
      t.symbol,
      t.side,
      t.priceUsd,
      t.solAmount,
      t.tokenAmount,
      config.tradingMode,
      t.txSignature,
      t.reason,
      createdAt
    );
  return { id: Number(info.lastInsertRowid), mode: config.tradingMode, createdAt, ...t };
}

export function addRealizedPnl(solDelta: number): void {
  const day = todayKey();
  db.prepare(
    `INSERT INTO daily_pnl (day, realized_pnl_sol) VALUES (?, ?)
     ON CONFLICT(day) DO UPDATE SET realized_pnl_sol = realized_pnl_sol + excluded.realized_pnl_sol`
  ).run(day, solDelta);
}

export function getTodayRealizedPnl(): number {
  const row = db.prepare('SELECT realized_pnl_sol FROM daily_pnl WHERE day = ?').get(todayKey()) as
    | { realized_pnl_sol: number }
    | undefined;
  return row?.realized_pnl_sol ?? 0;
}

export function dailyLossLimitHit(): boolean {
  return getTodayRealizedPnl() <= -Math.abs(config.dailyLossLimitSol);
}

export function getPaperSolBalance(): number {
  const row = db.prepare('SELECT sol_balance FROM paper_wallet WHERE id = 1').get() as
    | { sol_balance: number }
    | undefined;
  if (!row) {
    db.prepare('INSERT INTO paper_wallet (id, sol_balance) VALUES (1, ?)').run(config.paperStartingSol);
    return config.paperStartingSol;
  }
  return row.sol_balance;
}

export function adjustPaperSolBalance(delta: number): number {
  const current = getPaperSolBalance();
  const next = current + delta;
  db.prepare('UPDATE paper_wallet SET sol_balance = ? WHERE id = 1').run(next);
  return next;
}
