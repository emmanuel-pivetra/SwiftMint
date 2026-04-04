"use client";

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import DepositModal from "./dialogs/DepositModal";
import Header from "./components/Header";
import Sidebar from "../../components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const [depositOpen,   setDepositOpen]   = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [chain,         setChain]         = useState("Solana");
  const [depositAddress] = useState("8oXsvS3Ggyrb2z37bNyordBkxXbEdGWLeBEeo2VwwJEwf");
  const [balance]        = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Header ── */}
      <Header
        chain={chain}
        onOpenDeposit={() => setDepositOpen(true)}
        // Pass hamburger toggle so Header can render the button
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-white/10 bg-gray-900 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                key="sidebar-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setSidebarOpen(false)}
              />

              {/* Drawer */}
              <motion.aside
                key="sidebar-drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 border-r border-white/10 flex flex-col md:hidden"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                  <span className="text-white font-semibold text-sm">Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Sidebar content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <Sidebar onNavigate={() => setSidebarOpen(false)} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>

      {/* Deposit modal */}
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        chain={chain}
        address={depositAddress}
        balance={balance}
      />
    </div>
  );
}