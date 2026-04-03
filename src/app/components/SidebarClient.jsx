"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useWallet } from "../components/hooks/useWallet";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { WalletButton } from "./wallet/WalletButton";

function FundAccountModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">Fund Your Trading Account</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            You need to deposit funds into your trading account before you can access this feature.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-semibold text-sm"
          >
            Fund Account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 text-sm"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SidebarClient() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const { isConnected, shortAddress, formattedBalance, currentChain } = useWallet();
  const [showFundModal, setShowFundModal] = useState(false);

  function handleNavClick(e) {
    e.preventDefault();
    setShowFundModal(true);
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

              {currentChain && (
                <div className="mt-2 text-xs text-gray-500">
                  {currentChain.name}
                </div>
              )}
            </>
          ) : (
            <WalletButton />
          )}
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-3 h-full">
          {navConfig.map((item) => (
            <div key={item.href} onClick={handleNavClick} className="cursor-pointer">
              <NavItem
                href={''}
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