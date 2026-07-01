import { Connection } from '@solana/web3.js';
import { config } from './config';
import { createLogger } from './logger';
import './persistence/db'; // ensure tables exist before anything else runs
import { PaperExecutor } from './execution/paperExecutor';
import { LiveExecutor } from './execution/liveExecutor';
import { TradeExecutor } from './execution/types';
import { TradingEngine } from './strategy/engine';

const log = createLogger('main');

function banner(): void {
  const line = '='.repeat(60);
  log.info(line);
  log.info(`Meme coin trading agent starting — mode: ${config.tradingMode.toUpperCase()}`);
  if (config.tradingMode === 'live') {
    log.warn('LIVE TRADING IS ARMED. Real funds will be used automatically.');
    log.warn(`Per-trade cap: ${config.maxPositionSol} SOL | Daily loss limit: ${config.dailyLossLimitSol} SOL`);
  } else {
    log.info('Paper trading mode: no real funds are used. Set TRADING_MODE=live to go live.');
  }
  log.info(line);
}

async function main(): Promise<void> {
  banner();

  const connection = new Connection(config.solanaRpcUrl, 'confirmed');
  const executor: TradeExecutor = config.tradingMode === 'live' ? new LiveExecutor(connection) : new PaperExecutor();

  const engine = new TradingEngine(connection, executor);
  await engine.run();
}

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down');
  process.exit(0);
});
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down');
  process.exit(0);
});
process.on('unhandledRejection', (err) => {
  log.error('unhandledRejection', String(err));
});

main().catch((err) => {
  log.error('fatal startup error', String(err));
  process.exit(1);
});
