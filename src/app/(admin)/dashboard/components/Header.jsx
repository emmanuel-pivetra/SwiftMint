"use client";
import Image from "next/image";
import SwiftMint from "../../../../../public/images/swiftmint.jpeg";
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
          <Image
            src={SwiftMint}
            alt="Trading platform on multiple devices"
            width={24}
            height={24}
            className="relative w-full rounded-2xl shadow-2xl object-cover"
            priority
          />
          <span className="text-white font-bold text-base">SwiftMint</span>
        </div>
      </div>
    </header>
  );
}