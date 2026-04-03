// app/api/tokens/trending/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let CACHE = null;
let LAST_FETCH = 0;
const TTL = 20 * 1000;

function formatAge(createdAt) {
  if (!createdAt) return null;
  const diffMs = Date.now() - createdAt;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

function normalizePair(pair, boostToken) {
  const base  = pair?.baseToken || {};
  const info  = pair?.info     || {};
  const links = info?.socials  || [];
  const webs  = info?.websites || [];
  const txns  = pair?.txns?.h24 || {};

  const getLink = (type) =>
    links.find((l) => l?.type?.toLowerCase() === type)?.url || null;

  return {
    pairAddress:  pair?.pairAddress        || null,
    tokenAddress: base?.address            || null,
    chainId:      pair?.chainId            || null,

    tokenTicker:  base?.symbol             || "—",
    tokenName:    base?.name               || "Unknown Token",
    tokenImageUri: info?.imageUrl || boostToken?.icon || "/assets/default-token.png",

    website:  webs[0]?.url      || null,
    twitter:  getLink("twitter") || null,
    telegram: getLink("telegram") || null,

    priceUsd:     pair?.priceUsd            ? Number(pair.priceUsd)          : null,
    liquidityUsd: pair?.liquidity?.usd      ? Number(pair.liquidity.usd)     : null,
    volume24h:    pair?.volume?.h24         ? Number(pair.volume.h24)        : null,
    fdvUsd:       pair?.fdv                 ? Number(pair.fdv)               : null,

    priceChange5m:  pair?.priceChange?.m5  != null ? Number(pair.priceChange.m5)  : null,
    priceChange1h:  pair?.priceChange?.h1  != null ? Number(pair.priceChange.h1)  : null,
    priceChange6h:  pair?.priceChange?.h6  != null ? Number(pair.priceChange.h6)  : null,
    priceChange24h: pair?.priceChange?.h24 != null ? Number(pair.priceChange.h24) : null,

    txns24h: (txns.buys || 0) + (txns.sells || 0),
    makers:  pair?.makers ?? null,
    age:     formatAge(pair?.pairCreatedAt),
  };
}

export async function GET() {
  try {
    if (CACHE && Date.now() - LAST_FETCH < TTL) {
      console.log("[trending] serving from cache, length:", CACHE.length);
      return NextResponse.json(CACHE);
    }

    // ── Step 1: fetch boosted tokens ──────────────────────────────────────
    const boostRes = await fetch("https://api.dexscreener.com/token-boosts/latest/v1", {
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
    });

    console.log("[trending] boost status:", boostRes.status);

    if (!boostRes.ok) return NextResponse.json([]);

    const boosted = await boostRes.json();

    console.log("[trending] boosted type:", typeof boosted, Array.isArray(boosted));
    console.log("[trending] boosted count:", Array.isArray(boosted) ? boosted.length : "NOT AN ARRAY");
    console.log("[trending] sample item:", JSON.stringify(boosted?.[0] ?? null));
    console.log("[trending] all chains:", [...new Set((boosted || []).map((t) => t?.chainId))]);

    if (!Array.isArray(boosted) || boosted.length === 0) {
      console.log("[trending] boosted is empty — returning []");
      return NextResponse.json([]);
    }

    // ── Step 2: take top 30 across ALL chains ─────────────────────────────
    const topTokens = boosted.slice(0, 30);
    console.log("[trending] topTokens count:", topTokens.length);

    // ── Step 3: fetch pair data to enrich with price/volume ───────────────
    const addresses = topTokens.map((t) => t.tokenAddress).filter(Boolean).join(",");
    console.log("[trending] addresses to enrich:", addresses.slice(0, 120), "...");

    const pairRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addresses}`,
      {
        cache: "no-store",
        headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
      }
    );

    console.log("[trending] pairs status:", pairRes.status);

    if (!pairRes.ok) {
      console.warn("[trending] pairs fetch failed:", pairRes.status);
      return NextResponse.json([]);
    }

    const pairData = await pairRes.json();
    const pairs    = Array.isArray(pairData?.pairs) ? pairData.pairs : [];

    console.log("[trending] pairs returned:", pairs.length);

    // ── Step 4: pick best (highest liquidity) pair per token ──────────────
    const bestPairByToken = new Map();
    for (const pair of pairs) {
      const addr = pair?.baseToken?.address?.toLowerCase();
      if (!addr) continue;
      const existing   = bestPairByToken.get(addr);
      const liquidity  = pair?.liquidity?.usd ?? 0;
      const prevLiq    = existing?.liquidity?.usd ?? 0;
      if (!existing || liquidity > prevLiq) bestPairByToken.set(addr, pair);
    }

    console.log("[trending] unique tokens with pair data:", bestPairByToken.size);

    // ── Step 5: normalize ─────────────────────────────────────────────────
    const normalized = topTokens
      .map((t) => {
        const pair = bestPairByToken.get(t.tokenAddress?.toLowerCase());
        if (!pair) {
          console.log("[trending] no pair found for:", t.tokenAddress, t.chainId);
          return null;
        }
        return normalizePair(pair, t);
      })
      .filter(Boolean);

    console.log("[trending] final normalized count:", normalized.length);

    CACHE       = normalized;
    LAST_FETCH  = Date.now();

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("[trending] unexpected error:", err);
    return NextResponse.json([]);
  }
}