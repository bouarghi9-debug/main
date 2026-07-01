import { config } from '../config';
import { DexPair, ScoreResult } from '../types';
import { computeMomentumScore } from './momentum';
import { getSentimentProvider } from './social';

const socialProvider = getSentimentProvider();

export async function scoreCandidate(symbol: string, pair: DexPair): Promise<ScoreResult> {
  const momentum = computeMomentumScore(pair);
  const sentiment = await socialProvider.getScore(symbol);

  let total: number;
  let breakdown: string;
  if (sentiment === null) {
    total = momentum;
    breakdown = `momentum=${momentum} (no social sentiment provider configured)`;
  } else {
    const wSum = config.momentumWeight + config.sentimentWeight;
    total = (momentum * config.momentumWeight + sentiment * config.sentimentWeight) / wSum;
    breakdown = `momentum=${momentum} sentiment=${sentiment} weighted=${total.toFixed(1)}`;
  }

  return { total: Math.round(total), momentum, sentiment, breakdown };
}
