import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { config, LIVE_TRADING_CONFIRM_PHRASE } from '../config';
import { createLogger } from '../logger';
import { LAMPORTS_PER_SOL, SOL_MINT } from '../types';
import { buildSwapTransaction, getQuote } from './jupiterClient';
import { SwapResult, TradeExecutor } from './types';

const log = createLogger('live-executor');

/**
 * Executes real swaps on-chain with real funds. Construction alone re-checks
 * every safety gate from config.ts (in addition to the checks already run at
 * process startup) so this class can never be instantiated in a
 * misconfigured state, even if something upstream changes.
 */
export class LiveExecutor implements TradeExecutor {
  readonly mode = 'live' as const;
  private readonly connection: Connection;
  private readonly keypair: Keypair;

  constructor(connection: Connection) {
    if (config.tradingMode !== 'live') {
      throw new Error('LiveExecutor instantiated while TRADING_MODE !== "live". Refusing.');
    }
    if (process.env.LIVE_TRADING_CONFIRM !== LIVE_TRADING_CONFIRM_PHRASE) {
      throw new Error('LiveExecutor instantiated without LIVE_TRADING_CONFIRM set. Refusing.');
    }
    if (!config.walletPrivateKeyBase58) {
      throw new Error('LiveExecutor instantiated without WALLET_PRIVATE_KEY. Refusing.');
    }

    this.connection = connection;
    this.keypair = Keypair.fromSecretKey(bs58.decode(config.walletPrivateKeyBase58));
    log.warn(`LIVE TRADING ARMED. Wallet: ${this.keypair.publicKey.toBase58()}. Real funds are at risk.`);
  }

  async getSolBalance(): Promise<number> {
    const lamports = await this.connection.getBalance(this.keypair.publicKey);
    return lamports / LAMPORTS_PER_SOL;
  }

  async buy(mint: string, solAmount: number): Promise<SwapResult | null> {
    const cappedSolAmount = Math.min(solAmount, config.maxPositionSol);
    if (cappedSolAmount !== solAmount) {
      log.warn(`buy amount ${solAmount} SOL capped to MAX_POSITION_SOL=${config.maxPositionSol}`);
    }
    return this.swap(SOL_MINT, mint, cappedSolAmount * LAMPORTS_PER_SOL, cappedSolAmount);
  }

  async sell(mint: string, tokenAmountRaw: number): Promise<SwapResult | null> {
    return this.swap(mint, SOL_MINT, tokenAmountRaw, null);
  }

  private async swap(
    inputMint: string,
    outputMint: string,
    amountRaw: number,
    knownSolAmount: number | null
  ): Promise<SwapResult | null> {
    const quote = await getQuote(inputMint, outputMint, amountRaw);
    if (!quote) {
      log.warn(`no route ${inputMint} -> ${outputMint}`);
      return null;
    }

    const priceImpact = Number(quote.priceImpactPct);
    if (Number.isFinite(priceImpact) && priceImpact > 0.1) {
      log.warn(`aborting swap: price impact ${(priceImpact * 100).toFixed(1)}% too high`);
      return null;
    }

    const txB64 = await buildSwapTransaction(quote, this.keypair.publicKey.toBase58());
    if (!txB64) {
      log.warn('failed to build swap transaction');
      return null;
    }

    const tx = VersionedTransaction.deserialize(Buffer.from(txB64, 'base64'));
    tx.sign([this.keypair]);

    const signature = await this.connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    const latestBlockhash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

    log.warn(`LIVE SWAP CONFIRMED: ${inputMint} -> ${outputMint}, tx=${signature}`);

    const outAmount = Number(quote.outAmount);
    if (outputMint === SOL_MINT) {
      return { tokenAmountRaw: amountRaw, solAmount: outAmount / LAMPORTS_PER_SOL, txSignature: signature };
    }
    return { tokenAmountRaw: outAmount, solAmount: knownSolAmount ?? amountRaw / LAMPORTS_PER_SOL, txSignature: signature };
  }
}
