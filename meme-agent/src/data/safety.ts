import { Connection } from '@solana/web3.js';
import { config } from '../config';
import { checkMintSafety } from '../onchain/mintSafety';
import { DexPair, SafetyResult } from '../types';

/**
 * Cheap checks using only DexScreener fields (liquidity, age, volume,
 * buy/sell pressure). Run this before the on-chain check to avoid wasting
 * RPC calls on obviously bad candidates.
 */
export function passesQuickFilters(pair: DexPair): SafetyResult {
  const reasons: string[] = [];

  const liquidityUsd = pair.liquidity?.usd ?? 0;
  if (liquidityUsd < config.minLiquidityUsd) {
    reasons.push(`liquidity $${liquidityUsd.toFixed(0)} < min $${config.minLiquidityUsd}`);
  }

  const volume5m = pair.volume?.m5 ?? 0;
  if (volume5m < config.minVolume5mUsd) {
    reasons.push(`5m volume $${volume5m.toFixed(0)} < min $${config.minVolume5mUsd}`);
  }

  if (pair.pairCreatedAt) {
    const ageMinutes = (Date.now() - pair.pairCreatedAt) / 60_000;
    if (ageMinutes > config.maxTokenAgeMinutes) {
      reasons.push(`pair age ${ageMinutes.toFixed(0)}m > max ${config.maxTokenAgeMinutes}m`);
    }
    if (ageMinutes < 0) {
      reasons.push('pair createdAt is in the future (bad data)');
    }
  } else {
    reasons.push('missing pairCreatedAt');
  }

  const txns5m = pair.txns?.m5;
  if (txns5m) {
    const total = txns5m.buys + txns5m.sells;
    if (total > 0 && txns5m.sells / total > 0.85) {
      reasons.push(`sell pressure too high (${txns5m.sells}/${total} sells in 5m)`);
    }
  }

  return { passed: reasons.length === 0, reasons };
}

/**
 * Full safety check including on-chain mint/freeze authority and holder
 * concentration. Only call this after passesQuickFilters() to conserve RPC
 * calls.
 */
export async function passesOnchainFilters(connection: Connection, mint: string): Promise<SafetyResult> {
  const reasons: string[] = [];

  const safety = await checkMintSafety(connection, mint);

  if (config.requireMintAuthorityRenounced && !safety.mintAuthorityRenounced) {
    reasons.push('mint authority not renounced (deployer can mint more supply)');
  }
  if (config.requireFreezeAuthorityRenounced && !safety.freezeAuthorityRenounced) {
    reasons.push('freeze authority not renounced (deployer can freeze your tokens)');
  }
  if (safety.topHolderPct !== null && safety.topHolderPct > config.maxTopHolderPct) {
    reasons.push(`top holder owns ${safety.topHolderPct.toFixed(1)}% > max ${config.maxTopHolderPct}%`);
  }

  return {
    passed: reasons.length === 0,
    reasons,
    topHolderPct: safety.topHolderPct ?? undefined,
    mintAuthorityRenounced: safety.mintAuthorityRenounced,
    freezeAuthorityRenounced: safety.freezeAuthorityRenounced,
  };
}
