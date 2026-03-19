"use client";

import React, { useEffect, useState, useRef } from "react";

export default function DashboardClient() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        const res = await fetch("/api/tokens/trending", { cache: "no-store" });

        if (!res.ok) {
          console.warn("[DashboardClient] API returned:", res.status);
          if (mountedRef.current) setTokens([]);
          return;
        }

        const json = await res.json();

        console.log("json", json);
        
        const arr = Array.isArray(json) ? json : [];

        // De-duplicate defensively (Dexscreener can return duplicates)
        const seen = new Set();
        const unique = [];

        for (const t of arr) {
          const key = t?.tokenAddress || t?.pairAddress || JSON.stringify(t);
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(t);
        }

        if (mountedRef.current) setTokens(unique);
      } catch (err) {
        console.error("[DashboardClient] fetch error:", err);
        if (mountedRef.current) setTokens([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchData();
    const t = setInterval(fetchData, 15_000);

    return () => {
      mountedRef.current = false;
      clearInterval(t);
    };
  }, []);

  if (loading) return <div className="p-6">Loading market data…</div>;

  return (
    <div className="w-full">
      <div className="max-h-[65vh] overflow-y-auto rounded-lg border bg-gray-900 text-white">
        <div className="p-4 space-y-3 bg-gray-800">
          {tokens.length === 0 ? (
            <div className="text-sm text-gray-300">
              No trending tokens available.
            </div>
          ) : (
            tokens.map((token, idx) => {
              const key =
                token?.tokenAddress ||
                token?.pairAddress ||
                `row-${idx}`;

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-md bg-gray-900 hover:bg-gray-850 transition"
                >
                  <img
                    src={token.tokenImageUri || "/assets/default-token.png"}
                    alt={token.tokenName || token.tokenTicker || "Token"}
                    className="h-10 w-10 rounded bg-gray-700 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/default-token.png";
                    }}
                  />

                  <div className="flex-1 text-sm min-w-0">
                    <div className="font-medium truncate">
                      {token.tokenName || "New Token (metadata pending)"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {token.tokenTicker || "—"}{" "}
                      {token.tokenDescription
                        ? `• ${token.tokenDescription.slice(0, 80)}…`
                        : ""}
                    </div>
                  </div>

                  <div className="text-sm text-right whitespace-nowrap">
                    <div>
                      {token.priceUsd
                        ? `$${Number(token.priceUsd).toLocaleString()}`
                        : "No price yet"}
                    </div>
                    <div className="text-xs text-gray-400">
                      Liquidity:{" "}
                      {token.liquidityUsd
                        ? `$${Number(token.liquidityUsd).toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}