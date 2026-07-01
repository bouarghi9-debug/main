import { DexPair } from '../types';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Momentum/hype proxy derived purely from on-chain trading data
 * (DexScreener). This is a stand-in for "sentiment" that requires no API
 * key: strong, accelerating buy volume and price action is a reasonable
 * real-time proxy for social hype in the first hours of a meme coin's life,
 * and unlike a social API it can't be gamed by bot-farmed tweets alone.
 *
 * Returns a 0-100 score.
 */
export function computeMomentumScore(pair: DexPair): number {
  let score = 0;

  // Price action (up to 40 pts): reward positive, penalize sharply negative.
  const change5m = pair.priceChange?.m5 ?? 0;
  const change1h = pair.priceChange?.h1 ?? 0;
  score += clamp(change5m, -20, 20); // -20..20
  score += clamp(change1h / 2, -20, 20); // -20..20

  // Volume acceleration (up to 30 pts): 5m volume annualized to hourly vs
  // the trailing hourly volume tells us if buying is accelerating right now.
  const vol5m = pair.volume?.m5 ?? 0;
  const vol1h = pair.volume?.h1 ?? 0;
  const impliedHourlyFrom5m = vol5m * 12;
  const accelRatio = vol1h > 0 ? impliedHourlyFrom5m / vol1h : vol5m > 0 ? 2 : 0;
  score += clamp((accelRatio - 1) * 20, 0, 30);

  // Buy/sell pressure (up to 30 pts).
  const txns = pair.txns?.m5;
  if (txns && txns.buys + txns.sells > 0) {
    const buyRatio = txns.buys / (txns.buys + txns.sells);
    score += clamp((buyRatio - 0.5) * 60, -30, 30);
  }

  return clamp(Math.round(score + 50), 0, 100);
}
