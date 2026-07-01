import { config } from '../config';
import { createLogger } from '../logger';
import { DexPair } from '../types';

const log = createLogger('dexscreener');

interface TokenBoost {
  url: string;
  chainId: string;
  tokenAddress: string;
}

interface PairsResponse {
  pairs: DexPair[] | null;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      log.warn(`GET ${url} -> HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    log.warn(`GET ${url} failed`, String(err));
    return null;
  }
}

/**
 * Recently boosted/trending tokens across all chains. Used as a discovery
 * seed for candidate Solana meme coins. Keyless, public DexScreener endpoint.
 */
export async function fetchLatestBoostedTokens(): Promise<TokenBoost[]> {
  const data = await getJson<TokenBoost[]>(`${config.dexscreenerApiBase}/token-boosts/latest/v1`);
  if (!data) return [];
  return data.filter((t) => t.chainId === 'solana');
}

/**
 * Full pair data (liquidity/volume/price change/txns) for up to 30 token
 * addresses on Solana in a single call.
 */
export async function fetchPairsForTokens(tokenAddresses: string[]): Promise<DexPair[]> {
  if (tokenAddresses.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < tokenAddresses.length; i += 30) {
    chunks.push(tokenAddresses.slice(i, i + 30));
  }

  const out: DexPair[] = [];
  for (const chunk of chunks) {
    const url = `${config.dexscreenerApiBase}/latest/dex/tokens/${chunk.join(',')}`;
    const data = await getJson<PairsResponse>(url);
    if (data?.pairs) {
      out.push(...data.pairs.filter((p) => p.chainId === 'solana'));
    }
  }
  return out;
}

/** Best (highest liquidity) pair per unique base token address. */
export function bestPairPerToken(pairs: DexPair[]): Map<string, DexPair> {
  const best = new Map<string, DexPair>();
  for (const pair of pairs) {
    const mint = pair.baseToken.address;
    const existing = best.get(mint);
    const liq = pair.liquidity?.usd ?? 0;
    if (!existing || liq > (existing.liquidity?.usd ?? 0)) {
      best.set(mint, pair);
    }
  }
  return best;
}
