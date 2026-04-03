"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletButton } from "./wallet/WalletButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="w-full h-16">
      <div className="fixed top-0 left-0 w-full z-50 bg-[#0B1019] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">

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

          {/* Actions + Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <WalletButton />
            </div>

            {/* Hamburger — mobile only */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setOpen((s) => !s)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="sidebar"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-[70%] max-w-xs bg-[#0B1019] border-l border-white/10 shadow-xl md:hidden"
            >
              {/* Close button */}
              <div className="flex items-center justify-end px-4 py-4 border-b border-white/10">
                <button
                  aria-label="Close sidebar"
                  className="p-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Mobile links */}
              <nav className="p-6 flex flex-col gap-6">
                <ul className="flex flex-col gap-5 text-gray-300 text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Discover</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pulse</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Tracker</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>

                <WalletButton />

                <p className="text-xs text-gray-600 mt-auto">
                  © {new Date().getFullYear()} SwiftMint
                </p>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}