"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import DepositModal from "../dialogs/DepositModal";
import SendModal from "../dialogs/SendModal";

export default function Dashboard() {
  const [wallet,      setWallet]      = useState(null); // { address, balance, symbol }
  const [loading,     setLoading]     = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSend,    setShowSend]    = useState(false);

  async function fetchWallet() {
    try {
      const res = await fetch("/api/wallet/me");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWallet(data);
    } catch (err) {
      console.error("[Dashboard] fetchWallet:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet();
    // Poll every 15s so balance updates after a deposit
    const interval = setInterval(fetchWallet, 15_000);
    return () => clearInterval(interval);
  }, []);

  const displayBalance = loading
    ? "..."
    : wallet?.balance != null
    ? `${Number(wallet.balance).toFixed(4)} SOL`
    : "0.0000 SOL";

  return (
    <div className="p-4 md:p-6 w-full">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">

        {/* Balance */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">SOL Balance</div>
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
          {wallet?.address && (
            <div className="mt-1 text-xs text-gray-600 font-mono truncate">
              {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
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
        <DashboardClient />
      </div>

      {/* Deposit modal */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        wallets={wallet ? [{
          chain:   "Solana",
          symbol:  "SOL",
          address: wallet.address,
          balance: Number(wallet.balance).toFixed(4),
          network: "Solana",
          color:   "from-purple-500 to-pink-500",
          initial: "S",
        }] : []}
      />

      {/* Send modal */}
      <SendModal
        isOpen={showSend}
        onClose={() => {
          setShowSend(false);
          // Refresh balance after sending
          setTimeout(fetchWallet, 2000);
        }}
        balance={wallet?.balance ?? 0}
      />
    </div>
  );
}