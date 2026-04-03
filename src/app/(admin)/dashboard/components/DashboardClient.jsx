"use client";

import { useEffect, useRef, useState } from "react";

export default function DashboardClient() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        const res = await fetch("/api/tokens/trending", { cache: "no-store" });

        if (!res.ok) {
          console.warn("[DashboardClient] API returned:", res.status);
          if (mountedRef.current) {
            setError(`Failed to load tokens (${res.status})`);
            setTokens([]);
          }
          return;
        }

        const json = await res.json();
        const arr = Array.isArray(json) ? json : [];

        // De-duplicate by tokenAddress or pairAddress
        const seen = new Set();
        const unique = [];
        for (const t of arr) {
          const key = t?.tokenAddress || t?.pairAddress || JSON.stringify(t);
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(t);
        }

        if (mountedRef.current) {
          setTokens(unique);
          setError(null);
        }
      } catch (err) {
        console.error("[DashboardClient] fetch error:", err);
        if (mountedRef.current) {
          setError("Could not reach the market data API.");
          setTokens([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15_000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-gray-400">
        <span className="animate-spin h-4 w-4 rounded-full border-2 border-gray-500 border-t-white" />
        Loading market data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-h-[65vh] overflow-y-auto rounded-lg border border-white/10 bg-gray-900 text-white">
        <div className="p-4 space-y-3">
          {tokens.length === 0 ? (
            <div className="text-sm text-gray-400">No trending tokens available.</div>
          ) : (
            tokens.map((token, idx) => {
              const key = token?.tokenAddress || token?.pairAddress || `row-${idx}`;

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={token.tokenImageUri || "/assets/default-token.png"}
                    alt={token.tokenName || token.tokenTicker || "Token"}
                    className="h-10 w-10 rounded-full bg-gray-700 object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/default-token.png";
                    }}
                  />

                  <div className="flex-1 text-sm min-w-0">
                    <div className="font-medium truncate text-white">
                      {token.tokenName || "New Token"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {token.tokenTicker || "—"}
                      {token.tokenDescription
                        ? ` • ${token.tokenDescription.slice(0, 80)}…`
                        : ""}
                    </div>
                  </div>

                  <div className="text-sm text-right whitespace-nowrap flex-shrink-0">
                    <div className="text-white">
                      {token.priceUsd
                        ? `$${Number(token.priceUsd).toLocaleString()}`
                        : "No price yet"}
                    </div>
                    <div className="text-xs text-gray-400">
                      Liq:{" "}
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