"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NavItem } from "./nav/NavItem";
import { navConfig } from "./nav/navConfig";
import { WalletButton } from "./wallet/WalletButton";

export default function SidebarClient() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch balance once and then subscribe to account changes for real-time updates
  useEffect(() => {
    if (!publicKey) {
      setSolBalance(null);
      return;
    }

    let mounted = true;
    let subId = null;

    async function fetchBalance() {
      setLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey, "confirmed");
        if (!mounted) return;
        setSolBalance(lamports / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("fetchBalance error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBalance();
    console.log(fetchBalance());

    try {
      // Subscribe to account changes so balance updates immediately
      subId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          if (!mounted) return;
          // accountInfo.lamports is the current lamports balance
          if (accountInfo?.lamports != null) {
            setSolBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
          }
        },
        "confirmed"
      );
    } catch (err) {
      // some providers/nodes may not support onAccountChange in all contexts — fallback to polling
      console.warn("onAccountChange not available, falling back to polling", err);
      const poll = setInterval(fetchBalance, 10_000);
      subId = { pollInterval: poll };
    }

    return () => {
      mounted = false;
      // cleanup subscription or polling
      if (subId && typeof subId === "number") {
        connection.removeAccountChangeListener(subId).catch(() => {});
      } else if (subId && subId.pollInterval) {
        clearInterval(subId.pollInterval);
      }
    };
  }, [publicKey?.toBase58?.(), connection]);

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <nav className="flex flex-col h-full gap-3 w-full">
          {/* Wallet summary — assumes wallet is connected already */}
          <div className="mb-4 rounded-md text-sm">
               {connected && publicKey ? (
                    <>
                    <div className="text-xs text-gray-500">Wallet</div>
                    <div className="mt-1 font-medium break-all">{shortKey}</div>

                    <div className="mt-3">
                    <div className="text-xs text-gray-500">SOL balance</div>
                    <div className="text-lg font-semibold">
                         {loading ? "…" : solBalance != null ? `${solBalance.toFixed(4)} SOL` : "—"}
                    </div>
                    </div>
                    </>
               ) : (
                <WalletButton/>
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