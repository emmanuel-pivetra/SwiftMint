"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet, SUPPORTED_CHAINS } from "../components/hooks/useWallet";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { WalletButton } from "./wallet/WalletButton";

const CHAIN_ICONS = {
  1:     "⟠",
  137:   "⬡",
  42161: "◆",
  10:    "○",
  8453:  "▲",
  56:    "◈",
};

function FundAccountModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">Fund Your Trading Account</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            You need to deposit funds into your trading account before you can access this feature.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-semibold text-sm">
            Fund Account
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 text-sm">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

function NetworkSwitcher({ currentChain, switchChain, isSwitchingChain }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-3">
      <div className="text-xs text-gray-500 mb-1">Network</div>

      {/* Current chain button */}
      <button
        onClick={() => setOpen((s) => !s)}
        disabled={isSwitchingChain}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/10 transition-colors text-sm text-white disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <span>{CHAIN_ICONS[currentChain?.id] ?? "🔗"}</span>
          <span>{isSwitchingChain ? "Switching…" : (currentChain?.name ?? "Unknown")}</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-white/10 rounded-lg overflow-hidden shadow-xl">
          {SUPPORTED_CHAINS.map((chain) => {
            const isActive = chain.id === currentChain?.id;
            return (
              <button
                key={chain.id}
                onClick={() => { switchChain(chain.id); setOpen(false); }}
                disabled={isActive || isSwitchingChain}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                  ${isActive
                    ? "bg-white/5 text-white cursor-default"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span>{CHAIN_ICONS[chain.id] ?? "🔗"}</span>
                <span className="flex-1 text-left">{chain.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SidebarClient() {
  const pathname = usePathname();
  const router   = useRouter();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const {
    isConnected,
    shortAddress,
    formattedBalance,
    currentChain,
    isSwitchingChain,
    disconnect,
    switchChain,
  } = useWallet();

  const [showFundModal, setShowFundModal] = useState(false);

  function handleNavClick(e) {
    e.preventDefault();
    setShowFundModal(true);
  }

  function handleDisconnect() {
    disconnect();
    router.push("/");
  }

  return (
    <>
      {showFundModal && <FundAccountModal onClose={() => setShowFundModal(false)} />}

      <nav className="flex flex-col h-full gap-3 w-full">

        {/* Wallet summary */}
        <div className="mb-4 rounded-md text-sm">
          {isConnected && shortAddress ? (
            <>
              <div className="text-xs text-gray-500">Wallet</div>
              <div className="mt-1 font-medium break-all text-white">{shortAddress}</div>

              <div className="mt-3">
                <div className="text-xs text-gray-500">Balance</div>
                <div className="text-lg font-semibold text-white">
                  {formattedBalance ?? "—"}
                </div>
              </div>

              {/* Network switcher */}
              <NetworkSwitcher
                currentChain={currentChain}
                switchChain={switchChain}
                isSwitchingChain={isSwitchingChain}
              />

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 text-xs"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Disconnect
              </button>
            </>
          ) : (
            <h3>Connect</h3>
            // <WalletButton />
          )}
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-3 h-full">
          {navConfig.map((item) => (
            <div key={item.href} onClick={handleNavClick} className="cursor-pointer">
              <NavItem
                href=""
                text={item.text}
                icon={item.icon}
                active={isActive(item.href)}
              />
            </div>
          ))}
        </div>

      </nav>
    </>
  );
}