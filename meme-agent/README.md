# Meme Coin Trading Agent

An autonomous scanner/trader for new Solana meme coins. It watches trending
tokens, filters out obvious rugs/honeypots, scores what's left on momentum
(and optionally social sentiment), and trades with a tight stop-loss /
take-profit / trailing-stop on every position.

This is a **standalone service**, unrelated to anything else in this
repository — deploy it on its own (e.g. your Linode box), it doesn't touch
the rest of the app.

## Why this isn't "an Axiom bot"

Axiom (axiom.trade) is a front-end trading terminal, not a broker with a
public trading API — there's no documented, ToS-compliant way to place
orders "through Axiom" programmatically. This agent instead trades on the
same underlying venues Axiom shows you, directly:

- **[DexScreener](https://docs.dexscreener.com/api/reference)** (free, no
  API key) for discovering trending/boosted tokens and their live
  liquidity/volume/price data.
- **Solana RPC** (`@solana/web3.js` + `@solana/spl-token`) to verify a
  token's mint/freeze authority and holder concentration on-chain — this is
  the actual rug-pull defense and DexScreener alone can't give it to you.
- **[Jupiter](https://dev.jup.ag/docs/swap/get-quote)** for quotes and swap
  transaction building — the same aggregator most Solana trading UIs
  (including Axiom) route through under the hood.

## Safety model

- **Defaults to paper trading.** `TRADING_MODE=paper` (the default) never
  touches a wallet or sends a transaction — it uses real Jupiter quotes to
  simulate realistic fills against a virtual SOL balance stored locally in
  SQLite (`data/agent.sqlite`).
- **Live trading requires two explicit opt-ins**, not just one env var:
  `TRADING_MODE=live` **and** `LIVE_TRADING_CONFIRM=I_UNDERSTAND_THE_RISK`.
  Missing either one, the process refuses to start.
- **Every trade is capped** at `MAX_POSITION_SOL`, enforced independently
  inside the live executor even if the strategy layer ever asked for more.
- **A daily loss breaker** (`DAILY_LOSS_LIMIT_SOL`) halts new entries for
  the rest of the UTC day once hit. Open positions still get monitored and
  can still exit on stop-loss.
- **Use a burner wallet.** Fund it with only what you're prepared to lose
  entirely — meme coins routinely go to zero, and no filter here
  (or anywhere) makes that impossible.

None of this makes meme coin trading safe. It bounds how much a bug, a bad
signal, or a rug can cost you per trade and per day.

## Strategy, in short

1. **Scan**: pull trending/boosted Solana tokens from DexScreener.
2. **Quick filter**: liquidity, 5-minute volume, pair age, sell-pressure —
   cheap checks that avoid wasting RPC calls on obvious junk.
3. **On-chain filter**: mint authority renounced, freeze authority
   renounced, top holder below `MAX_TOP_HOLDER_PCT`.
4. **Score**: a momentum score (0-100) from price action / volume
   acceleration / buy-sell pressure, optionally blended with a social
   sentiment score if you configure a provider (see below). Enter if the
   weighted score clears `ENTRY_SCORE_THRESHOLD`.
5. **Manage**: every open position is checked every
   `POSITION_CHECK_INTERVAL_MS` against a hard stop-loss
   (`STOP_LOSS_PCT`), a take-profit target (`TAKE_PROFIT_PCT`), and a
   trailing stop (`TRAILING_STOP_PCT`) that locks in gains once a position
   has moved favorably.

### Sentiment

There's no free, keyless "Twitter/X sentiment for a random new token"
API — anything that claims otherwise for arbitrary new mints is either
paid or unreliable. Out of the box, "sentiment" is a momentum/hype proxy
computed from real trading data (price acceleration + volume acceleration
+ buy/sell ratio), which can't be faked by a few bot-farmed tweets the way
a naive social-mention counter can.

If you want real social sentiment blended in, set `SENTIMENT_PROVIDER=lunarcrush`
and `LUNARCRUSH_API_KEY=...` — see `src/sentiment/social.ts`. Swap in a
different provider by implementing `SocialSentimentProvider` there.

## Configuration

Copy `.env.example` to `.env` and adjust. Every knob (filters, sizing,
stop-loss/take-profit, timing) is an env var — see the comments in
`.env.example` for defaults and meaning.

## Running locally

```bash
cd meme-agent
cp .env.example .env
npm install
npm run dev        # paper trading, ts-node watch mode
```

## Deploying on your Linode server

```bash
# on the Linode box
git clone <your-fork-url>
cd <repo>/meme-agent
cp .env.example .env
nano .env                 # set TRADING_MODE, RPC URL, risk params

docker compose up -d --build
docker compose logs -f    # watch it scan/trade
```

Data (SQLite ledger of trades/positions) persists in `./data` on the host
via the volume mount, so `docker compose down && docker compose up -d`
doesn't lose history.

To run without Docker instead, use `pm2` or a systemd unit that runs
`npm run build && node dist/index.js` after `npm install`.

## Going from paper to live

1. Let it run in paper mode and review `data/agent.sqlite` (`trades`,
   `positions`, `daily_pnl` tables) — does the strategy actually make sense
   for how you trade?
2. Generate a **burner** Solana keypair (`solana-keygen new -o burner.json`),
   fund it with a small amount of SOL, and export its base58 secret key
   into `WALLET_PRIVATE_KEY`.
3. Get a paid RPC endpoint (Helius/QuickNode/Triton) — the public RPC is
   too rate-limited for a live bot — and set `SOLANA_RPC_URL`.
4. Set `TRADING_MODE=live` and `LIVE_TRADING_CONFIRM=I_UNDERSTAND_THE_RISK`.
5. Start with a small `MAX_POSITION_SOL` and a conservative
   `DAILY_LOSS_LIMIT_SOL`, and watch it closely before increasing either.

## Disclaimer

This is trading software for highly volatile, largely unregulated assets.
It is not financial advice, carries no guarantee of profitability, and can
lose all funds allocated to it (including to rug pulls the filters miss —
mint/freeze/holder checks reduce but do not eliminate that risk). You are
responsible for complying with the laws and regulations that apply to you.
