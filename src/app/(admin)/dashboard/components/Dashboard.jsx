"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import DepositModal from "../dialogs/DepositModal";
import SendModal from "../dialogs/SendModal";

const DEMO_NETWORKS = [
  {
    chain:    "Solana",
    symbol:   "SOL",
    address:  null,
    balance:  null,
    network:  "Solana",
    color:    "from-purple-500 to-pink-500",
    icon:     "◎",
    coingeckoId: "solana",
  },
  {
    chain:    "Ethereum",
    symbol:   "ETH",
    address:  "0x527213AA6894cBcD2D6Ac1210b2Fc33de66ad934",
    balance:  "0.0000",
    network:  "ERC-20",
    color:    "from-blue-500 to-indigo-500",
    icon:     "⟠",
    coingeckoId: "ethereum",
  },
  {
    chain:    "BNB Chain",
    symbol:   "BNB",
    address:  "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
    balance:  "0.0000",
    network:  "BEP-20",
    color:    "from-yellow-400 to-orange-400",
    icon:     "◈",
    coingeckoId: "binancecoin",
  },
  {
    chain:    "Bitcoin",
    symbol:   "BTC",
    address:  "bc1qnjrkhm73svw94verhgg8kmn3pu573gj2564k23",
    balance:  "0.0000",
    network:  "Bitcoin",
    color:    "from-orange-400 to-yellow-500",
    icon:     "₿",
    coingeckoId: "bitcoin",
  },
];

const COINGECKO_IDS = DEMO_NETWORKS.map((n) => n.coingeckoId).join(",");

function fmtUsd(value) {
  if (value == null || isNaN(value)) return null;
  if (value < 0.01) return "<$0.01";
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Dashboard({ activeNetIndex = 0 }) {
  const [solWallet,   setSolWallet]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSend,    setShowSend]    = useState(false);
  const [error,       setError]       = useState(null);

  // Live USD prices keyed by coingeckoId
  const [prices, setPrices] = useState({});

  // Fetch live prices from CoinGecko
  async function fetchPrices() {
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd`,
        { cache: "no-store" }
      );
      const data = await res.json();
      // data = { solana: { usd: 150.2 }, ethereum: { usd: 3200 }, ... }
      const mapped = {};
      for (const [id, val] of Object.entries(data)) {
        mapped[id] = val?.usd ?? null;
      }
      setPrices(mapped);
    } catch (err) {
      console.warn("[Dashboard] fetchPrices error:", err.message);
    }
  }

  async function fetchWallet() {
    try {
      const res  = await fetch("/api/wallet/me");
      const data = await res.json();

      if (res.status === 404) {
        const createRes = await fetch("/api/wallet/create", { method: "POST" });
        if (createRes.ok) return fetchWallet();
        setError("fetch_failed");
        return;
      }

      if (res.status === 401) { setError("unauthenticated"); return; }
      if (!res.ok)             { setError("fetch_failed");    return; }

      setSolWallet(data);
      setError(null);
    } catch (err) {
      console.error("[Dashboard] fetchWallet:", err);
      setError("fetch_failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet();
    fetchPrices();

    const walletInterval = setInterval(fetchWallet,  15_000);
    const priceInterval  = setInterval(fetchPrices,  60_000); // refresh prices every 60s

    return () => {
      clearInterval(walletInterval);
      clearInterval(priceInterval);
    };
  }, []);

  // Merge real SOL data into network list
  const networks = DEMO_NETWORKS.map((n) => {
    if (n.chain === "Solana")    return { ...n, address: solWallet?.address ?? null, balance: solWallet?.balance ?? null };
    if (n.chain === "Ethereum")  return { ...n, balance: solWallet?.demo_eth ?? "0.0000" };
    if (n.chain === "BNB Chain") return { ...n, balance: solWallet?.demo_bnb ?? "0.0000" };
    if (n.chain === "Bitcoin")   return { ...n, balance: solWallet?.demo_btc ?? "0.0000" };
    return n;
  });

  const activeNet = networks[activeNetIndex] ?? networks[0];
  const isSolana  = activeNet.chain === "Solana";

  // Get price for active network
  const activePrice = prices[activeNet.coingeckoId] ?? null;

  // Parse balance
  const activeBalance = isSolana
    ? (solWallet?.balance != null ? Number(solWallet.balance) : 0)
    : (activeNet.balance != null ? Number(activeNet.balance) : 0);

  // USD value
  const usdValue = activePrice != null ? activeBalance * activePrice : null;

  const displayBalance = loading
    ? "..."
    : isSolana
    ? solWallet?.balance != null
      ? `${Number(solWallet.balance).toFixed(4)} SOL`
      : "0.0000 SOL"
    : `${activeNet.balance} ${activeNet.symbol}`;

  const displayAddress = isSolana ? solWallet?.address : activeNet.address;

  // Total portfolio value across all networks (best effort)
  const totalUsd = networks.reduce((sum, n) => {
    const price   = prices[n.coingeckoId] ?? 0;
    const balance = n.chain === "Solana"
      ? (solWallet?.balance != null ? Number(solWallet.balance) : 0)
      : Number(n.balance ?? 0);
    return sum + balance * price;
  }, 0);

  return (
    <div className="p-4 md:p-6 w-full">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">

        {/* Balance card */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-xs uppercase tracking-wide text-gray-400">
                {activeNet.symbol} Balance
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeposit(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Deposit
              </button>
              <button
                onClick={() => setShowSend(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Withdraw
              </button>
            </div>
          </div>

          <div className="text-xl md:text-2xl font-semibold text-white">{displayBalance}</div>

          {displayAddress && (
            <div className="mt-1.5 text-xs text-gray-600 font-mono truncate">
              {displayAddress.slice(0, 8)}…{displayAddress.slice(-6)}
            </div>
          )}
          <div className="mt-1 text-sm text-gray-500">Available to trade</div>
        </div>

        {/* Portfolio value card */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 md:p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Portfolio Value</div>
          <div className="mt-2 text-xl md:text-2xl font-semibold text-white">
            {totalUsd > 0 ? fmtUsd(totalUsd) : "$0.00"}
          </div>
          <div className="mt-1 text-sm text-gray-500">All networks combined</div>

          {/* Mini breakdown */}
          {Object.keys(prices).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {networks.map((n) => {
                const price   = prices[n.coingeckoId] ?? 0;
                const balance = n.chain === "Solana"
                  ? (solWallet?.balance != null ? Number(solWallet.balance) : 0)
                  : Number(n.balance ?? 0);
                const usd = balance * price;
                if (usd < 0.001) return null;
                return (
                  <span key={n.chain} className="text-[10px] text-gray-500 font-mono">
                    {n.icon} {fmtUsd(usd)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Open Positions */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-3 md:p-5 sm:col-span-2 lg:col-span-1">
          {/* Live price ticker */}
          {Object.keys(prices).length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              {networks.map((n) => {
                const price = prices[n.coingeckoId];
                if (!price) return null;
                return (
                  <div key={n.chain} className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>{n.icon}</span>{n.symbol}
                    </span>
                    <span className="text-gray-300 font-mono">{fmtUsd(price)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Token table */}
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <DashboardClient solBalance={solWallet?.balance ?? 0} />
      </div>

      {/* Deposit modal */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
      />

      {/* Send modal */}
      <SendModal
        isOpen={showSend}
        onClose={() => { setShowSend(false); setTimeout(fetchWallet, 2000); }}
        balance={solWallet?.balance ?? 0}
        network={activeNet}
      />
    </div>
  );
}