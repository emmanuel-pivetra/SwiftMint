"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import WalletConnect from "../../components/WalletConnect";

export function AddLoginForm({ isOpen = false, onClose = () => {} }) {
     const router = useRouter();
     const emailRef = useRef(null);


  // Focus + Escape handling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    // focus email input shortly after opening (wait for animation/DOM)
    const focusTimer = setTimeout(() => emailRef.current?.focus(), 80);

    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Submit handler — call onClose after success/placeholder
  function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email) return alert("Please enter an email.");
    if (!password) return alert("Please enter a password.");
    // Replace with real auth integration
    console.log("Logging in with:", { email, password });
    onClose();
  }

    async function handleGoogleLogin() {
     try {
          console.log("handleGoogleLogin called");

          onClose();
          router.push("/dashboard"); // navigates client-side
     } catch (err) {
          console.error("Google login error:", err);
          alert("Google login failed — check console for details.");
     }
     }

  async function handlePhantomConnect() {
    console.log("handlePhantomConnect called");
    // implement wallet connect here
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* overlay */}
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose} // clicking outside inner card should close
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()} // prevent overlay click when interacting inside
            >
              <div className="flex items-center justify-between mb-4">
                <h2 id="login-title" className="text-lg font-semibold">Log in to SwiftMint</h2>
                <button
                  aria-label="Close login modal"
                  className="p-2 rounded-md text-gray-500 hover:text-gray-800 focus:outline-none"
                  onClick={onClose}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
                <label className="text-sm">
                  <span className="block text-xs text-gray-600">Email</span>
                  <input
                    ref={emailRef}
                    name="email"
                    type="email"
                    className="mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-[#FF553E] outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="block text-xs text-gray-600">Password</span>
                  <input
                    name="password"
                    type="password"
                    className="mt-1 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-[#FF553E] outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </label>

                <button type="submit" className="mt-2 w-full px-4 py-2 rounded-lg bg-[#FF553E] text-white text-sm">
                  Login
                </button>
              </form>

              <div className="my-4 border-t pt-4 flex flex-col gap-3">
                    <button onClick={handleGoogleLogin} className="w-full px-4 py-2 rounded-md border text-sm">
                    Login with Google
                    </button>

                    <WalletConnect/>    
               </div>

              <div className="text-xs text-gray-500">
                By continuing you agree to our <a href="#" className="underline">Terms</a> and{" "}
                <a href="#" className="underline">Privacy Policy</a>.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}