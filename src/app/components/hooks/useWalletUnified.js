// hooks/useWalletUnified.js
'use client'

import { useWallet as useEVMWallet } from './useWallet'           // your existing hook
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function useWalletUnified() {
  const evm = useEVMWallet()

  const { publicKey, connected, disconnect: solDisconnect, wallet } = useSolanaWallet()
  const { connection } = useConnection()
  const [solBalance, setSolBalance] = useState(null)

  useEffect(() => {
    if (!publicKey) { setSolBalance(null); return }
    connection.getBalance(publicKey).then((lamports) => {
      setSolBalance(lamports / LAMPORTS_PER_SOL)
    }).catch(() => setSolBalance(null))
  }, [publicKey, connection])

  // Whichever is connected wins — EVM takes priority if both somehow connected
  const activeChain = evm.isConnected ? 'evm' : connected ? 'solana' : null

  return {
    activeChain,

    // EVM
    evmAddress:     evm.address,
    evmShortAddress: evm.shortAddress,
    evmBalance:     evm.formattedBalance,
    evmChain:       evm.currentChain,
    evmConnected:   evm.isConnected,
    evmConnect:     evm.connect,
    evmDisconnect:  evm.disconnect,
    evmSwitchChain: evm.switchChain,
    evmConnectors:  evm.connectors,

    // Solana
    solAddress:     publicKey?.toBase58() ?? null,
    solShortAddress: publicKey
      ? `${publicKey.toBase58().slice(0,6)}…${publicKey.toBase58().slice(-4)}`
      : null,
    solBalance:     solBalance != null ? `${solBalance.toFixed(4)} SOL` : null,
    solConnected:   connected,
    solDisconnect,
    solWallet:      wallet,
  }
}