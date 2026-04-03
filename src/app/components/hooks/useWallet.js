'use client'

import { useCallback } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
  useChainId,
} from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, bsc } from 'wagmi/chains'

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, optimism, base, bsc]

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting, connector } = useAccount()
  const { connect, connectors, isPending: isConnectPending, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  })

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)

  const handleConnect = useCallback(
    (connectorId) => {
      const target = connectors.find((c) => c.id === connectorId)
      if (target) connect({ connector: target })
    },
    [connect, connectors]
  )

  const handleDisconnect = useCallback(() => {
    disconnect()
  }, [disconnect])

  const handleSwitchChain = useCallback(
    (newChainId) => {
      switchChain({ chainId: newChainId })
    },
    [switchChain]
  )

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : null

  return {
    // State
    address,
    shortAddress,
    isConnected,
    isConnecting: isConnecting || isReconnecting || isConnectPending,
    isSwitchingChain,
    connector,
    connectors,
    currentChain,
    balance,
    formattedBalance,
    connectError,

    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
  }
}