"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddLoginForm } from "../dialogs/LoginForm/AddLoginForm";

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile sidebar
  const [showLogin, setShowLogin] = useState(false); // controlled modal from Navbar

  // Manage body scroll when either sidebar OR modal is open
  useEffect(() => {
    if (open || showLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, showLogin]);

  // helper: open modal and close mobile sidebar if open
  function openLoginFromMobile() {
    setOpen(false);
    setShowLogin(true);
  }

  return (
    <header className="flex justify-center h-16">
      <div className="w-full sm:max-w-xl md:max-w-4xl border fixed bg-[#0B1019] top-0 mx-auto z-50 px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">SwiftMint</h1>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <ul className="flex gap-4 text-sm">
              <a href="#"><li className="hover:text-blue-600">Discover</li></a>
              <a href="#"><li className="hover:text-blue-600">Pulse</li></a>
              <a href="#"><li className="hover:text-blue-600">Tracker</li></a>
              <a href="#"><li className="hover:text-blue-600">Contact</li></a>
            </ul>
          </nav>

          {/* Actions + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-3">
              <button
                className="px-3 py-1 text-sm rounded-md text-[#FF553E]"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
              <button className="px-3 py-2 text-sm rounded-lg bg-[#FF553E] text-white">
                Sign up
              </button>
            </div>

            {/* Hamburger for mobile */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden p-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF553E]"
              onClick={() => setOpen((s) => !s)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={open ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              key="sidebar"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-[60%] max-w-[90%] bg-[#FFF8F2] shadow-lg md:hidden"
            >
              <div className="flex items-center justify-end px-4 py-3">
                <button
                  aria-label="Close sidebar"
                  className="p-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF553E]"
                  onClick={() => setOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <nav className="p-4">
                <ul className="flex text-gray-900 text-sm flex-col gap-4">
                  <a href="#"><li className="text-lg">Demos</li></a>
                  <a href="#"><li className="text-lg">Features</li></a>
                  <a href="#"><li className="text-lg">Pricing</li></a>
                  <a href="#"><li className="text-lg">Contact</li></a>
                </ul>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    className="w-full px-4 py-2 text-sm text-gray-900 rounded-md border border-[#FF553E]"
                    onClick={openLoginFromMobile}
                  >
                    Login
                  </button>
                  <button className="w-full px-4 py-2 text-sm rounded-md bg-[#FF553E] text-white">SignUp</button>
                </div>

                <div className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} Saasto</div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AddLoginForm isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}