"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { useUser } from "./hooks/useUser";
import ImportWalletModal from "../(admin)/dashboard/dialogs/ImportWalletModal";
import { AnimatePresence, motion } from "framer-motion";

const DEMO_NETWORKS = [
  { chain: "Ethereum", symbol: "ETH", address: "0x527213AA6894cBcD2D6Ac1210b2Fc33de66ad934", balance: "1.4382", network: "ERC-20",  color: "from-blue-500 to-indigo-500",   icon: "⟠" },
  { chain: "BNB Chain", symbol: "BNB", address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52", balance: "3.2100", network: "BEP-20",  color: "from-yellow-400 to-orange-400", icon: "◈" },
  { chain: "Bitcoin",   symbol: "BTC", address: "bc1qnjrkhm73svw94verhgg8kmn3pu573gj2564k23", balance: "0.0041", network: "Bitcoin", color: "from-orange-400 to-yellow-500",  icon: "₿" },
];

// ── Generic modal shell ───────────────────────────────────────────────────────
function NavModal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-sm bg-[#0f0f11] rounded-2xl ring-1 ring-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[10px] tracking-widest text-purple-400 mb-0.5">SWIFTMINT</div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ── Dashboard modal ───────────────────────────────────────────────────────────
function DashboardModal({ onClose }) {
  const stats = [
    { icon: "◎", label: "SOL Balance",     value: "Live",   color: "text-purple-400" },
    { icon: "📊", label: "Open Positions",  value: "0",      color: "text-blue-400"   },
    { icon: "💰", label: "24h PnL",         value: "+$0.00", color: "text-green-400"  },
    { icon: "⚡", label: "AI Sniper",       value: "Standby",color: "text-yellow-400" },
  ];

  return (
    <NavModal title="Dashboard" subtitle="Your trading overview" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-gray-400 leading-relaxed">
          Your main trading hub. Monitor balances across SOL, ETH, BNB, and BTC — and access the live token market below.
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors">
          View Dashboard
        </button>
      </div>
    </NavModal>
  );
}

// ── Discover modal ────────────────────────────────────────────────────────────
function DiscoverModal({ onClose }) {
  const categories = [
    { icon: "🔥", label: "Trending",     desc: "Top movers in the last hour" },
    { icon: "🆕", label: "New Listings", desc: "Recently launched tokens" },
    { icon: "💎", label: "High Volume",  desc: "Tokens with surging volume" },
    { icon: "⚡", label: "Boosted",      desc: "Promoted & featured tokens" },
  ];

  return (
    <NavModal title="Discover" subtitle="Explore trending tokens & opportunities" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-400 leading-relaxed">
          Browse the live token market powered by DexScreener. Find the next opportunity across all chains.
        </p>
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors cursor-pointer">
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">{c.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </NavModal>
  );
}

// ── Trackers modal ────────────────────────────────────────────────────────────
function TrackersModal({ onClose, onDeposit }) {
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
// ── Perpetual modal ───────────────────────────────────────────────────────────
function PerpetualModal({ onClose }) {
  const features = [
    { icon: "📊", label: "Long / Short",    desc: "Trade with leverage up to 10x" },
    { icon: "🛡️", label: "Auto Liquidation",desc: "Positions protected with stop-loss" },
    { icon: "💧", label: "Deep Liquidity",  desc: "Powered by Jupiter & Drift" },
    { icon: "📉", label: "Funding Rates",   desc: "Real-time perpetual funding" },
  ];

  return (
    <NavModal title="Perpetual" subtitle="Leveraged perpetual trading" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-xs text-blue-200/80 leading-relaxed">
          ℹ️ Perpetual trading is coming soon. You'll be able to trade SOL, ETH and BTC with up to 10x leverage.
        </div>
        <div className="flex flex-col gap-2">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">{f.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
              </div>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 font-medium flex-shrink-0">Soon</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
          Notify Me
        </button>
      </div>
    </NavModal>
  );
}

// ── Vision modal ──────────────────────────────────────────────────────────────
function VisionModal({ onClose }) {
  const metrics = [
    { icon: "📈", label: "Total Return",   value: "+0.00%", sub: "All time" },
    { icon: "🏆", label: "Best Trade",     value: "$0.00",  sub: "Highest profit" },
    { icon: "📉", label: "Worst Trade",    value: "$0.00",  sub: "Largest loss" },
    { icon: "🔄", label: "Total Trades",   value: "0",      sub: "Executed" },
  ];

  return (
    <NavModal title="Vision" subtitle="Analytics & performance insights" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <div className="text-lg mb-1">{m.icon}</div>
              <div className="text-sm font-bold text-white">{m.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
              <div className="text-[9px] text-gray-600">{m.sub}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-center">
          <div className="text-gray-600 text-xs mb-1">PnL Chart</div>
          <div className="text-gray-700 text-[11px]">No trading data yet</div>
          <div className="mt-2 h-12 flex items-end justify-center gap-1">
            {[2,3,1,4,2,3,5,2,4,3,5,4].map((h, i) => (
              <div key={i} className="w-2 rounded-sm bg-white/5" style={{ height: `${h * 8}px` }} />
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
          Close
        </button>
      </div>
    </NavModal>
  );
}

// ── Modal map keyed by nav item text (lowercase) ──────────────────────────────
const NAV_MODALS = {
  dashboard:  DashboardModal,
  discover:   DiscoverModal,
  trackers:   TrackersModal,
  perpetual:  PerpetualModal,
  vision:     VisionModal,
};

function getModalKey(item) {
  return item.text?.toLowerCase().trim();
}

// ── Wallet skeleton ───────────────────────────────────────────────────────────
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

// ── Network switcher ──────────────────────────────────────────────────────────
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}>
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
                  isActive ? "bg-white/5 text-white cursor-default" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${n.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {n.icon}
                </span>
                <span className="flex-1 text-left">{n.chain}</span>
                <span className="text-[10px] text-gray-500">{n.symbol}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main SidebarClient ────────────────────────────────────────────────────────
export default function SidebarClient({ onOpenDeposit, activeNetIndex = 0, onNetworkChange }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const { user, loading: userLoading, signOut, initials } = useUser();

  const [wallet,        setWallet]        = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showImport,    setShowImport]    = useState(false);
  const [activeModal,   setActiveModal]   = useState(null);

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

  const fetchWallet = useCallback(async () => {
    if (!user) { setWallet(null); setWalletLoading(false); return; }
    try {
      const res  = await fetch("/api/wallet/me");
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

  function handleNavClick(e, item) {
    e.preventDefault();
    const key = getModalKey(item);
    if (key && NAV_MODALS[key]) setActiveModal(key);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const ModalComponent = activeModal ? NAV_MODALS[activeModal] : null;

  return (
    <>
      <AnimatePresence>
        {ModalComponent && (
          <ModalComponent key={activeModal} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>

      <ImportWalletModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => { setShowImport(false); fetchWallet(); }}
      />

      <nav className="flex flex-col mx-auto gap-3 w-full">
        <div className="mb-4 rounded-md text-sm">
          {userLoading || walletLoading ? (
            <WalletSkeleton />
          ) : user && wallet ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="truncate text-xs text-gray-400">
                  {user.user_metadata?.full_name || user.email}
                </div>
              </div>

              <NetworkSwitcher
                networks={allNetworks}
                activeIndex={activeNetIndex}
                onChange={(i) => onNetworkChange?.(i)}
              />

              <div className="mt-3">
                <div className="text-xs text-gray-500">Wallet Address</div>
                <div className="mt-1 font-mono text-sm text-white">
                  {wallet?.address
                    ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`
                    : "—"}
                </div>
              </div>

              <button
                onClick={() => setShowImport(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors text-green-400 hover:text-green-300 text-xs"
              >
                Import Wallet
              </button>

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
              <button onClick={() => router.push("/?login=true")} className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-xs font-semibold">Log in</button>
              <button onClick={() => router.push("/?signup=true")} className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 text-xs">Create account</button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 h-full">
          {navConfig.map((item) => (
            <div
              key={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className="cursor-pointer"
            >
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