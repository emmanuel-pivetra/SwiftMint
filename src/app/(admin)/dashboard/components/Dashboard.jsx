"use client";

import { useWallet } from "../../../components/hooks/useWallet";
import DashboardClient from "./DashboardClient";

export default function Dashboard() {
  const { formattedBalance, isConnected } = useWallet();

  return (
    <div className="p-6 w-full">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-400">Balance</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {isConnected && formattedBalance ? formattedBalance : "$0.00"}
          </div>
          <div className="mt-1 text-sm text-gray-500">Available to trade</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-400">24h PnL</div>
          <div className="mt-2 text-2xl font-semibold text-green-400">+$0.00</div>
          <div className="mt-1 text-sm text-gray-500">Since last session</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-gray-900 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-400">Open Positions</div>
          <div className="mt-2 text-2xl font-semibold text-white">0</div>
          <div className="mt-1 text-sm text-gray-500">Currently active</div>
        </div>
      </div>

      <DashboardClient />
    </div>
  );
}