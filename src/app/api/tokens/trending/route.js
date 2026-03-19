// app/api/tokens/trending/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let CACHE = null;
let LAST_FETCH = 0;
const TTL = 20 * 1000; // 20s

function normalizeBoosted(t) {
  return {
    pairAddress: t?.pairAddress || null,
    tokenAddress: t?.tokenAddress || null,

    tokenTicker: t?.symbol || "—",
    tokenName: t?.name || "Unknown Token",

    tokenImageUri: t?.image || "/assets/default-token.png",
    tokenDescription: t?.description || null,

    website: t?.links?.website || null,
    twitter: t?.links?.twitter || null,
    telegram: t?.links?.telegram || null,

    priceUsd: t?.priceUsd ? Number(t.priceUsd) : null,
    liquidityUsd: t?.liquidityUsd ? Number(t.liquidityUsd) : null,
    volume24h: t?.volume24h ? Number(t.volume24h) : null,
    fdvUsd: t?.fdvUsd ? Number(t.fdvUsd) : null,
  };
}

export async function GET() {
  try {
    if (CACHE && Date.now() - LAST_FETCH < TTL) {
      return NextResponse.json(CACHE);
    }

    const res = await fetch("https://api.dexscreener.com/latest/dex/tokens/boosted", {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("[trending] Dexscreener boosts returned", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();

    console.log("data", data);
    

    const boosted = Array.isArray(data?.boostedTokens) ? data.boostedTokens : [];

    const solanaOnly = boosted.filter((t) => t?.chainId === "solana");

    const normalized = solanaOnly.slice(0, 30).map(normalizeBoosted);

    CACHE = normalized;
    LAST_FETCH = Date.now();

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("[trending] unexpected error:", err);
    return NextResponse.json([]);
  }
}