"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "../lib/superbase";

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  const supabase = createClient();

  const [tab,      setTab]      = useState(defaultTab); // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [status,   setStatus]   = useState("idle"); // idle | loading | success | error
  const [message,  setMessage]  = useState("");

  function reset() {
    setEmail(""); setPassword(""); setName("");
    setStatus("idle"); setMessage("");
  }

  function handleClose() { reset(); onClose(); }

  function switchTab(t) { reset(); setTab(t); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setStatus("success");
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Refresh page so server components pick up the new session
        window.location.reload();
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  }

  async function handleGoogle() {
    setStatus("loading");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setStatus("error"); setMessage(error.message); }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-2xl bg-[#0f0f11] text-white shadow-2xl ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <div className="text-[10px] tracking-widest text-blue-400 font-medium mb-0.5">
                    SWIFTMINT
                  </div>
                  <h2 className="text-base font-semibold">
                    {tab === "login" ? "Log in to your account" : "Create your account"}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                >✕</button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">

                {/* Tab switcher */}
                <div className="flex rounded-xl bg-white/5 p-1 gap-1">
                  {["login", "signup"].map((t) => (
                    <button
                      key={t}
                      onClick={() => switchTab(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        tab === t ? "bg-[#1a1a1e] text-white" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {t === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                {/* Success state */}
                {status === "success" ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-xl">✓</div>
                    <p className="text-white font-medium">Almost there!</p>
                    <p className="text-gray-400 text-sm">{message}</p>
                    <button onClick={handleClose} className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline">
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    {/* Name — signup only */}
                    {tab === "signup" && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Full name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Smith"
                          required
                          className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-gray-400">Password</label>
                        {tab === "login" && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!email) { setMessage("Enter your email first."); setStatus("error"); return; }
                              await supabase.auth.resetPasswordForEmail(email, {
                                redirectTo: `${window.location.origin}/auth/reset`,
                              });
                              setMessage("Password reset email sent.");
                              setStatus("success");
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={tab === "signup" ? "Min. 8 characters" : "••••••••"}
                        required
                        minLength={tab === "signup" ? 8 : undefined}
                        className="w-full rounded-xl bg-[#0b0b0c] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    {/* Error message */}
                    {status === "error" && message && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                        {message}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          {tab === "login" ? "Logging in…" : "Creating account…"}
                        </>
                      ) : tab === "login" ? "Log in" : "Create account"}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-gray-600">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google OAuth */}
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white text-sm font-medium flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    {/* Terms — signup only */}
                    {tab === "signup" && (
                      <p className="text-xs text-gray-600 text-center leading-relaxed">
                        By signing up you agree to our{" "}
                        <a href="/terms" className="text-blue-400 hover:underline">Terms</a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}