"use client";

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Sidebar from "../../components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [activeNetIndex, setActiveNetIndex] = useState(0); // 0 = Solana

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Header ── */}
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-white/10 bg-gray-900 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <Sidebar
              activeNetIndex={activeNetIndex}
              onNetworkChange={setActiveNetIndex}
            />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="sidebar-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setSidebarOpen(false)}
              />

              <motion.aside
                key="sidebar-drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 border-r border-white/10 flex flex-col md:hidden"
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                  <span className="text-white font-semibold text-sm">Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
                  >✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <Sidebar
                    activeNetIndex={activeNetIndex}
                    onNetworkChange={(i) => {
                      setActiveNetIndex(i);
                      setSidebarOpen(false);
                    }}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard activeNetIndex={activeNetIndex} />
        </main>
      </div>
    </div>
  );
}