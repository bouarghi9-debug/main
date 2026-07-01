import { config } from '../config';
import { createLogger } from '../logger';

const log = createLogger('jupiter');

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  // full response is passed through opaquely to /swap
  raw: unknown;
}

export async function getQuote(
  inputMint: string,
  outputMint: string,
  amountLamports: number,
  slippageBps: number = config.slippageBps
): Promise<JupiterQuote | null> {
  const url = `${config.jupiterApiBase}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${Math.floor(
    amountLamports
  )}&slippageBps=${slippageBps}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      log.warn(`quote HTTP ${res.status} for ${inputMint}->${outputMint}`);
      return null;
    }
    const json = (await res.json()) as any;
    if (!json.outAmount) return null;
    return {
      inputMint,
      outputMint,
      inAmount: json.inAmount,
      outAmount: json.outAmount,
      priceImpactPct: json.priceImpactPct ?? '0',
      raw: json,
    };
  } catch (err) {
    log.warn('quote request failed', String(err));
    return null;
  }
}

/** Returns a base64-encoded unsigned (versioned) transaction ready to sign. */
export async function buildSwapTransaction(quote: JupiterQuote, userPublicKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${config.jupiterApiBase}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote.raw,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });
    if (!res.ok) {
      log.warn(`swap HTTP ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { swapTransaction?: string };
    return json.swapTransaction ?? null;
  } catch (err) {
    log.warn('swap build failed', String(err));
    return null;
  }
}
