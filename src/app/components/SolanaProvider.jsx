// // components/SolanaProvider.jsx
// 'use client'

// import { useMemo } from 'react'
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
// import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets'

// const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

// export function SolanaProvider({ children }) {
//   const wallets = useMemo(() => [
//     new PhantomWalletAdapter(),
//     new SolflareWalletAdapter(),
//     new BackpackWalletAdapter(),
//   ], [])

//   return (
//     <ConnectionProvider endpoint={SOLANA_RPC}>
//       <WalletProvider wallets={wallets} autoConnect>
//         {children}
//       </WalletProvider>
//     </ConnectionProvider>
//   )
// }