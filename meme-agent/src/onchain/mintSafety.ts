import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { createLogger } from '../logger';

const log = createLogger('mint-safety');

export interface MintSafety {
  mintAuthorityRenounced: boolean;
  freezeAuthorityRenounced: boolean;
  topHolderPct: number | null;
}

/**
 * On-chain checks that DexScreener's API cannot give us: whether the mint/
 * freeze authority has been renounced (protects against the deployer minting
 * unlimited supply or freezing your tokens) and how concentrated the top
 * holder is (protects against a single-wallet rug).
 */
export async function checkMintSafety(connection: Connection, mint: string): Promise<MintSafety> {
  const mintPubkey = new PublicKey(mint);

  const mintInfo = await getMint(connection, mintPubkey);
  const mintAuthorityRenounced = mintInfo.mintAuthority === null;
  const freezeAuthorityRenounced = mintInfo.freezeAuthority === null;

  let topHolderPct: number | null = null;
  try {
    const largest = await connection.getTokenLargestAccounts(mintPubkey);
    const supply = Number(mintInfo.supply);
    if (supply > 0 && largest.value.length > 0) {
      const top = Number(largest.value[0].amount);
      topHolderPct = (top / supply) * 100;
    }
  } catch (err) {
    log.warn(`getTokenLargestAccounts failed for ${mint}`, String(err));
  }

  return { mintAuthorityRenounced, freezeAuthorityRenounced, topHolderPct };
}
