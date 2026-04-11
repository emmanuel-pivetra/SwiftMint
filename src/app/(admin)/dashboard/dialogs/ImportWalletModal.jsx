"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Sanitize and normalize whatever the user pastes
function normalizePrivateKey(raw) {
  const trimmed = raw.trim();

  // Handle JSON array format: [1,2,3,...,64]  (some wallet exports)
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (!Array.isArray(arr)) throw new Error("Not an array");

      // Convert byte array to base58 using browser-compatible method
      // We'll send it as a special marker so the server handles it
      return { format: "bytes", value: JSON.stringify(arr) };
    } catch {
      // Not valid JSON array — fall through to base58 check
    }
  }

  // Handle hex string (64 or 128 chars)
  if (/^[0-9a-fA-F]+$/.test(trimmed) && (trimmed.length === 64 || trimmed.length === 128)) {
    return { format: "hex", value: trimmed };
  }

  // Default — treat as base58
  return { format: "base58", value: trimmed };
}

export default function ImportWalletModal({ isOpen, onClose, onSuccess }) {
  const [tab,     setTab]     = useState("privateKey");
  const [value,   setValue]   = useState("");
  const [status,  setStatus]  = useState("idle");
  const [error,   setError]   = useState(null);
  const [address, setAddress] = useState(null);
  const [show,    setShow]    = useState(false);

  function reset() {
    setValue(""); setStatus("idle"); setError(null);
    setAddress(null); setShow(false);
  }

  function handleClose() { reset(); onClose(); }

  async function handleImport() {
    if (!value.trim()) {
      setError("Please enter your " + (tab === "privateKey" ? "private key" : "seed phrase"));
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      // Normalize the private key format before sending
      const payload = tab === "privateKey"
        ? (() => {
            const normalized = normalizePrivateKey(value);
            return { type: normalized.format === "base58" ? "privateKey" : `privateKey_${normalized.format}`, value: normalized.value };
          })()
        : { type: "seedPhrase", value: value.trim() };

      const res  = await fetch("/api/wallet/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("[ImportWallet] status:", res.status, data);

      if (!res.ok) throw new Error(data.error || "Import failed");

      setAddress(data.address);
      setStatus("success");
      onSuccess?.(data.address);
    } catch (err) {
      console.error("[ImportWallet] error:", err);
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-2xl bg-[#0f0f11] text-white shadow-2xl ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <div className="text-[10px] tracking-widest text-purple-400 mb-0.5">SOLANA</div>
                  <h2 className="text-base font-semibold">Import Wallet</h2>
                </div>
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-lg">✕</button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">

                {status === "success" ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl">✓</div>
                    <div>
                      <p className="text-white font-semibold text-lg">Wallet imported</p>
                      <p className="text-gray-400 text-sm mt-1 font-mono">
                        {address?.slice(0, 8)}…{address?.slice(-6)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                      Your wallet has been imported. Your previous wallet has been replaced.
                    </p>
                    <button onClick={handleClose} className="w-full mt-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Warning */}
                    <div className="flex gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">⚠</span>
                      <p className="text-xs text-red-300/80 leading-relaxed">
                        Never share your private key or seed phrase with anyone. SwiftMint staff will never ask for these.
                      </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex rounded-xl bg-white/5 p-1 gap-1">
                      {[
                        { id: "privateKey", label: "Private Key" },
                        { id: "seedPhrase", label: "Seed Phrase" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTab(t.id); setValue(""); setError(null); }}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            tab === t.id ? "bg-[#1a1a1e] text-white" : "text-white/50 hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Input */}
                    {tab === "privateKey" ? (
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Private key</label>
                        <div className="relative">
                          <input
                            type={show ? "text" : "password"}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Base58, hex, or byte array [1,2,3...]"
                            className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                          >
                            {show ? "Hide" : "Show"}
                          </button>
                        </div>
                        {/* Format guide */}
                        <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-gray-500 space-y-1">
                          <div><span className="text-gray-400">Phantom:</span> Settings → Security → Export Private Key</div>
                          <div><span className="text-gray-400">Accepts:</span> Base58 string, hex string, or byte array</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">12 or 24 word seed phrase</label>
                        <textarea
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="word1 word2 word3 ... word12"
                          rows={3}
                          className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono resize-none"
                        />
                        <p className="text-xs text-gray-600 mt-1.5">
                          Enter all words separated by spaces in the correct order.
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 break-words">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleImport}
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Importing…
                        </>
                      ) : "Import Wallet"}
                    </button>

                    <p className="text-xs text-gray-600 text-center">
                      This will replace your current SwiftMint wallet.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}