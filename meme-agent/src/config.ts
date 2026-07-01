import 'dotenv/config';

export type TradingMode = 'paper' | 'live';

const LIVE_CONFIRM_PHRASE = 'I_UNDERSTAND_THE_RISK';

function envStr(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env var ${name}`);
  }
  return v;
}

function envNum(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Env var ${name} must be a number, got "${v}"`);
  return n;
}

function envBool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v.toLowerCase() === 'true' || v === '1';
}

export interface AgentConfig {
  tradingMode: TradingMode;
  solanaRpcUrl: string;
  jupiterApiBase: string;
  dexscreenerApiBase: string;

  walletPrivateKeyBase58: string | undefined;

  paperStartingSol: number;

  // scan / loop timing
  scanIntervalMs: number;
  positionCheckIntervalMs: number;

  // safety filters
  minLiquidityUsd: number;
  maxTokenAgeMinutes: number;
  minVolume5mUsd: number;
  maxTopHolderPct: number;
  requireMintAuthorityRenounced: boolean;
  requireFreezeAuthorityRenounced: boolean;

  // strategy / risk
  entryScoreThreshold: number;
  momentumWeight: number;
  sentimentWeight: number;
  maxPositionSol: number;
  maxConcurrentPositions: number;
  stopLossPct: number;
  takeProfitPct: number;
  trailingStopPct: number;
  dailyLossLimitSol: number;
  slippageBps: number;

  // optional social sentiment
  sentimentProvider: 'none' | 'lunarcrush';
  lunarcrushApiKey: string | undefined;
}

function loadConfig(): AgentConfig {
  const tradingMode = envStr('TRADING_MODE', 'paper') as TradingMode;
  if (tradingMode !== 'paper' && tradingMode !== 'live') {
    throw new Error(`TRADING_MODE must be "paper" or "live", got "${tradingMode}"`);
  }

  const walletPrivateKeyBase58 = process.env.WALLET_PRIVATE_KEY || undefined;

  if (tradingMode === 'live') {
    const confirm = process.env.LIVE_TRADING_CONFIRM;
    if (confirm !== LIVE_CONFIRM_PHRASE) {
      throw new Error(
        `TRADING_MODE=live requires LIVE_TRADING_CONFIRM="${LIVE_CONFIRM_PHRASE}" to be set explicitly. ` +
          `This is a deliberate safety gate so live trading can never start by accident. Refusing to start.`
      );
    }
    if (!walletPrivateKeyBase58) {
      throw new Error(
        'TRADING_MODE=live requires WALLET_PRIVATE_KEY (base58-encoded secret key) to be set. Refusing to start.'
      );
    }
  }

  return {
    tradingMode,
    solanaRpcUrl: envStr('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'),
    jupiterApiBase: envStr('JUPITER_API_BASE', 'https://quote-api.jup.ag/v6'),
    dexscreenerApiBase: envStr('DEXSCREENER_API_BASE', 'https://api.dexscreener.com'),

    walletPrivateKeyBase58,

    paperStartingSol: envNum('PAPER_STARTING_SOL', 10),

    scanIntervalMs: envNum('SCAN_INTERVAL_MS', 60_000),
    positionCheckIntervalMs: envNum('POSITION_CHECK_INTERVAL_MS', 15_000),

    minLiquidityUsd: envNum('MIN_LIQUIDITY_USD', 8_000),
    maxTokenAgeMinutes: envNum('MAX_TOKEN_AGE_MINUTES', 720),
    minVolume5mUsd: envNum('MIN_VOLUME_5M_USD', 2_000),
    maxTopHolderPct: envNum('MAX_TOP_HOLDER_PCT', 25),
    requireMintAuthorityRenounced: envBool('REQUIRE_MINT_AUTHORITY_RENOUNCED', true),
    requireFreezeAuthorityRenounced: envBool('REQUIRE_FREEZE_AUTHORITY_RENOUNCED', true),

    entryScoreThreshold: envNum('ENTRY_SCORE_THRESHOLD', 70),
    momentumWeight: envNum('MOMENTUM_WEIGHT', 0.7),
    sentimentWeight: envNum('SENTIMENT_WEIGHT', 0.3),
    maxPositionSol: envNum('MAX_POSITION_SOL', 0.25),
    maxConcurrentPositions: envNum('MAX_CONCURRENT_POSITIONS', 5),
    stopLossPct: envNum('STOP_LOSS_PCT', 12),
    takeProfitPct: envNum('TAKE_PROFIT_PCT', 35),
    trailingStopPct: envNum('TRAILING_STOP_PCT', 15),
    dailyLossLimitSol: envNum('DAILY_LOSS_LIMIT_SOL', 1),
    slippageBps: envNum('SLIPPAGE_BPS', 150),

    sentimentProvider: envStr('SENTIMENT_PROVIDER', 'none') as 'none' | 'lunarcrush',
    lunarcrushApiKey: process.env.LUNARCRUSH_API_KEY || undefined,
  };
}

export const config = loadConfig();
export const LIVE_TRADING_CONFIRM_PHRASE = LIVE_CONFIRM_PHRASE;
