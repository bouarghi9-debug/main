import { config } from '../config';
import { createLogger } from '../logger';

const log = createLogger('social-sentiment');

export interface SocialSentimentProvider {
  /** Returns a 0-100 sentiment score, or null if unavailable for this token. */
  getScore(symbol: string): Promise<number | null>;
}

class NullProvider implements SocialSentimentProvider {
  async getScore(): Promise<number | null> {
    return null;
  }
}

/**
 * Optional adapter for LunarCrush's public v4 API (social volume/sentiment
 * for crypto assets by symbol). Requires LUNARCRUSH_API_KEY. This is the
 * only provider wired up out of the box; swap in another service by
 * implementing SocialSentimentProvider and registering it in
 * getSentimentProvider() below.
 */
class LunarCrushProvider implements SocialSentimentProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getScore(symbol: string): Promise<number | null> {
    try {
      const res = await fetch(`https://lunarcrush.com/api4/public/coins/${encodeURIComponent(symbol)}/v1`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) {
        log.warn(`LunarCrush HTTP ${res.status} for ${symbol}`);
        return null;
      }
      const json = (await res.json()) as { data?: { galaxy_score?: number } };
      const galaxyScore = json.data?.galaxy_score;
      if (typeof galaxyScore !== 'number') return null;
      // galaxy_score is already roughly 0-100.
      return Math.max(0, Math.min(100, galaxyScore));
    } catch (err) {
      log.warn(`LunarCrush lookup failed for ${symbol}`, String(err));
      return null;
    }
  }
}

export function getSentimentProvider(): SocialSentimentProvider {
  if (config.sentimentProvider === 'lunarcrush' && config.lunarcrushApiKey) {
    return new LunarCrushProvider(config.lunarcrushApiKey);
  }
  if (config.sentimentProvider !== 'none') {
    log.warn(
      `SENTIMENT_PROVIDER=${config.sentimentProvider} but no matching API key configured; falling back to momentum-only scoring`
    );
  }
  return new NullProvider();
}
