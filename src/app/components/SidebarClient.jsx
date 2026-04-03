"use client";

import { usePathname } from "next/navigation";
import { useWallet } from "../components/hooks/useWallet";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { WalletButton } from "./wallet/WalletButton";

export default function SidebarClient() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const { isConnected, shortAddress, formattedBalance, currentChain } = useWallet();

  return (
    <nav className="flex flex-col h-full gap-3 w-full">

      {/* Wallet summary */}
      <div className="mb-4 rounded-md text-sm">
        {isConnected && shortAddress ? (
          <>
            <div className="text-xs text-gray-500">Wallet</div>
            <div className="mt-1 font-medium break-all">{shortAddress}</div>

            <div className="mt-3">
              <div className="text-xs text-gray-500">Balance</div>
              <div className="text-lg font-semibold">
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
          <NavItem
            key={item.href}
            href={item.href}
            text={item.text}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </div>

    </nav>
  );
}