'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, SUPPORTED_CHAINS } from '../../components/hooks/useWallet';

const WALLET_META = {
  metaMask: {
    icon: '🦊',
    label: 'MetaMask',
    description: 'Browser extension & mobile',
  },
  walletConnect: {
    icon: '🔗',
    label: 'WalletConnect',
    description: 'Scan QR with any wallet',
  },
  coinbaseWallet: {
    icon: '🔵',
    label: 'Coinbase Wallet',
    description: 'Coinbase mobile & extension',
  },
  injected: {
    icon: '💼',
    label: 'Browser Wallet',
    description: 'Brave, Trust, or other wallet',
  },
}

function getWalletMeta(connector) {
  return (
    WALLET_META[connector.id] ?? {
      icon: '🔐',
      label: connector.name,
      description: 'Connect wallet',
    }
  )
}

const CHAIN_ICONS = {
  1: '⟠',
  137: '⬡',
  42161: '◆',
  10: '🔴',
  8453: '🔵',
  56: '⬡',
}

export function WalletModal({ isOpen, onClose }) {
  const {
    address,
    shortAddress,
    isConnected,
    isConnecting,
    connector,
    connectors,
    currentChain,
    formattedBalance,
    connectError,
    connect,
    disconnect,
    switchChain,
  } = useWallet()

  const [view, setView] = useState('select')
  const [connectingId, setConnectingId] = useState(null)
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isConnected) setView('connected')
    else if (!isConnecting) setView('select')
  }, [isConnected, isConnecting])

  useEffect(() => {
    if (isOpen && !isConnected) setView('select')
  }, [isOpen, isConnected])

  const handleConnect = (connectorId) => {
    setConnectingId(connectorId)
    setView('connecting')
    connect(connectorId)
  }

  const handleDisconnect = () => {
    disconnect()
    setView('select')
    onClose()
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!isOpen) return null

  const connectingMeta = connectingId
    ? getWalletMeta({ id: connectingId })
    : null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        .wallet-modal { animation: slideUp 0.2s ease; }
        .wallet-btn {
          background: #0d1117; border: 1px solid #1e2832; border-radius: 10px;
          padding: 14px 16px; cursor: pointer; display: flex; align-items: center;
          gap: 14px; width: 100%; transition: all 0.15s ease; color: inherit;
        }
        .wallet-btn:hover { background: #111923; border-color: #00ff9d33; transform: translateX(3px); }
        .wallet-btn:active { transform: translateX(1px); }
        .chain-btn {
          background: #0d1117; border: 1px solid #1e2832; border-radius: 8px;
          padding: 10px 12px; cursor: pointer; display: flex; align-items: center;
          gap: 8px; transition: all 0.15s ease; color: inherit; font-size: 13px;
        }
        .chain-btn:hover { border-color: #00ff9d44; background: #111923; }
        .chain-btn.active { border-color: #00ff9d; background: #00ff9d11; }
        .action-btn {
          background: transparent; border: 1px solid #1e2832; border-radius: 8px;
          padding: 8px 14px; cursor: pointer; color: #8899aa; font-size: 12px;
          font-family: 'IBM Plex Mono', monospace; transition: all 0.15s ease;
        }
        .action-btn:hover { border-color: #334455; color: #aabbcc; }
        .disconnect-btn {
          background: transparent; border: 1px solid #ff444422; border-radius: 8px;
          padding: 10px 20px; cursor: pointer; color: #ff6666; font-size: 13px;
          font-family: 'IBM Plex Mono', monospace; width: 100%; transition: all 0.15s ease;
        }
        .disconnect-btn:hover { background: #ff444411; border-color: #ff444444; }
        .spinner {
          width: 32px; height: 32px; border: 2px solid #1e2832;
          border-top-color: #00ff9d; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        .status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #00ff9d; animation: pulse 2s ease infinite;
        }
      `}</style>

      <div
        className="wallet-modal"
        style={{
          background: '#080c12',
          border: '1px solid #1a2433',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          margin: '16px',
          overflow: 'hidden',
          fontFamily: "'Syne', sans-serif",
          color: '#c8d8e8',
          boxShadow: '0 0 0 1px #00ff9d11, 0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #0f1a26',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#00ff9d', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '4px' }}>
              TRADING APP
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e8f0f8' }}>
              {view === 'select' && 'Connect Wallet'}
              {view === 'connecting' && 'Connecting…'}
              {view === 'connected' && 'Wallet'}
              {view === 'network' && 'Switch Network'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#556677',
              fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px',
              borderRadius: '4px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#aabbcc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#556677')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>

          {/* SELECT WALLET */}
          {view === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#556677', marginBottom: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
                SELECT PROVIDER
              </div>
              {connectors.map((c) => {
                const meta = getWalletMeta(c)
                return (
                  <button key={c.id} className="wallet-btn" onClick={() => handleConnect(c.id)}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{meta.icon}</span>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e0eaf4' }}>{meta.label}</div>
                      <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {meta.description}
                      </div>
                    </div>
                    <span style={{ color: '#334455', fontSize: '16px' }}>›</span>
                  </button>
                )
              })}
              {connectError && (
                <div style={{
                  background: '#ff444411', border: '1px solid #ff444433',
                  borderRadius: '8px', padding: '10px 14px', fontSize: '12px',
                  color: '#ff8888', fontFamily: "'IBM Plex Mono', monospace", marginTop: '4px',
                }}>
                  ⚠ {connectError.message}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#334455', textAlign: 'center', marginTop: '8px', fontFamily: "'IBM Plex Mono', monospace" }}>
                By connecting you agree to our Terms of Service
              </div>
            </div>
          )}

          {/* CONNECTING */}
          {view === 'connecting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
              <div style={{ fontSize: '48px' }}>{connectingMeta?.icon}</div>
              <div className="spinner" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#e0eaf4', marginBottom: '6px' }}>
                  Opening {connectingMeta?.label}
                </div>
                <div style={{ fontSize: '12px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Confirm the connection in your wallet
                </div>
              </div>
              <button className="action-btn" onClick={() => setView('select')}>← Back</button>
            </div>
          )}

          {/* CONNECTED */}
          {view === 'connected' && address && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div className="status-dot" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '2px' }}>
                    CONNECTED VIA {connector?.name?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', fontFamily: "'IBM Plex Mono', monospace", color: '#e0eaf4', fontWeight: 500 }}>
                    {shortAddress}
                  </div>
                </div>
                <button className="action-btn" onClick={handleCopyAddress}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {formattedBalance && (
                <div style={{
                  background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                  padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace" }}>BALANCE</span>
                  <span style={{ fontSize: '14px', color: '#00ff9d', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>
                    {formattedBalance}
                  </span>
                </div>
              )}

              <div style={{
                background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '2px' }}>NETWORK</div>
                  <div style={{ fontSize: '13px', color: '#e0eaf4', fontWeight: 600 }}>
                    {CHAIN_ICONS[currentChain?.id ?? 1]} {currentChain?.name ?? 'Unknown'}
                  </div>
                </div>
                <button className="action-btn" onClick={() => setView('network')}>Switch</button>
              </div>

              <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect Wallet</button>
            </div>
          )}

          {/* NETWORK SWITCH */}
          {view === 'network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#556677', marginBottom: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
                SELECT NETWORK
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    className={`chain-btn${chain.id === currentChain?.id ? ' active' : ''}`}
                    onClick={() => { switchChain(chain.id); setView('connected') }}
                  >
                    <span>{CHAIN_ICONS[chain.id] ?? '🔗'}</span>
                    <span style={{ fontWeight: 600, color: chain.id === currentChain?.id ? '#00ff9d' : '#c8d8e8' }}>
                      {chain.name}
                    </span>
                  </button>
                ))}
              </div>
              <button className="action-btn" style={{ marginTop: '6px' }} onClick={() => setView('connected')}>
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}