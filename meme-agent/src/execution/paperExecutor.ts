import { createLogger } from '../logger';
import { getPaperSolBalance, adjustPaperSolBalance } from '../persistence/repository';
import { LAMPORTS_PER_SOL, SOL_MINT } from '../types';
import { getQuote } from './jupiterClient';
import { SwapResult, TradeExecutor } from './types';

const log = createLogger('paper-executor');

/**
 * Simulates fills using real Jupiter quotes (so slippage/price impact are
 * realistic) but never signs or submits a transaction and never touches a
 * real wallet. Balance is tracked in the local SQLite ledger.
 */
export class PaperExecutor implements TradeExecutor {
  readonly mode = 'paper' as const;

  async getSolBalance(): Promise<number> {
    return getPaperSolBalance();
  }

  async buy(mint: string, solAmount: number): Promise<SwapResult | null> {
    const balance = getPaperSolBalance();
    if (solAmount > balance) {
      log.warn(`insufficient paper balance: want ${solAmount} SOL, have ${balance} SOL`);
      return null;
    }
    const quote = await getQuote(SOL_MINT, mint, solAmount * LAMPORTS_PER_SOL);
    if (!quote) return null;

    adjustPaperSolBalance(-solAmount);
    log.info(`[PAPER BUY] ${solAmount} SOL -> ${quote.outAmount} raw units of ${mint}`);
    return { tokenAmountRaw: Number(quote.outAmount), solAmount, txSignature: null };
  }

  async sell(mint: string, tokenAmountRaw: number): Promise<SwapResult | null> {
    const quote = await getQuote(mint, SOL_MINT, tokenAmountRaw);
    if (!quote) return null;

    const solReceived = Number(quote.outAmount) / LAMPORTS_PER_SOL;
    adjustPaperSolBalance(solReceived);
    log.info(`[PAPER SELL] ${tokenAmountRaw} raw units of ${mint} -> ${solReceived} SOL`);
    return { tokenAmountRaw, solAmount: solReceived, txSignature: null };
  }
}
