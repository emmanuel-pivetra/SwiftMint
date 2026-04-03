'use client'

import { useState } from 'react';
import { WalletModal } from './WalletModal';
import { useWallet } from '../../components/hooks/useWallet';

export function WalletButton({ label = 'Connect Wallet', className = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnected, shortAddress, formattedBalance, currentChain } = useWallet()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Syne:wght@600;700&display=swap');

        @keyframes walletPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(0, 255, 157, 0); }
        }

        .wallet-connect-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #00ff9d 0%, #00cc7a 100%);
          color: #001a0f; border: none; border-radius: 8px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
        }
        .wallet-connect-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.35);
        }
        .wallet-connect-btn:active { transform: translateY(0); }

        .wallet-connected-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 14px; background: #080c12; color: #c8d8e8;
          border: 1px solid #1a2433; border-radius: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .wallet-connected-btn:hover { border-color: #00ff9d44; background: #0d1117; }

        .wallet-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #00ff9d; animation: walletPulse 2s ease infinite; flex-shrink: 0;
        }

        .wallet-divider { width: 1px; height: 16px; background: #1a2433; }
      `}</style>

      {isConnected ? (
        <button
          className={`wallet-connected-btn ${className}`}
          onClick={() => setIsModalOpen(true)}
          title="Manage wallet"
        >
          <span className="wallet-dot" />
          <span>{shortAddress}</span>
          {formattedBalance && (
            <>
              <span className="wallet-divider" />
              <span style={{ color: '#00ff9d' }}>{formattedBalance}</span>
            </>
          )}
          {currentChain && (
            <>
              <span className="wallet-divider" />
              <span style={{ color: '#556677', fontSize: '11px' }}>{currentChain.name}</span>
            </>
          )}
        </button>
      ) : (
        <button
          className={`wallet-connect-btn ${className}`}
          onClick={() => setIsModalOpen(true)}
        >
          🔗 {label}
        </button>
      )}

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}