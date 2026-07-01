export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const LAMPORTS_PER_SOL = 1_000_000_000;

export interface DexPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number; base?: number; quote?: number };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
  };
  pairCreatedAt?: number; // ms epoch
  fdv?: number;
  marketCap?: number;
}

export interface TokenCandidate {
  mint: string;
  symbol: string;
  name: string;
  pair: DexPair;
}

export interface SafetyResult {
  passed: boolean;
  reasons: string[];
  topHolderPct?: number;
  mintAuthorityRenounced?: boolean;
  freezeAuthorityRenounced?: boolean;
}

export interface ScoreResult {
  total: number; // 0-100
  momentum: number; // 0-100
  sentiment: number | null; // 0-100 or null if unavailable
  breakdown: string;
}

export interface Position {
  id: number;
  mint: string;
  symbol: string;
  entryPriceUsd: number;
  peakPriceUsd: number;
  solSpent: number;
  tokenAmount: number;
  openedAt: number;
  status: 'open' | 'closed';
}

export interface TradeRecord {
  id: number;
  positionId: number | null;
  mint: string;
  symbol: string;
  side: 'buy' | 'sell';
  priceUsd: number;
  solAmount: number;
  tokenAmount: number;
  mode: 'paper' | 'live';
  txSignature: string | null;
  reason: string;
  createdAt: number;
}
