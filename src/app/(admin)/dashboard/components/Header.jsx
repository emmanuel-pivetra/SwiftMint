"use client";

// Pass onToggleSidebar from DashboardPage to show the hamburger on mobile
export default function Header({ chain, onOpenDeposit, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-14 max-w-screen-2xl mx-auto">

        {/* Left — hamburger (mobile only) + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-white font-bold text-base">SwiftMint</span>
        </div>

        {/* Right — chain badge + deposit button */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {chain}
          </span>
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-white text-xs font-semibold"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Deposit
          </button>
        </div>
      </div>
    </header>
  );
}