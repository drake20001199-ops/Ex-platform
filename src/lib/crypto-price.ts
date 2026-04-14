import { prisma } from "@/lib/db";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";
const CACHE_MAX_AGE_SECONDS = 60;

interface CurrencyPrices {
  aud: number;
  usd: number;
  change24h: number;
}

export interface PriceData {
  btc: CurrencyPrices;
  eth: CurrencyPrices;
}

let inflight: Promise<PriceData> | null = null;
let memoryCache: PriceData | null = null;

async function fetchFromCoinGecko(): Promise<PriceData> {
  const res = await fetch(
    `${COINGECKO_URL}?ids=bitcoin,ethereum&vs_currencies=aud,usd&include_24hr_change=true`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("CoinGecko API failed");

  const data = await res.json();

  const btcAud = data.bitcoin?.aud;
  const ethAud = data.ethereum?.aud;

  // Guard against zero, negative, or missing prices
  if (!btcAud || btcAud <= 0 || !ethAud || ethAud <= 0) {
    throw new Error("CoinGecko returned invalid prices (zero or negative)");
  }

  return {
    btc: {
      aud: btcAud,
      usd: data.bitcoin.usd || 0,
      change24h: data.bitcoin.aud_24h_change ?? 0,
    },
    eth: {
      aud: ethAud,
      usd: data.ethereum.usd || 0,
      change24h: data.ethereum.aud_24h_change ?? 0,
    },
  };
}

export async function getPrices(): Promise<PriceData> {
  if (inflight) return inflight;
  const promise = fetchPricesInternal();
  inflight = promise;
  try {
    return await promise;
  } finally {
    inflight = null;
  }
}

async function fetchPricesInternal(): Promise<PriceData> {
  const cached = await prisma.priceCache.findMany();
  const btcCache = cached.find((c) => c.cryptoType === "BTC");
  const ethCache = cached.find((c) => c.cryptoType === "ETH");

  const now = new Date();
  const isStale =
    !btcCache || !ethCache ||
    now.getTime() - btcCache.fetchedAt.getTime() > CACHE_MAX_AGE_SECONDS * 1000;

  if (!isStale && btcCache && ethCache && memoryCache) {
    return memoryCache;
  }

  try {
    const fresh = await fetchFromCoinGecko();
    memoryCache = fresh;

    await Promise.all([
      prisma.priceCache.upsert({
        where: { cryptoType: "BTC" },
        update: { audRate: fresh.btc.aud, change24h: fresh.btc.change24h, fetchedAt: now },
        create: { cryptoType: "BTC", audRate: fresh.btc.aud, change24h: fresh.btc.change24h, fetchedAt: now },
      }),
      prisma.priceCache.upsert({
        where: { cryptoType: "ETH" },
        update: { audRate: fresh.eth.aud, change24h: fresh.eth.change24h, fetchedAt: now },
        create: { cryptoType: "ETH", audRate: fresh.eth.aud, change24h: fresh.eth.change24h, fetchedAt: now },
      }),
    ]);

    return fresh;
  } catch {
    if (memoryCache) return memoryCache;
    if (btcCache && ethCache) {
      return {
        btc: { aud: Number(btcCache.audRate), usd: 0, change24h: Number(btcCache.change24h) },
        eth: { aud: Number(ethCache.audRate), usd: 0, change24h: Number(ethCache.change24h) },
      };
    }
    throw new Error("No price data available — CoinGecko is down and no cache exists");
  }
}
