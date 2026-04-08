"use client";

import { useEffect, useRef, useState } from "react";

function fmt(num, opts = {}) {
  if (num == null || isNaN(num)) return "—";
  const { prefix = "", suffix = "", compact = true } = opts;
  if (compact) {
    if (Math.abs(num) >= 1_000_000) return `${prefix}${(num / 1_000_000).toFixed(2)}M${suffix}`;
    if (Math.abs(num) >= 1_000) return `${prefix}${(num / 1_000).toFixed(1)}K${suffix}`;
  }
  return `${prefix}${num.toLocaleString()}${suffix}`;
}

function fmtPrice(price) {
  if (price == null) return "—";
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PctChange({ value }) {
  if (value == null || isNaN(value)) return <span className="text-gray-600">—</span>;
  const isPos = value >= 0;
  return (
    <span className={isPos ? "text-green-400" : "text-red-400"}>
      {isPos ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function ChainBadge({ chainId }) {
  const map = {
    ethereum: ["bg-blue-500/20 text-blue-300",   "ETH"],
    polygon:  ["bg-purple-500/20 text-purple-300","POL"],
    arbitrum: ["bg-blue-400/20 text-blue-200",   "ARB"],
    optimism: ["bg-red-500/20 text-red-300",     "OP"],
    base:     ["bg-blue-600/20 text-blue-200",   "BASE"],
    bsc:      ["bg-yellow-500/20 text-yellow-300","BSC"],
    solana:   ["bg-green-500/20 text-green-300",  "SOL"], 
  };
  const [cls, label] = map[chainId] ?? ["bg-gray-500/20 text-gray-400", chainId?.toUpperCase() ?? "?"];
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>
  );
}

const COLS = [
  { key: "token",          label: "TOKEN",     sortable: false, className: "text-left" },
  { key: "fdvUsd",         label: "MCAP",      sortable: true,  className: "text-right" },
  { key: "priceUsd",       label: "PRICE",     sortable: true,  className: "text-right" },
  { key: "age",            label: "AGE",       sortable: false, className: "text-right" },
  { key: "txns24h",        label: "TXNS",      sortable: true,  className: "text-right" },
  { key: "volume24h",      label: "VOLUME",    sortable: true,  className: "text-right" },
  { key: "makers",         label: "MAKERS",    sortable: true,  className: "text-right" },
  { key: "priceChange5m",  label: "5M",        sortable: true,  className: "text-right" },
  { key: "priceChange1h",  label: "1H",        sortable: true,  className: "text-right" },
  { key: "priceChange6h",  label: "6H",        sortable: true,  className: "text-right" },
  { key: "priceChange24h", label: "24H",       sortable: true,  className: "text-right" },
  { key: "liquidityUsd",   label: "LIQUIDITY", sortable: true,  className: "text-right" },
];

export default function DashboardClient() {
  const [tokens, setTokens]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [sortKey, setSortKey] = useState("volume24h");
  const [sortDir, setSortDir] = useState("desc");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchData() {
      try {
        const res = await fetch("/api/tokens/trending", { cache: "no-store" });
        if (!res.ok) {
          if (mountedRef.current) { setError(`API error (${res.status})`); setTokens([]); }
          return;
        }
        const json = await res.json();
        
        const arr  = Array.isArray(json) ? json : [];

        const seen   = new Set();
        const unique = [];
        for (const t of arr) {
          const key = t?.tokenAddress || t?.pairAddress || JSON.stringify(t);
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(t);
        }

        if (mountedRef.current) { setTokens(unique); setError(null); }
      } catch (err) {
        console.error("[DashboardClient]", err);
        if (mountedRef.current) { setError("Could not reach the market data API."); setTokens([]); }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15_000);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, []);

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...tokens].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity;
    const bv = b[sortKey] ?? -Infinity;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 text-sm text-gray-400">
        <span className="animate-spin h-4 w-4 rounded-full border-2 border-gray-600 border-t-gray-200" />
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
    <div className="w-full rounded-xl border border-white/10 bg-gray-900 overflow-hidden">

      {/* Table header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">Trending Tokens</h2>
        <span className="text-xs text-gray-500">Refreshes every 15s</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-gray-300" style={{ minWidth: 960 }}>

          {/* Column headers */}
          <thead>
            <tr className="border-b border-white/10 bg-gray-950/50">
              <th className="px-4 py-3 text-left text-gray-600 font-medium w-8">#</th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={[
                    "px-3 py-3 font-medium whitespace-nowrap select-none",
                    col.className,
                    col.sortable ? "cursor-pointer hover:text-white transition-colors" : "",
                    sortKey === col.key ? "text-white" : "text-gray-500",
                  ].join(" ")}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1 opacity-60">{sortDir === "desc" ? "↓" : "↑"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1} className="px-4 py-12 text-center text-gray-500">
                  No trending tokens available.
                </td>
              </tr>
            ) : (
              sorted.map((token, idx) => {
                const rowKey = token?.tokenAddress || token?.pairAddress || `row-${idx}`;
                const dexUrl = token.pairAddress
                  ? `https://dexscreener.com/${token.chainId}/${token.pairAddress}`
                  : "#";

                return (
                  <tr
                    key={rowKey}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Row number */}
                    <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">
                      #{idx + 1}
                    </td>

                    {/* Token info */}
                    <td className="px-3 py-3">
                      <a
                        href={dexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5"
                      >
                        <img
                          src={token.tokenImageUri || "/assets/default-token.png"}
                          alt={token.tokenTicker}
                          className="h-8 w-8 rounded-full bg-gray-800 object-cover flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = "/assets/default-token.png"; }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-[13px] group-hover:text-blue-400 transition-colors">
                              {token.tokenTicker}
                            </span>
                            <ChainBadge chainId={token.chainId} />
                          </div>
                          <div className="text-gray-500 truncate max-w-[110px] mt-0.5">
                            {token.tokenName}
                          </div>
                        </div>
                      </a>
                    </td>

                    {/* MCAP */}
                    <td className="px-3 py-3 text-right font-mono">
                      {fmt(token.fdvUsd, { prefix: "$" })}
                    </td>

                    {/* PRICE */}
                    <td className="px-3 py-3 text-right font-mono text-white">
                      {fmtPrice(token.priceUsd)}
                    </td>

                    {/* AGE */}
                    <td className="px-3 py-3 text-right">{token.age ?? "—"}</td>

                    {/* TXNS */}
                    <td className="px-3 py-3 text-right font-mono">
                      {token.txns24h != null ? token.txns24h.toLocaleString() : "—"}
                    </td>

                    {/* VOLUME */}
                    <td className="px-3 py-3 text-right font-mono">
                      {fmt(token.volume24h, { prefix: "$" })}
                    </td>

                    {/* MAKERS */}
                    <td className="px-3 py-3 text-right font-mono">
                      {token.makers != null ? token.makers.toLocaleString() : "—"}
                    </td>

                    {/* 5M */}
                    <td className="px-3 py-3 text-right font-mono">
                      <PctChange value={token.priceChange5m} />
                    </td>

                    {/* 1H */}
                    <td className="px-3 py-3 text-right font-mono">
                      <PctChange value={token.priceChange1h} />
                    </td>

                    {/* 6H */}
                    <td className="px-3 py-3 text-right font-mono">
                      <PctChange value={token.priceChange6h} />
                    </td>

                    {/* 24H */}
                    <td className="px-3 py-3 text-right font-mono">
                      <PctChange value={token.priceChange24h} />
                    </td>

                    {/* LIQUIDITY */}
                    <td className="px-3 py-3 text-right font-mono">
                      {fmt(token.liquidityUsd, { prefix: "$" })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}