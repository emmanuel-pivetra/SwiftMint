import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, bsc } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet, metaMask } from 'wagmi/connectors'

// Get your WalletConnect Project ID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local')
}

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Trading App',
        url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
      },
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Trading App',
        description: 'Professional crypto trading platform',
        url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
        icons: ['/logo.png'],
      },
    }),
    coinbaseWallet({
      appName: 'Trading App',
      appLogoUrl: '/logo.png',
    }),
    injected(), // catches Brave Wallet, Trust Wallet, Phantom EVM, etc.
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
})