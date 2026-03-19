"use client";

import { useState } from "react";
import { Bell, Star, Wallet, Settings, Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ chain = "SOL", onOpenDeposit = () => {} }) {
  const router = useRouter();
  const [openChainMenu, setOpenChainMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-full items-center gap-6 px-6">
        {/* Logo */}
        <div className="flex cursor-pointer items-center gap-2" onClick={() => router.push("/")}>
          <span className="text-lg font-semibold tracking-wide text-white">SwiftMint</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden w-[280px] md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input
            placeholder="Search by token or CA..."
            className="h-9 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <kbd className="absolute right-2 top-2 rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/50">/</kbd>
        </div>

        {/* Chain Selector (simple) */}
        <div className="relative">
          <button
            onClick={() => setOpenChainMenu((s) => !s)}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            {chain}
          </button>
        </div>

        {/* Deposit — delegated to parent via callback */}
        <button
          onClick={onOpenDeposit}
          className="ml-3 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          Deposit
        </button>

        {/* Icons */}
        <div className="flex items-center gap-3 text-white/70 ml-3">
          <Star className="h-5 w-5 cursor-pointer hover:text-white" />
          <Bell className="h-5 w-5 cursor-pointer hover:text-white" />
          <Wallet className="h-5 w-5 cursor-pointer hover:text-white" />
        </div>

        {/* Profile */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-xs font-semibold ml-3">
          DR
        </div>

        {/* Settings */}
        <Settings className="h-5 w-5 cursor-pointer text-white/70 hover:text-white ml-3" />
      </div>
    </header>
  );
}