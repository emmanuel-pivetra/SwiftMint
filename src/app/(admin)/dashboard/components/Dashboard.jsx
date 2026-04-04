"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import DashboardClient from "./DashboardClient";
import DepositModal from "../dialogs/DepositModal";

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [solBalance,   setSolBalance]   = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [showDeposit,  setShowDeposit]  = useState(false);

  // Fetch balance + subscribe to real-time account changes
  useEffect(() => {
    if (!publicKey || !connected) { setSolBalance(null); return; }

    let mounted = true;
    let subId   = null;

    async function fetchBalance() {
      setLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey, "confirmed");
        if (mounted) setSolBalance(lamports / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("[Dashboard] fetchBalance error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBalance();

    // Live updates whenever the account changes (e.g. after a deposit)
    try {
      subId = connection.onAccountChange(
        publicKey,
        (info) => {
          if (mounted && info?.lamports != null) {
            setSolBalance(info.lamports / LAMPORTS_PER_SOL);
          }
        },
        "confirmed"
      );
    } catch {
      // Fallback: poll every 10s if onAccountChange isn't supported
      const poll = setInterval(fetchBalance, 10_000);
      subId = { poll };
    }

    return () => {
      mounted = false;
      if (typeof subId === "number") {
        connection.removeAccountChangeListener(subId).catch(() => {});
      } else if (subId?.poll) {
        clearInterval(subId.poll);
      }
    };
  }, [publicKey?.toBase58(), connection, connected]);

  const displayBalance = loading
    ? "..."
    : solBalance != null
    ? `${solBalance.toFixed(4)} SOL`
    : "0.0000 SOL";

  const solAddress = publicKey?.toBase58() ?? "";

  return (
    <div className="p-6 w-full">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">

        {/* Balance card */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">SOL Balance</div>
            <button
              onClick={() => setShowDeposit(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Deposit
            </button>
          </div>
          <div className="text-2xl font-semibold text-white">
            {connected ? displayBalance : "0.0000 SOL"}
          </div>
          <div className="mt-1 text-sm text-gray-500">Available to trade</div>
        </div>

        {/* 24h PnL */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-400">24h PnL</div>
          <div className="mt-2 text-2xl font-semibold text-green-400">+$0.00</div>
          <div className="mt-1 text-sm text-gray-500">Since last session</div>
        </div>

        {/* Open Positions */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-400">Open Positions</div>
          <div className="mt-2 text-2xl font-semibold text-white">0</div>
          <div className="mt-1 text-sm text-gray-500">Currently active</div>
        </div>

      </div>

      <DashboardClient />

      {/* Deposit modal — Solana only */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        wallets={[
          {
            chain:   "Solana",
            symbol:  "SOL",
            address: solAddress,
            balance: solBalance != null ? solBalance.toFixed(4) : "0.0000",
            network: "Solana",
            color:   "from-purple-500 to-pink-500",
            initial: "S",
          },
        ]}
      />
    </div>
  );
}