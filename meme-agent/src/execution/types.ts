export interface SwapResult {
  /** Raw (smallest-unit) amount of the token that was bought or sold. */
  tokenAmountRaw: number;
  /** SOL amount involved (spent on buy, received on sell), in SOL (not lamports). */
  solAmount: number;
  txSignature: string | null;
}

export interface TradeExecutor {
  readonly mode: 'paper' | 'live';
  getSolBalance(): Promise<number>;
  buy(mint: string, solAmount: number): Promise<SwapResult | null>;
  /** tokenAmountRaw must be the raw smallest-unit amount returned by a prior buy(). */
  sell(mint: string, tokenAmountRaw: number): Promise<SwapResult | null>;
}
