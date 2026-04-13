"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";

const STATIC_WALLETS = [
  {
    chain:   "Ethereum",
    symbol:  "ETH",
    address: "0x527213AA6894cBcD2D6Ac1210b2Fc33de66ad934",
    balance: "1.4382",
    network: "ERC-20",
    color:   "from-blue-500 to-indigo-500",
    initial: "E",
  },
  {
    chain:   "BNB Chain",
    symbol:  "BNB",
    address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
    balance: "3.2100",
    network: "BEP-20",
    color:   "from-yellow-400 to-orange-400",
    initial: "B",
  },
  {
    chain:   "Bitcoin",
    symbol:  "BTC",
    address: "bc1qnjrkhm73svw94verhgg8kmn3pu573gj2564k23",
    balance: "540.00",
    network: "Bitcoin",
    color:   "from-purple-400 to-indigo-400",
    initial: "B",
  },
];

export default function DepositModal({
  isOpen  = false,
  onClose = () => {},
  wallets: externalWallets,
}) {
  const modalRef      = useRef(null);
  const firstFocusRef = useRef(null);

  const [solWallet,    setSolWallet]    = useState(null);
  const [activeTab,    setActiveTab]    = useState("Deposit");
  const [activeWallet, setActiveWallet] = useState(0);
  const [copied,       setCopied]       = useState(false);

  // Fetch real Solana wallet address from the API
  useEffect(() => {
    if (!isOpen) return;

    async function fetchSolWallet() {
      try {
        const res  = await fetch("/api/wallet/me");
        const data = await res.json();
        if (res.ok && data.address) {
          setSolWallet({
            chain:   "Solana",
            symbol:  "SOL",
            address: data.address,
            balance: data.balance != null ? Number(data.balance).toFixed(4) : "0.0000",
            network: "Solana",
            color:   "from-purple-500 to-pink-500",
            initial: "S",
          });
        }
      } catch (err) {
        console.error("[DepositModal] fetchSolWallet:", err);
      }
    }

    fetchSolWallet();
  }, [isOpen]);

  // Build wallet list — real SOL first, then static others
  const wallets = externalWallets ?? [
    solWallet ?? {
      chain:   "Solana",
      symbol:  "SOL",
      address: "Loading…",
      balance: "—",
      network: "Solana",
      color:   "from-purple-500 to-pink-500",
      initial: "S",
    },
    ...STATIC_WALLETS,
  ];

  const wallet = wallets[activeWallet] ?? wallets[0];

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Focus trap + ESC
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => firstFocusRef.current?.focus(), 80);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [isOpen, onClose]);

  async function handleCopy(text) {
    if (!text || text === "Loading…") return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.error("copy failed", err);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-lg"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="deposit-title"
              className="w-full rounded-2xl bg-[#0f0f11] text-white shadow-2xl ring-1 ring-white/10 max-h-[90vh] overflow-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 id="deposit-title" className="text-base font-semibold">Exchange</h3>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="text-white/50 hover:text-white transition-colors text-lg leading-none"
                >✕</button>
              </div>

              {/* Tabs */}
              <div className="px-4 pt-4">
                <div className="flex gap-1 rounded-xl bg-white/5 p-1">
                  {["Deposit"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === t
                          ? "bg-[#1a1a1e] text-white shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 py-5 flex flex-col gap-5">

                {/* Chain selector */}
                <div>
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Select Network</p>
                  <div className="grid grid-cols-2 gap-2">
                    {wallets.map((w, i) => (
                      <button
                        key={w.chain}
                        onClick={() => setActiveWallet(i)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all border ${
                          activeWallet === i
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${w.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                          {w.initial}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-xs">{w.chain}</div>
                          <div className="text-[10px] text-white/40">{w.network}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="flex gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
                  <span className="text-yellow-400 text-base leading-none mt-0.5">⚠</span>
                  <p className="text-xs text-yellow-200/80 leading-relaxed">
                    Only send <strong>{wallet.symbol}</strong> via the{" "}
                    <strong>{wallet.network}</strong> network to this address.
                    Sending other assets may result in permanent loss.
                  </p>
                </div>

                {/* QR + address */}
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-xl bg-white p-3">
                    {wallet.address && wallet.address !== "Loading…" ? (
                      <QRCode value={wallet.address} size={148} />
                    ) : (
                      <div className="w-[148px] h-[148px] flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="w-full rounded-xl border border-white/10 bg-[#0b0b0c] p-4">
                    <div className="text-xs text-white/50 mb-1.5">Deposit Address</div>
                    <div className="font-mono text-sm break-all text-white leading-relaxed">
                      {wallet.address}
                    </div>
                    <button
                      ref={firstFocusRef}
                      onClick={() => handleCopy(wallet.address)}
                      disabled={!wallet.address || wallet.address === "Loading…"}
                      className={`mt-3 w-full rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                        copied
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white/10 hover:bg-white/15 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {copied ? "✓ Copied!" : "Copy Address"}
                    </button>
                  </div>
                </div>

                {/* Buy link */}
                <p className="text-center text-sm text-white/50">
                  Don't have any {wallet.symbol}?{" "}
                  <a
                    href="https://onramper.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    Buy through Onramper
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}