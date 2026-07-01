import { Connection } from '@solana/web3.js';
import { config } from '../config';
import { bestPairPerToken, fetchLatestBoostedTokens, fetchPairsForTokens } from '../data/dexscreener';
import { passesOnchainFilters, passesQuickFilters } from '../data/safety';
import { createLogger } from '../logger';
import * as repo from '../persistence/repository';
import { scoreCandidate } from '../sentiment';
import { DexPair } from '../types';
import { TradeExecutor } from '../execution/types';
import { checkExit, positionSizeSol } from './riskManager';

const log = createLogger('engine');

export class TradingEngine {
  constructor(private readonly connection: Connection, private readonly executor: TradeExecutor) {}

  async run(): Promise<void> {
    log.info(`Engine starting in ${config.tradingMode.toUpperCase()} mode`);
    await this.scanCycle().catch((err) => log.error('scanCycle failed', String(err)));
    await this.manageCycle().catch((err) => log.error('manageCycle failed', String(err)));

    setInterval(() => {
      this.scanCycle().catch((err) => log.error('scanCycle failed', String(err)));
    }, config.scanIntervalMs);

    setInterval(() => {
      this.manageCycle().catch((err) => log.error('manageCycle failed', String(err)));
    }, config.positionCheckIntervalMs);
  }

  async scanCycle(): Promise<void> {
    if (repo.dailyLossLimitHit()) {
      log.warn('daily loss limit hit — skipping new entries until UTC day rolls over');
      return;
    }
    if (repo.countOpenPositions() >= config.maxConcurrentPositions) {
      log.debug('max concurrent positions reached — skipping scan entries');
      return;
    }

    const boosts = await fetchLatestBoostedTokens();
    const candidateMints = [...new Set(boosts.map((b) => b.tokenAddress))].filter((mint) => !repo.isSeen(mint));
    if (candidateMints.length === 0) return;

    const pairs = await fetchPairsForTokens(candidateMints);
    const byMint = bestPairPerToken(pairs);

    for (const [mint, pair] of byMint) {
      if (repo.countOpenPositions() >= config.maxConcurrentPositions) break;
      await this.evaluateCandidate(mint, pair);
    }
  }

  private async evaluateCandidate(mint: string, pair: DexPair): Promise<void> {
    repo.markSeen(mint);

    if (repo.hasOpenPosition(mint)) return;

    const quick = passesQuickFilters(pair);
    if (!quick.passed) {
      log.debug(`${pair.baseToken.symbol} rejected (quick filters): ${quick.reasons.join('; ')}`);
      return;
    }

    const onchain = await passesOnchainFilters(this.connection, mint);
    if (!onchain.passed) {
      log.info(`${pair.baseToken.symbol} rejected (on-chain safety): ${onchain.reasons.join('; ')}`);
      return;
    }

    const score = await scoreCandidate(pair.baseToken.symbol, pair);
    log.info(`${pair.baseToken.symbol} (${mint}) score=${score.total} [${score.breakdown}]`);
    if (score.total < config.entryScoreThreshold) return;

    await this.enter(mint, pair);
  }

  private async enter(mint: string, pair: DexPair): Promise<void> {
    const availableSol = await this.executor.getSolBalance();
    const solAmount = positionSizeSol(availableSol);
    if (solAmount <= 0) {
      log.warn('no available SOL balance to enter a position');
      return;
    }

    const result = await this.executor.buy(mint, solAmount);
    if (!result) {
      log.warn(`buy failed for ${pair.baseToken.symbol}`);
      return;
    }

    const entryPriceUsd = Number(pair.priceUsd ?? 0);
    const position = repo.openPosition({
      mint,
      symbol: pair.baseToken.symbol,
      entryPriceUsd,
      solSpent: result.solAmount,
      tokenAmount: result.tokenAmountRaw,
    });

    repo.recordTrade({
      positionId: position.id,
      mint,
      symbol: pair.baseToken.symbol,
      side: 'buy',
      priceUsd: entryPriceUsd,
      solAmount: result.solAmount,
      tokenAmount: result.tokenAmountRaw,
      txSignature: result.txSignature,
      reason: 'entry signal',
    });

    log.info(`ENTERED ${pair.baseToken.symbol}: spent ${result.solAmount} SOL @ $${entryPriceUsd}`);
  }

  async manageCycle(): Promise<void> {
    const positions = repo.getOpenPositions();
    if (positions.length === 0) return;

    const pairs = await fetchPairsForTokens(positions.map((p) => p.mint));
    const byMint = bestPairPerToken(pairs);

    for (const position of positions) {
      const pair = byMint.get(position.mint);
      if (!pair || !pair.priceUsd) {
        log.warn(`no price data for open position ${position.symbol} (${position.mint})`);
        continue;
      }

      const currentPriceUsd = Number(pair.priceUsd);
      if (currentPriceUsd > position.peakPriceUsd) {
        repo.updatePeakPrice(position.id, currentPriceUsd);
        position.peakPriceUsd = currentPriceUsd;
      }

      const exitReason = checkExit(position, currentPriceUsd);
      if (exitReason) {
        await this.exit(position, currentPriceUsd, exitReason);
      }
    }
  }

  private async exit(
    position: ReturnType<typeof repo.getOpenPositions>[number],
    currentPriceUsd: number,
    reason: string
  ): Promise<void> {
    const result = await this.executor.sell(position.mint, position.tokenAmount);
    if (!result) {
      log.error(`SELL FAILED for ${position.symbol} (${reason}) — position remains open, will retry next cycle`);
      return;
    }

    repo.recordTrade({
      positionId: position.id,
      mint: position.mint,
      symbol: position.symbol,
      side: 'sell',
      priceUsd: currentPriceUsd,
      solAmount: result.solAmount,
      tokenAmount: result.tokenAmountRaw,
      txSignature: result.txSignature,
      reason,
    });
    repo.closePosition(position.id);

    const pnlSol = result.solAmount - position.solSpent;
    repo.addRealizedPnl(pnlSol);

    const pnlPct = (pnlSol / position.solSpent) * 100;
    log.info(
      `EXITED ${position.symbol} (${reason}): received ${result.solAmount.toFixed(4)} SOL, ` +
        `pnl=${pnlSol.toFixed(4)} SOL (${pnlPct.toFixed(1)}%)`
    );
  }
}
