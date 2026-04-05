"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SendModal({ isOpen, onClose, balance = 0, userId }) {
  const [toAddress, setToAddress] = useState("");
  const [amount,    setAmount]    = useState("");
  const [status,    setStatus]    = useState("idle"); // idle | loading | success | error
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  function handleClose() {
    setToAddress("");
    setAmount("");
    setStatus("idle");
    setResult(null);
    setError(null);
    onClose();
  }

  async function handleSend() {
    setError(null);

    // Client-side validation
    if (!toAddress.trim()) { setError("Enter a destination address."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount."); return;
    }
    if (Number(amount) > balance) {
      setError(`Insufficient balance. You have ${balance.toFixed(4)} SOL.`); return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/wallet/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId,
          toAddress: toAddress.trim(),
          amountSOL: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Transaction failed");

      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const solBalance = typeof balance === "number" ? balance : parseFloat(balance) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-lg"
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
                <h3 className="text-base font-semibold">Send SOL</h3>
                <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors text-lg leading-none">✕</button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">

                {status === "success" ? (
                  /* ── Success state ── */
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl">✓</div>
                    <div>
                      <div className="text-white font-semibold text-lg">Transaction sent</div>
                      <div className="text-gray-400 text-sm mt-1">{amount} SOL → {toAddress.slice(0,6)}…{toAddress.slice(-4)}</div>
                    </div>
                    <a
                      href={result?.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                      View on Solscan ↗
                    </a>
                    <button onClick={handleClose} className="w-full mt-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">
                      Done
                    </button>
                  </div>
                ) : (
                  /* ── Form state ── */
                  <>
                    {/* Balance pill */}
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <span className="text-sm text-gray-400">Available</span>
                      <span className="text-white font-semibold text-sm">{solBalance.toFixed(4)} SOL</span>
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Destination address</label>
                      <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="Solana wallet address"
                        className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Amount (SOL)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.001"
                          className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 pr-16"
                        />
                        <button
                          onClick={() => setAmount(Math.max(0, solBalance - 0.000005).toFixed(6))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300 font-medium"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
                      <span className="text-yellow-400 text-sm leading-none mt-0.5">⚠</span>
                      <p className="text-xs text-yellow-200/80 leading-relaxed">
                        Transactions on Solana are irreversible. Double-check the address before sending.
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Send button */}
                    <button
                      onClick={handleSend}
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending…
                        </>
                      ) : (
                        "Send SOL"
                      )}
                    </button>
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