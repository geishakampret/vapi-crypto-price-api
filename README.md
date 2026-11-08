# Crypto price API — status & cara lanjut

Status: **kode lokal siap, sudah dites 402 di lokal (2026-11-07 siang WIB). Belum di-deploy, belum di-list, belum ada uang keluar.**
Keputusan Garong tetap diperlukan sebelum deploy/list: setuju default ini, atau ganti fungsi/harga/payout.

## Default
- `GET /price?symbol=BTC` (ETH, SOL, dsb — lihat `SYMBOLS` di `server.mjs`), data CoinGecko public gratis tanpa key.
- Harga $0.01/request, x402 v2 `exact`, payout ke wallet Garong `0xc75e45ac4e26700b726651c985eda777a796c25f`.
- Konfigurasi default di kode: **Base Sepolia testnet** (`eip155:84532`, facilitator `https://x402.org/facilitator`) — aman untuk tes.
- Untuk listing mainnet: `NETWORK=eip155:8453` + facilitator produksi (mis. Coinbase CDP). Jangan pakai facilitator x402.org di mainnet.

## Tes lokal (sudah dilakukan 2026-11-07)
```bash
cd crypto-price-api
npm install
node server.mjs   # :4021
curl -i http://localhost:4021/health            # 200
curl -i http://localhost:4021/price?symbol=BTC  # 402 + header PAYMENT-REQUIRED (belum bayar)
```

## Langkah setelah Garong setuju ("buatkan")
1. Tes berbayar di Sepolia (test USDC gratis) — pastikan paid request balas 200 dengan harga.
2. Deploy ke HTTPS publik gratis (mis. Render free tier), ganti env ke mainnet + facilitator produksi.
3. Tes 402 dari internet, lalu list via wizard https://api.vapinetwork.ai/call/my-apis/new, Go live.
4. Verifikasi listing live + 500 poin di halaman Earn.

## File
- `server.mjs` — server Express + `@x402/express` 2.28.0
- `package.json` — `npm install`, `npm start`
- `.env.example` — variabel yang bisa diganti

Pola x402 v2 dicek dari https://dev.to/soloearn/how-do-i-add-x402-payments-to-an-express-nextjs-api-4pgi (diakses 2026-11-07).

## Mainnet (2026-11-08, dites lokal)
- `NETWORK=eip155:8453 FACILITATOR_URL=https://facilitator.openx402.ai` — facilitator ini mendukung x402 v2 `exact` di Base mainnet (USDC 0x8335...), tanpa API key, diverifikasi via `/supported` dan `/verify` (200).
- Alternatif: Coinbase CDP `https://api.cdp.coinbase.com/platform/v2/x402` — butuh CDP API key (401 tanpa key), 1.000 settlement gratis/bulan.
- Tes mainnet lokal 2026-11-08: `/health` 200, `/price?symbol=ETH` 402 dengan amount 10000, asset USDC mainnet, payTo wallet Garong.
- Deploy: `render.yaml` (Render free tier) dan `Dockerfile` sudah disiapkan. Masih butuh akun hosting (Render/Railway) untuk deploy ke HTTPS publik.
