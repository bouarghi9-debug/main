import { config } from '../config';
import { Position } from '../types';

export type ExitReason = 'stop_loss' | 'take_profit' | 'trailing_stop' | null;

/**
 * Fast, tight exit rules: hard stop-loss, take-profit target, and a
 * trailing stop that locks in gains once the position has moved favorably.
 */
export function checkExit(position: Position, currentPriceUsd: number): ExitReason {
  const pnlPct = ((currentPriceUsd - position.entryPriceUsd) / position.entryPriceUsd) * 100;

  if (pnlPct <= -config.stopLossPct) {
    return 'stop_loss';
  }
  if (pnlPct >= config.takeProfitPct) {
    return 'take_profit';
  }

  const dropFromPeakPct = ((currentPriceUsd - position.peakPriceUsd) / position.peakPriceUsd) * 100;
  const gainFromEntryPct = ((position.peakPriceUsd - position.entryPriceUsd) / position.entryPriceUsd) * 100;
  if (gainFromEntryPct > 5 && dropFromPeakPct <= -config.trailingStopPct) {
    return 'trailing_stop';
  }

  return null;
}

export function positionSizeSol(availableSol: number): number {
  return Math.min(config.maxPositionSol, availableSol);
}
