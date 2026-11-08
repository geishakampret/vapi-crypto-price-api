// Crypto price API — vAPI List your API (500 poin)
// GET /price?symbol=BTC — paid $0.01 via x402 v2 (exact, USDC).
// Data: CoinGecko public API, no key. No private key stored here — only the payout address.
// Default config is Base Sepolia TESTNET (free test, facilitator x402.org).
// For mainnet listing, set NETWORK=eip155:8453 and FACILITATOR_URL to a production
// facilitator (e.g. Coinbase CDP) — do NOT reuse https://x402.org/facilitator on mainnet.
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const PAY_TO = process.env.PAY_TO || "0xc75e45ac4e26700b726651c985eda777a796c25f"; // wallet Garong
const NETWORK = process.env.NETWORK || "eip155:84532"; // Base Sepolia testnet
const PRICE = process.env.PRICE || "$0.01";
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://x402.org/facilitator";
const PORT = Number(process.env.PORT || 4021);

const SYMBOLS = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", USDC: "usd-coin",
  USDT: "tether", BNB: "binancecoin", XRP: "ripple", DOGE: "dogecoin",
  ADA: "cardano", AVAX: "avalanche-2", LINK: "chainlink",
};

const app = express();

app.get("/health", (_req, res) => res.json({ ok: true, network: NETWORK, price: PRICE }));

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

app.use(
  paymentMiddleware(
    {
      "GET /price": {
        accepts: [{ scheme: "exact", price: PRICE, network: NETWORK, payTo: PAY_TO }],
        description: "Crypto price (USD) from CoinGecko public data",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient).register("eip155:*", new ExactEvmScheme()),
  ),
);

app.get("/price", async (req, res) => {
  const symbol = String(req.query.symbol || "BTC").toUpperCase();
  const id = SYMBOLS[symbol];
  if (!id) return res.status(400).json({ error: `unsupported symbol: ${symbol}`, supported: Object.keys(SYMBOLS) });
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return res.status(502).json({ error: "coingecko upstream error", status: r.status });
    const data = await r.json();
    if (!data[id]?.usd && data[id]?.usd !== 0) return res.status(502).json({ error: "no price from upstream" });
    return res.json({ symbol, price_usd: data[id].usd, source: "coingecko", network: NETWORK });
  } catch (e) {
    return res.status(502).json({ error: "upstream fetch failed", detail: String(e.message || e) });
  }
});

app.listen(PORT, () => console.log(`crypto-price-api listening on :${PORT} network=${NETWORK} price=${PRICE} payTo=${PAY_TO}`));
