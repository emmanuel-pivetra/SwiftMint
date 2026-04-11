"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import DepositModal from "../dialogs/DepositModal";
import SendModal from "../dialogs/SendModal";

const DEMO_NETWORKS = [
  {
    chain:   "Solana",
    symbol:  "SOL",
    address: null,
    balance: null,
    network: "Solana",
    color:   "from-purple-500 to-pink-500",
    icon:    "◎",
  },
  {
    chain:   "Ethereum",
    symbol:  "ETH",
    address: "0x527213AA6894cBcD2D6Ac1210b2Fc33de66ad934",
    balance: "0.0000",
    network: "ERC-20",
    color:   "from-blue-500 to-indigo-500",
    icon:    "⟠",
  },
  {
    chain:   "BNB Chain",
    symbol:  "BNB",
    address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
    balance: "0.0000",
    network: "BEP-20",
    color:   "from-yellow-400 to-orange-400",
    icon:    "◈",
  },
  {
    chain:   "Bitcoin",
    symbol:  "BTC",
    address: "bc1pvxzqhrn77ccaxddl6kmdug2w9jtjedx4dzewg626s3hjfhavtd0q464j8m",
    balance: "0.0000",
    network: "Bitcoin",
    color:   "from-orange-400 to-yellow-500",
    icon:    "₿",
  },
];

export default function Dashboard({ activeNetIndex = 0 }) {
  const [solWallet,   setSolWallet]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSend,    setShowSend]    = useState(false);
  const [error,       setError]       = useState(null);

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
    const interval = setInterval(fetchWallet, 15_000);
    return () => clearInterval(interval);
  }, []);

  // Merge real SOL data into network list
  const networks = DEMO_NETWORKS.map((n) =>
    n.chain === "Solana"
      ? { ...n, address: solWallet?.address ?? null, balance: solWallet?.balance ?? null }
      : n
  );

  const activeNet = networks[activeNetIndex] ?? networks[0];
  const isSolana  = activeNet.chain === "Solana";

  const displayBalance = loading
    ? "..."
    : isSolana
    ? solWallet?.balance != null
      ? `${Number(solWallet.balance).toFixed(4)} SOL`
      : "0.0000 SOL"
    : `${activeNet.balance} ${activeNet.symbol}`;

  const displayAddress = isSolana ? solWallet?.address : activeNet.address;

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
                  Send
                </button>
            </div>
          </div>

          <div className="text-xl md:text-2xl font-semibold text-white">{displayBalance}</div>

          {displayAddress && (
            <div className="mt-1 text-xs text-gray-600 font-mono truncate">
              {displayAddress.slice(0, 8)}…{displayAddress.slice(-6)}
            </div>
          )}
          <div className="mt-1 text-sm text-gray-500">Available to trade</div>
        </div>

        {/* 24h PnL */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 md:p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">24h PnL</div>
          <div className="mt-2 text-xl md:text-2xl font-semibold text-green-400">+$0.00</div>
          <div className="mt-1 text-sm text-gray-500">Since last session</div>
        </div>

        {/* Open Positions */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 md:p-5 sm:col-span-2 lg:col-span-1">
          <div className="text-xs uppercase tracking-wide text-gray-400">Open Positions</div>
          <div className="mt-2 text-xl md:text-2xl font-semibold text-white">0</div>
          <div className="mt-1 text-sm text-gray-500">Currently active</div>
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

      {/* Send modal — Solana only */}
      <SendModal
        isOpen={showSend}
        onClose={() => { setShowSend(false); setTimeout(fetchWallet, 2000); }}
        balance={solWallet?.balance ?? 0}
        network={activeNet}
      />
    </div>
  );
}