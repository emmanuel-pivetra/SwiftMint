"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { useUser } from "./hooks/useUser";
import ImportWalletModal from "../(admin)/dashboard/dialogs/ImportWalletModal";

const DEMO_NETWORKS = [
  {
    chain:   "Ethereum",
    symbol:  "ETH",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: "1.4382",
    network: "ERC-20",
    color:   "from-blue-500 to-indigo-500",
    icon:    "⟠",
  },
  {
    chain:   "BNB Chain",
    symbol:  "BNB",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: "3.2100",
    network: "BEP-20",
    color:   "from-yellow-400 to-orange-400",
    icon:    "◈",
  },
  {
    chain:   "Bitcoin",
    symbol:  "BTC",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: "0.0041",
    network: "Bitcoin",
    color:   "from-orange-400 to-yellow-500",
    icon:    "₿",
  },
];

function FundAccountModal({ onClose, onDeposit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">Fund Your Trading Account</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            You need to deposit funds before you can access this feature.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => { onClose(); onDeposit?.(); }}
            className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-semibold text-sm"
          >
            Deposit SOL
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 text-sm"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2">
      <div className="h-3 w-16 bg-white/10 rounded" />
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="h-3 w-12 bg-white/10 rounded mt-2" />
      <div className="h-6 w-24 bg-white/10 rounded" />
    </div>
  );
}

function NetworkSwitcher({ networks, activeIndex, onChange }) {
  const [open, setOpen] = useState(false);
  const active = networks[activeIndex];

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [open]);


  return (
    <div className="relative mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="text-xs text-gray-500 mb-1">Network</div>

      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/10 transition-colors text-sm text-white"
      >
        <span className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${active.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
            {active.icon}
          </span>
          <span className="text-sm">{active.chain}</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-white/10 rounded-lg overflow-hidden shadow-xl">
          {networks.map((n, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={n.chain}
                onClick={() => { onChange(i); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/5 text-white cursor-default"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${n.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {n.icon}
                </span>
                <span className="flex-1 text-left">{n.chain}</span>
                <span className="text-[10px] text-gray-500">{n.symbol}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// activeNetIndex and onNetworkChange come from DashboardPage (shared state)
export default function SidebarClient({ onOpenDeposit, activeNetIndex = 0, onNetworkChange }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const { user, loading: userLoading, signOut, initials } = useUser();

  const [wallet,        setWallet]        = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showImport,    setShowImport]    = useState(false);

  // Build full network list with real SOL data merged in
  const solNetwork = {
    chain:   "Solana",
    symbol:  "SOL",
    address: wallet?.address ?? "Loading…",
    balance: wallet?.balance != null ? Number(wallet.balance).toFixed(4) : "—",
    network: "Solana",
    color:   "from-purple-500 to-pink-500",
    icon:    "◎",
  };

  const allNetworks = [solNetwork, ...DEMO_NETWORKS];
  const activeNet   = allNetworks[activeNetIndex] ?? allNetworks[0];

  const shortAddress = activeNet?.address && activeNet.address !== "Loading…"
    ? `${activeNet.address.slice(0, 6)}…${activeNet.address.slice(-4)}`
    : activeNet?.address ?? "—";

  const displayBalance = activeNet?.balance != null
    ? `${activeNet.balance} ${activeNet.symbol}`
    : "—";

  const fetchWallet = useCallback(async () => {
    if (!user) { setWallet(null); setWalletLoading(false); return; }
    try {
      const res = await fetch("/api/wallet/me");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWallet(data);
    } catch {
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
    const interval = setInterval(fetchWallet, 15_000);
    return () => clearInterval(interval);
  }, [fetchWallet]);

  function handleNavClick(e) {
    e.preventDefault();
    setShowFundModal(true);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }



  return (
    <>
      {showFundModal && (
        <FundAccountModal
          onClose={() => setShowFundModal(false)}
          onDeposit={onOpenDeposit}
        />
      )}

      <ImportWalletModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => {
          setShowImport(false);
          fetchWallet();
        }}
      />

      <nav className="flex flex-col mx-auto gap-3 w-full">
        <div className="mb-4 rounded-md text-sm">
          {userLoading || walletLoading ? (
            <WalletSkeleton />
          ) : user && wallet ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="truncate text-xs text-gray-400">
                  {user.user_metadata?.full_name || user.email}
                </div>
              </div>

              {/* Network switcher — calls onNetworkChange to update parent */}
              <NetworkSwitcher
                networks={allNetworks}
                activeIndex={activeNetIndex}
                onChange={(i) => onNetworkChange?.(i)}
              />

              {/* Address */}
              <div className="mt-3">
                <div className="text-xs text-gray-500">Wallet Address</div>
                <div className="mt-1 font-mono text-sm text-white">{shortAddress}</div>
              </div>

              {/* Balance */}
              <div className="mt-3">
                <div className="text-xs text-gray-500">{activeNet.symbol} Balance</div>
                <div className="text-lg font-semibold text-white">{displayBalance}</div>
              </div>

              {/* Import */}
              <button
                onClick={() => setShowImport(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors text-green-400 hover:text-green-300 text-xs"
              >
                Import Wallet
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 text-xs"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 mb-1">Sign in to access your wallet</p>
              <button
                onClick={() => router.push("/?login=true")}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-xs font-semibold"
              >
                Log in
              </button>
              <button
                onClick={() => router.push("/?signup=true")}
                className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 text-xs"
              >
                Create account
              </button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-3 h-full">
          {navConfig.map((item) => (
            <div key={item.href} onClick={handleNavClick} className="cursor-pointer">
              <NavItem
                href=""
                text={item.text}
                icon={item.icon}
                active={isActive(item.href)}
              />
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}