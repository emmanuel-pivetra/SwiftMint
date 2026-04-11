"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";
import { useUser } from "./hooks/useUser";

export default function Navbar() {
  const [open,      setOpen]      = useState(false);   // mobile drawer
  const [authOpen,  setAuthOpen]  = useState(false);   // auth modal
  const [authTab,   setAuthTab]   = useState("login"); // "login" | "signup"
  const [menuOpen,  setMenuOpen]  = useState(false);   // user dropdown

  const { user, loading, signOut, initials } = useUser();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menuOpen]);

  function openAuth(tab) {
    setAuthTab(tab);
    setOpen(false); // close mobile drawer if open
    setAuthOpen(true);
  }

  return (
    <>
      <header className="w-full h-16">
        <div className="fixed top-0 left-0 w-full z-50 bg-[#0B1019] border-b border-white/10">
          <div className="px-6 md:px-12 max-w-7xl mx-auto flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">SwiftMint</h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              <ul className="flex gap-6 text-sm text-gray-300">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Discover</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pulse</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tracker</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">

              {!loading && (
                <>
                  {user ? (
                    /* ── Logged in — show avatar + dropdown ── */
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuOpen((s) => !s)}
                        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors"
                      >
                        {/* Avatar circle */}
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {initials}
                        </div>
                        <span className="hidden sm:block text-sm text-gray-300 max-w-[120px] truncate">
                          {user.user_metadata?.full_name || user.email}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}>
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {menuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0f0f11] border border-white/10 shadow-2xl overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-white/10">
                              <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            </div>
                            <a href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
                              Dashboard
                            </a>
                            <div className="border-t border-white/10">
                              <button
                                onClick={signOut}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Sign out
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* ── Logged out — show Login + Sign up ── */
                    <div className="hidden md:flex items-center gap-2">
                      <button
                        onClick={() => openAuth("login")}
                        className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => openAuth("signup")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Hamburger — mobile only */}
              <button
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="md:hidden p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setOpen((s) => !s)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d={open ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"}
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              key="sidebar"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-[70%] max-w-xs bg-[#0B1019] border-l border-white/10 shadow-xl md:hidden"
            >
              <div className="flex items-center justify-end px-4 py-4 border-b border-white/10">
                <button
                  aria-label="Close sidebar"
                  className="p-2 text-white rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <nav className="p-6 flex flex-col gap-6">
                <ul className="flex flex-col gap-5 text-gray-300 text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Discover</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pulse</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Tracker</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>

                {/* Auth buttons in mobile drawer */}
                {!loading && !user && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openAuth("login")}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => openAuth("signup")}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                    >
                      Sign up
                    </button>
                  </div>
                )}

                {!loading && user && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {initials}
                      </div>
                      <div className="text-sm text-gray-300 truncate">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                    </div>
                    <a href="/dashboard" className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 text-center hover:bg-white/5 transition-colors">
                      Dashboard
                    </a>
                    <button
                      onClick={signOut}
                      className="w-full py-2.5 rounded-xl border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-auto">
                  © {new Date().getFullYear()} SwiftMint
                </p>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}