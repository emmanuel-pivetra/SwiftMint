"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SLIDE = {
  initial:    { opacity: 0, x: 20 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: -20 },
  transition: { duration: 0.15 },
};

// ── Default sniper config ────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  positionSize: 1,       // SOL
  devHold:      20,      // %
  slippage:     10,      // %
  priorityFee:  0.001,   // SOL
  takeProfit:   100,     // %
  stopLoss:     30,      // %
  antiRug:      true,
};

// ── Setting panel components ─────────────────────────────────────────────────

function SettingRow({ label, value, unit = "" }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white font-mono">{value}{unit}</span>
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit, description, recommended, guide }) {
  const [input, setInput] = useState(String(value));
  const [error, setError] = useState(null);

  function handleSave() {
    const n = parseFloat(input);
    if (isNaN(n) || n < min || n > max) {
      setError(`Enter a value between ${min} and ${max}`);
      return;
    }
    setError(null);
    onChange(n);
  }

  return (
    <motion.div {...SLIDE} className="flex flex-col gap-3">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="text-xs font-bold text-white mb-2">{label}</div>
        <div className="h-px bg-white/10 mb-3" />
        <p className="text-sm text-gray-300 mb-3">{description}</p>
        <div className="space-y-1 text-xs text-gray-400">
          <div>📊 <strong className="text-gray-300">Range:</strong> {min}–{max}{unit}</div>
          <div>✅ <strong className="text-gray-300">Recommended:</strong> {recommended}</div>
        </div>
        {guide && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-semibold text-gray-300">⚙️ Guide:</div>
            {guide.map((g, i) => (
              <div key={i} className="text-xs text-gray-500">• {g}</div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 pr-12"
          placeholder={`Enter value (${min}–${max})`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">{unit}</span>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">{error}</div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 transition-colors text-white font-semibold text-sm"
      >
        Save
      </button>
    </motion.div>
  );
}

// ── Anti-Rug detail panel ─────────────────────────────────────────────────────
function AntiRugPanel({ enabled, onToggle, onBack }) {
  return (
    <motion.div {...SLIDE} className="flex flex-col gap-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🛡️</span>
          <div className="text-xs font-bold text-white">ANTI-RUG PROTECTION</div>
        </div>
        <div className="h-px bg-white/10 mb-3" />

        {enabled ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-white font-bold text-sm">ENABLED</span>
            </div>
            <div className="space-y-2 text-sm">
              {["Auto-sell activated on rug detection", "Liquidity pull protection", "Instant exit on suspicious activity"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400 text-xs">✅</span>{f}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-white font-bold text-sm">DISABLED</span>
            </div>
            <div className="space-y-2 text-sm">
              {["Manual intervention required", "No automatic protection", "Higher risk exposure"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400 text-xs">⚠️</span>{f}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onToggle}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
          enabled
            ? "bg-red-700 hover:bg-red-600 text-white"
            : "bg-green-700 hover:bg-green-600 text-white"
        }`}
      >
        {enabled ? "Disable Anti-Rug" : "Enable Anti-Rug"}
      </button>

      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-colors"
      >
        « Back to Sniper
      </button>
    </motion.div>
  );
}

// ── Main Sniper Modal ─────────────────────────────────────────────────────────
export default function AISniperModal({ isOpen, onClose }) {
  const [config,   setConfig]   = useState(DEFAULT_CONFIG);
  const [active,   setActive]   = useState(false); // sniper running?
  const [step,     setStep]     = useState("main"); // main | activated | buyAmount | devHold | slippage | priority | takeProfit | stopLoss | antiRug
  const [justActed, setJustActed] = useState(null); // "activated" | "deactivated"

  function updateConfig(key, val) {
    setConfig((c) => ({ ...c, [key]: val }));
    setStep("main");
  }

  function handleActivate() {
    setActive(true);
    setJustActed("activated");
    setStep("status");
  }

  function handlePause() {
    setActive(false);
    setJustActed("deactivated");
    setStep("status");
  }

  function handleClose() {
    setStep("main");
    setJustActed(null);
    onClose();
  }

  const TITLES = {
    main:       "AI Sniper",
    status:     active ? "Sniper Active" : "Sniper Paused",
    buyAmount:  "Buy Amount",
    devHold:    "Dev Hold",
    slippage:   "Slippage Tolerance",
    priority:   "Priority Fee",
    takeProfit: "Take Profit",
    stopLoss:   "Stop Loss",
    antiRug:    "Anti-Rug Protection",
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                  <div className="text-[10px] tracking-widest text-yellow-400 mb-0.5">SWIFTMINT</div>
                  <h2 className="text-sm font-semibold">{TITLES[step]}</h2>
                </div>
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-lg leading-none">✕</button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <AnimatePresence mode="wait">

                  {/* ── MAIN SCREEN ── */}
                  {step === "main" && (
                    <motion.div key="main" {...SLIDE} className="flex flex-col gap-3">

                      {/* Config summary */}
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-xs font-bold text-white mb-2">⚡ AI SNIPER CONFIGURATION</div>
                        <div className="h-px bg-white/10 mb-3" />

                        {/* Status */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${active ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-xs font-bold text-white">STATUS: {active ? "ACTIVE" : "STANDBY"}</span>
                        </div>

                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">📊 Trading Parameters</div>
                        <div className="space-y-0.5 mb-3">
                          <SettingRow label="💰 Position Size" value={config.positionSize} unit=" SOL" />
                          <SettingRow label="👤 Max Dev Hold"  value={config.devHold}      unit="%" />
                          <SettingRow label="⚡ Slippage"       value={config.slippage}     unit="%" />
                          <SettingRow label="🚀 Priority Fee"  value={config.priorityFee}  unit=" SOL" />
                        </div>

                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">🎯 Risk Management</div>
                        <div className="space-y-0.5">
                          <SettingRow label="📈 Take Profit" value={`+${config.takeProfit}`} unit="%" />
                          <SettingRow label="📉 Stop Loss"   value={`-${config.stopLoss}`}   unit="%" />
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-400">🛡️ Anti-Rug</span>
                            <span className={`text-xs font-bold flex items-center gap-1 ${config.antiRug ? "text-green-400" : "text-red-400"}`}>
                              <span className={`w-2 h-2 rounded-full ${config.antiRug ? "bg-green-400" : "bg-red-400"}`} />
                              {config.antiRug ? "ENABLED" : "DISABLED"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-gray-600 italic">⚙️ Professional-grade automated trading</div>
                      </div>

                      {/* Activate / Pause */}
                      <button
                        onClick={active ? handlePause : handleActivate}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                          active
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-green-700 hover:bg-green-600 text-white"
                        }`}
                      >
                        {active ? "⏸ PAUSE SNIPER" : "▶ ACTIVATE SNIPER"}
                      </button>

                      {/* Config buttons grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "buyAmount",  icon: "💰", label: "Buy Amount" },
                          { id: "devHold",    icon: "👤", label: "Dev Hold" },
                          { id: "slippage",   icon: "⚡", label: "Slippage" },
                          { id: "priority",   icon: "🚀", label: "Priority" },
                          { id: "takeProfit", icon: "📈", label: "Take Profit" },
                          { id: "stopLoss",   icon: "📉", label: "Stop Loss" },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setStep(btn.id)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-gray-200"
                          >
                            <span>{btn.icon}</span>{btn.label}
                          </button>
                        ))}
                      </div>

                      {/* Anti-Rug full-width */}
                      <button
                        onClick={() => setStep("antiRug")}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                          config.antiRug
                            ? "bg-green-900/30 border-green-500/30 text-green-300"
                            : "bg-red-900/30 border-red-500/30 text-red-300"
                        }`}
                      >
                        🛡️ Anti-Rug: {config.antiRug ? "ON" : "OFF"}
                      </button>

                      {/* Dashboard */}
                      <button
                        onClick={handleClose}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 text-sm"
                      >
                        🏠 Dashboard
                      </button>
                    </motion.div>
                  )}

                  {/* ── STATUS SCREEN ── */}
                  {step === "status" && (
                    <motion.div key="status" {...SLIDE} className="flex flex-col gap-4">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span>⚡</span>
                          <div className="text-xs font-bold text-white">
                            AI SNIPER {active ? "ACTIVATED" : "DEACTIVATED"}
                          </div>
                        </div>
                        <div className="h-px bg-white/10 mb-3" />

                        {active ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                              System is now monitoring for opportunities
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="text-green-400 text-xs">✅</span>Auto-trading enabled
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="text-green-400 text-xs">✅</span>All filters active
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                              System on standby
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="text-xs">⏸️</span>Auto-trading paused
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="text-xs">⏸️</span>Manual mode active
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setStep("main")}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-colors"
                      >
                        ⬅ Back
                      </button>
                    </motion.div>
                  )}

                  {/* ── BUY AMOUNT ── */}
                  {step === "buyAmount" && (
                    <NumberInput
                      key="buyAmount"
                      label="💰 BUY AMOUNT"
                      value={config.positionSize}
                      onChange={(v) => updateConfig("positionSize", v)}
                      min={0.01} max={100} step={0.1} unit=" SOL"
                      description="Set how much SOL to spend per trade."
                      recommended="0.5–2 SOL"
                      guide={[
                        "0.1–0.5 SOL: Conservative (lower risk)",
                        "0.5–2 SOL: Balanced (recommended)",
                        "2+ SOL: Aggressive (higher risk/reward)",
                      ]}
                    />
                  )}

                  {/* ── DEV HOLD ── */}
                  {step === "devHold" && (
                    <NumberInput
                      key="devHold"
                      label="👤 SET MAX DEV HOLDING"
                      value={config.devHold}
                      onChange={(v) => updateConfig("devHold", v)}
                      min={0} max={100} step={1} unit="%"
                      description="Only snipe tokens where developer holds less than this percentage."
                      recommended="10–30%"
                      guide={[
                        "Low % = safer (dev holds less)",
                        "High % = riskier (dev can dump more)",
                        "Examples: 10, 20, 30",
                      ]}
                    />
                  )}

                  {/* ── SLIPPAGE ── */}
                  {step === "slippage" && (
                    <NumberInput
                      key="slippage"
                      label="⚡ SLIPPAGE TOLERANCE"
                      value={config.slippage}
                      onChange={(v) => updateConfig("slippage", v)}
                      min={1} max={50} step={1} unit="%"
                      description="Set maximum acceptable price movement during execution."
                      recommended="8–12%"
                      guide={[
                        "5–8%: Tight (may fail in volatile conditions)",
                        "8–12%: Balanced (recommended)",
                        "15%+: Loose (higher execution, more slippage)",
                      ]}
                    />
                  )}

                  {/* ── PRIORITY FEE ── */}
                  {step === "priority" && (
                    <NumberInput
                      key="priority"
                      label="🚀 PRIORITY FEE"
                      value={config.priorityFee}
                      onChange={(v) => updateConfig("priorityFee", v)}
                      min={0.0001} max={0.1} step={0.0001} unit=" SOL"
                      description="Higher priority fee = faster transaction execution on Solana."
                      recommended="0.001–0.005 SOL"
                      guide={[
                        "0.0001: Low priority (slower, cheaper)",
                        "0.001: Standard (recommended)",
                        "0.005+: High priority (fastest, more expensive)",
                      ]}
                    />
                  )}

                  {/* ── TAKE PROFIT ── */}
                  {step === "takeProfit" && (
                    <NumberInput
                      key="takeProfit"
                      label="📈 TAKE PROFIT"
                      value={config.takeProfit}
                      onChange={(v) => updateConfig("takeProfit", v)}
                      min={10} max={10000} step={10} unit="%"
                      description="Auto-sell when your position reaches this profit target."
                      recommended="+50–200%"
                      guide={[
                        "50%: Conservative (quick profits)",
                        "100%: Balanced (2x target)",
                        "200%+: Aggressive (higher reward, higher risk)",
                      ]}
                    />
                  )}

                  {/* ── STOP LOSS ── */}
                  {step === "stopLoss" && (
                    <NumberInput
                      key="stopLoss"
                      label="📉 STOP LOSS"
                      value={config.stopLoss}
                      onChange={(v) => updateConfig("stopLoss", v)}
                      min={5} max={90} step={5} unit="%"
                      description="Auto-sell to limit losses when the price drops by this amount."
                      recommended="20–40%"
                      guide={[
                        "10–20%: Tight (exits quickly on dip)",
                        "20–40%: Balanced (recommended)",
                        "50%+: Loose (tolerates large swings)",
                      ]}
                    />
                  )}

                  {/* ── ANTI-RUG ── */}
                  {step === "antiRug" && (
                    <AntiRugPanel
                      key="antiRug"
                      enabled={config.antiRug}
                      onToggle={() => updateConfig("antiRug", !config.antiRug)}
                      onBack={() => setStep("main")}
                    />
                  )}

                </AnimatePresence>

                {/* Back button for setting screens */}
                {!["main", "status", "antiRug"].includes(step) && (
                  <button
                    onClick={() => setStep("main")}
                    className="mt-3 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-colors"
                  >
                    ⬅ Back to Sniper
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}