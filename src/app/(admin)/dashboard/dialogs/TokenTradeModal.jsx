"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AISniperModal from "./AisniperModal";

function fmt(num, opts = {}) {
  if (num == null || isNaN(num)) return "—";
  const { prefix = "", compact = true } = opts;
  if (compact) {
    if (Math.abs(num) >= 1_000_000) return `${prefix}${(num / 1_000_000).toFixed(2)}M`;
    if (Math.abs(num) >= 1_000) return `${prefix}${(num / 1_000).toFixed(1)}K`;
  }
  return `${prefix}${num.toLocaleString()}`;
}

function fmtPrice(price) {
  if (price == null) return "—";
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001)   return `$${price.toFixed(6)}`;
  if (price < 1)       return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PctBadge({ value }) {
  if (value == null) return <span className="text-gray-500">—</span>;
  const pos = value >= 0;
  return (
    <span className={`text-xs font-semibold ${pos ? "text-green-400" : "text-red-400"}`}>
      {pos ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

const SLIDE = {
  initial:  { opacity: 0, x: 24 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -24 },
  transition: { duration: 0.18 },
};

// ── Step: Overview ────────────────────────────────────────────────────────────
function OverviewStep({ token, onAction, onClose }) {
  const actions = [
    { id: "wallet",    label: "Wallet",       icon: "💼" },
    { id: "refresh",   label: "Refresh",      icon: "🔄" },
    { id: "sniper",    label: "AI Sniper",    icon: "🎯" },
    { id: "buysell",   label: "Buy or Sell",  icon: "💰" },
    { id: "positions", label: "Positions",    icon: "📊" },
    { id: "search",    label: "Search Tokens",icon: "🔍" },
    { id: "copy",      label: "Copy Trade",   icon: "📋" },
    { id: "help",      label: "Help",         icon: "❓" },
  ];

  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      {/* Token header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <img
          src={token.tokenImageUri || "/assets/default-token.png"}
          alt={token.tokenTicker}
          className="w-12 h-12 rounded-full bg-gray-800 object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = "/assets/default-token.png"; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-base">{token.tokenTicker}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
              {token.chainId?.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500 truncate">{token.tokenName}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-white font-semibold">{fmtPrice(token.priceUsd)}</div>
          <PctBadge value={token.priceChange24h} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Market Cap",  value: fmt(token.fdvUsd,       { prefix: "$" }) },
          { label: "Volume 24h",  value: fmt(token.volume24h,    { prefix: "$" }) },
          { label: "Liquidity",   value: fmt(token.liquidityUsd, { prefix: "$" }) },
          { label: "Txns 24h",    value: token.txns24h?.toLocaleString() ?? "—" },
          { label: "5M",          value: <PctBadge value={token.priceChange5m} /> },
          { label: "1H",          value: <PctBadge value={token.priceChange1h} /> },
          { label: "6H",          value: <PctBadge value={token.priceChange6h} /> },
          { label: "Age",         value: token.age ?? "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-sm text-white font-medium mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Contract address */}
      {token.tokenAddress && (
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Contract</div>
          <div className="font-mono text-xs text-gray-300 break-all">{token.tokenAddress}</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction(a.id)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-gray-200 font-medium"
          >
            <span className="text-base leading-none">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* DexScreener link */}
      {token.pairAddress && (
        <a
          href={`https://dexscreener.com/${token.chainId}/${token.pairAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          View on DexScreener ↗
        </a>
      )}
    </motion.div>
  );
}

// ── Step: Buy or Sell choice ──────────────────────────────────────────────────
function BuySellStep({ token, onChoice, onBack }) {
  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-3">💰 BUY OR SELL TOKENS</div>
        <div className="h-px bg-white/10 mb-3" />
        <p className="text-sm text-gray-300 mb-2">Choose your trading action:</p>
        <div className="space-y-1.5 text-sm text-gray-400">
          <div>📈 <strong className="text-white">Buy:</strong> Purchase tokens instantly</div>
          <div>📉 <strong className="text-white">Sell:</strong> Sell your tokens quickly</div>
        </div>
        <div className="h-px bg-white/10 my-3" />
        <p className="text-xs text-gray-500">💡 <strong className="text-gray-400">Tip:</strong> Use AI Sniper for automated trading!</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChoice("buy")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors text-white font-semibold text-sm"
        >
          📈 Buy
        </button>
        <button
          onClick={() => onChoice("sell")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-colors text-white font-semibold text-sm"
        >
          📉 Sell
        </button>
      </div>

      <button
        onClick={onBack}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm"
      >
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Step: Manual Buy ──────────────────────────────────────────────────────────
function BuyStep({ token, onBack, solBalance = 0 }) {
  const [amount,  setAmount]  = useState("");
  const [status,  setStatus]  = useState("idle");
  const [txHash,  setTxHash]  = useState(null);
  const [error,   setError]   = useState(null);

  const PRESETS = ["0.1", "0.5", "1", "5"];

  async function handleBuy() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount"); return;
    }
    if (Number(amount) > solBalance) {
      setError(`Insufficient balance. You have ${Number(solBalance).toFixed(4)} SOL`); return;
    }
    setStatus("loading"); setError(null);
    // TODO: wire to real Jupiter swap API
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setTxHash("demo_tx_" + Math.random().toString(36).slice(2));
  }

  if (status === "success") {
    return (
      <motion.div {...SLIDE} className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl">✓</div>
        <div>
          <p className="text-white font-semibold text-lg">Order placed!</p>
          <p className="text-gray-400 text-sm mt-1">Buying {amount} SOL of {token.tokenTicker}</p>
        </div>
        {txHash && (
          <p className="text-xs text-gray-600 font-mono break-all">{txHash}</p>
        )}
        <button onClick={onBack} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-3">📈 MANUAL BUY</div>
        <div className="h-px bg-white/10 mb-3" />
        <p className="text-sm text-gray-300">
          Buying <strong className="text-white">{token.tokenTicker}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1 font-mono break-all">{token.tokenAddress}</p>
        <div className="h-px bg-white/10 my-3" />
        <p className="text-xs text-gray-500">
          💡 <strong className="text-gray-400">Tip:</strong> You can also search for tokens using the Search feature!
        </p>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
        <span className="text-xs text-gray-500">Available</span>
        <span className="text-xs text-white font-semibold">{Number(solBalance).toFixed(4)} SOL</span>
      </div>

      {/* Amount input */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Amount (SOL)</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 pr-16"
          />
          <button
            onClick={() => setAmount(Math.max(0, solBalance - 0.000005).toFixed(6))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400 hover:text-green-300 font-medium"
          >
            MAX
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mt-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price estimate */}
      {amount && token.priceUsd && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs">
          <span className="text-gray-500">You receive ~</span>
          <span className="text-white font-mono">
            {(Number(amount) / token.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.tokenTicker}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Buying…</>
        ) : `Buy ${token.tokenTicker}`}
      </button>

      <button onClick={onBack} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm">
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Step: Sell ────────────────────────────────────────────────────────────────
function SellStep({ token, onBack }) {
  const [percent, setPercent] = useState("100");
  const [status,  setStatus]  = useState("idle");
  const PRESETS = ["25", "50", "75", "100"];

  async function handleSell() {
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <motion.div {...SLIDE} className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl">✓</div>
        <p className="text-white font-semibold text-lg">Sell order placed!</p>
        <p className="text-gray-400 text-sm">Selling {percent}% of your {token.tokenTicker}</p>
        <button onClick={onBack} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">Done</button>
      </motion.div>
    );
  }

  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-2">📉 SELL {token.tokenTicker}</div>
        <div className="h-px bg-white/10 mb-3" />
        <p className="text-sm text-gray-300">Select what percentage to sell</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setPercent(p)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              percent === p
                ? "bg-red-600 border-red-500 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>

      <button
        onClick={handleSell}
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors text-white font-semibold text-sm flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Selling…</>
        ) : `Sell ${percent}% of ${token.tokenTicker}`}
      </button>

      <button onClick={onBack} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm">
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Step: Search ──────────────────────────────────────────────────────────────
function SearchStep({ onBack }) {
  const [query, setQuery] = useState("");

  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-2">🔍 SEARCH TOKENS</div>
        <div className="h-px bg-white/10 mb-3" />
        <p className="text-sm text-gray-300">Enter a token contract address or ticker to search</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Contract address or ticker..."
        className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono"
        autoFocus
      />

      {query && (
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-gray-500 text-center">
          Search results will appear here
        </div>
      )}

      <button onClick={onBack} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm">
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Step: Positions ───────────────────────────────────────────────────────────
function PositionsStep({ onBack }) {
  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-2">📊 OPEN POSITIONS</div>
        <div className="h-px bg-white/10 mb-3" />
        <div className="text-sm text-gray-500 text-center py-4">No open positions yet</div>
      </div>
      <button onClick={onBack} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm">
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Step: Wallet ──────────────────────────────────────────────────────────────
function WalletStep({ onBack, solBalance }) {
  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-2">💼 WALLET</div>
        <div className="h-px bg-white/10 mb-3" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">SOL Balance</span>
          <span className="text-white font-semibold">{Number(solBalance ?? 0).toFixed(4)} SOL</span>
        </div>
      </div>
      <button onClick={onBack} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm">
        ⬅ Back
      </button>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function TokenTradeModal({ token, isOpen, onClose, solBalance = 0 }) {
  const [step, setStep] = useState("overview");  
  const [showSniper, setShowSniper] = useState(false);

  function handleAction(id) {
    if (id === "buysell")   setStep("buysell");
    if (id === "buy")       setStep("buy");
    if (id === "sell")      setStep("sell");
    if (id === "search")    setStep("search");
    if (id === "positions") setStep("positions");
    if (id === "wallet")    setStep("wallet");
    if (id === "refresh")   onClose();
    if (id === "help")      window.open("https://docs.swiftmint.com", "_blank");
    if (id === "copy")      setStep("overview"); // placeholder
    if (id === "sniper")    setShowSniper(true);
  }

  function handleClose() {
    setStep("overview");
    onClose();
  }

  const TITLES = {
    overview:  token ? `${token.tokenTicker} / ${token.chainId?.toUpperCase()}` : "",
    buysell:   "Buy or Sell",
    buy:       `Buy ${token?.tokenTicker ?? ""}`,
    sell:      `Sell ${token?.tokenTicker ?? ""}`,
    search:    "Search Tokens",
    positions: "Positions",
    wallet:    "Wallet",
  };

  return (
    <AnimatePresence>
      {isOpen && token && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
          >
            <div className="w-full rounded-2xl bg-[#0f0f11] text-white shadow-2xl ring-1 ring-white/10 max-h-[88vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                <div>
                  <div className="text-[10px] tracking-widest text-purple-400 mb-0.5">SWIFTMINT</div>
                  <h2 className="text-sm font-semibold text-white">{TITLES[step]}</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                >✕</button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <AnimatePresence mode="wait">
                  {step === "overview"  && <OverviewStep  key="overview"  token={token} onAction={handleAction} onClose={handleClose} />}
                  {step === "buysell"   && <BuySellStep   key="buysell"   token={token} onChoice={(c) => setStep(c)} onBack={() => setStep("overview")} />}
                  {step === "buy"       && <BuyStep       key="buy"       token={token} onBack={() => setStep("buysell")} solBalance={solBalance} />}
                  {step === "sell"      && <SellStep      key="sell"      token={token} onBack={() => setStep("buysell")} />}
                  {step === "search"    && <SearchStep    key="search"    onBack={() => setStep("overview")} />}
                  {step === "positions" && <PositionsStep key="positions" onBack={() => setStep("overview")} />}
                  {step === "wallet"    && <WalletStep    key="wallet"    onBack={() => setStep("overview")} solBalance={solBalance} />}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
          <AISniperModal
            isOpen={showSniper}
            onClose={() => setShowSniper(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}