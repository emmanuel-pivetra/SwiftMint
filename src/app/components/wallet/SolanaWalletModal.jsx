'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const SOLANA_WALLETS = [
  { id: 'phantom',   icon: '👻', label: 'Phantom',   description: 'Browser extension & mobile' },
  { id: 'solflare',  icon: '🌟', label: 'Solflare',  description: 'Browser extension & mobile' },
  { id: 'backpack',  icon: '🎒', label: 'Backpack',   description: 'Browser extension' },
  { id: 'coinbase',  icon: '🔵', label: 'Coinbase',   description: 'Coinbase Wallet mobile' },
]

function getWalletMeta(name = '') {
  const lower = name.toLowerCase()
  return (
    SOLANA_WALLETS.find((w) => lower.includes(w.id)) ?? {
      icon: '🔐', label: name || 'Unknown Wallet', description: 'Connect wallet',
    }
  )
}

export function SolanaWalletModal({ isOpen, onClose }) {
  const {
    wallets,
    select,
    connect,
    disconnect,
    connected,
    connecting,
    publicKey,
    wallet: activeWallet,
  } = useWallet()

  const { connection } = useConnection()

  const [view, setView]             = useState('select')
  const [connectingName, setConnectingName] = useState(null)
  const [balance, setBalance]       = useState(null)
  const [copied, setCopied]         = useState(false)
  const overlayRef                  = useRef(null)

  // Sync view with connection state
  useEffect(() => {
    if (connected)       setView('connected')
    else if (!connecting) setView('select')
  }, [connected, connecting])

  useEffect(() => {
    if (isOpen && !connected) setView('select')
  }, [isOpen, connected])

  // Fetch SOL balance when connected
  useEffect(() => {
    if (!publicKey || !connected) { setBalance(null); return }
    let mounted = true
    connection.getBalance(publicKey, 'confirmed')
      .then((lamports) => { if (mounted) setBalance(lamports / LAMPORTS_PER_SOL) })
      .catch(() => { if (mounted) setBalance(null) })
    return () => { mounted = false }
  }, [publicKey, connected, connection])

  async function handleConnect(walletName) {
    setConnectingName(walletName)
    setView('connecting')
    try {
      select(walletName)
      await connect()
    } catch (err) {
      console.error('[SolanaWalletModal] connect error:', err)
      setView('select')
    }
  }

  function handleDisconnect() {
    disconnect()
    setView('select')
    onClose()
  }

  function handleCopy() {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  if (!isOpen) return null

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
    : null

  const connectingMeta = connectingName ? getWalletMeta(connectingName) : null

  // Only show wallets that are installed or are standard wallets
  const readyWallets     = wallets.filter((w) => w.readyState === 'Installed' || w.readyState === 'Loadable')
  const notReadyWallets  = wallets.filter((w) => w.readyState === 'NotDetected')

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@500;600;700&display=swap');
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        .sol-modal { animation: slideUp 0.2s ease; }
        .sol-wallet-btn {
          background: #0d1117; border: 1px solid #1e2832; border-radius: 10px;
          padding: 14px 16px; cursor: pointer; display: flex; align-items: center;
          gap: 14px; width: 100%; transition: all 0.15s ease; color: inherit;
        }
        .sol-wallet-btn:hover { background: #111923; border-color: #9945ff44; transform: translateX(3px); }
        .sol-wallet-btn:active { transform: translateX(1px); }
        .sol-wallet-btn.not-installed { opacity: 0.45; }
        .sol-wallet-btn.not-installed:hover { transform: none; border-color: #1e2832; }
        .sol-action-btn {
          background: transparent; border: 1px solid #1e2832; border-radius: 8px;
          padding: 8px 14px; cursor: pointer; color: #8899aa; font-size: 12px;
          font-family: 'IBM Plex Mono', monospace; transition: all 0.15s ease;
        }
        .sol-action-btn:hover { border-color: #334455; color: #aabbcc; }
        .sol-disconnect-btn {
          background: transparent; border: 1px solid #ff444422; border-radius: 8px;
          padding: 10px 20px; cursor: pointer; color: #ff6666; font-size: 13px;
          font-family: 'IBM Plex Mono', monospace; width: 100%; transition: all 0.15s ease;
        }
        .sol-disconnect-btn:hover { background: #ff444411; border-color: #ff444444; }
        .sol-spinner {
          width: 32px; height: 32px; border: 2px solid #1e2832;
          border-top-color: #9945ff; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        .sol-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #9945ff; animation: pulse 2s ease infinite;
        }
      `}</style>

      <div
        className="sol-modal"
        style={{
          background: '#080c12', border: '1px solid #1a2433', borderRadius: '16px',
          width: '100%', maxWidth: '400px', margin: '16px', overflow: 'hidden',
          fontFamily: "'Syne', sans-serif", color: '#c8d8e8',
          boxShadow: '0 0 0 1px #9945ff11, 0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #0f1a26',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9945ff', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '4px' }}>
              SOLANA
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e8f0f8' }}>
              {view === 'select'     && 'Connect Wallet'}
              {view === 'connecting' && 'Connecting…'}
              {view === 'connected'  && 'Wallet'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#556677', fontSize: '20px',
              cursor: 'pointer', lineHeight: 1, padding: '4px', borderRadius: '4px', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#aabbcc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#556677')}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>

          {/* SELECT WALLET */}
          {view === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#556677', marginBottom: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
                INSTALLED
              </div>

              {readyWallets.length === 0 && (
                <div style={{
                  background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                  padding: '14px 16px', fontSize: '13px', color: '#556677', textAlign: 'center',
                }}>
                  No Solana wallets detected. Install Phantom or Solflare to continue.
                </div>
              )}

              {readyWallets.map((w) => {
                const meta = getWalletMeta(w.adapter.name)
                return (
                  <button
                    key={w.adapter.name}
                    className="sol-wallet-btn"
                    onClick={() => handleConnect(w.adapter.name)}
                  >
                    {w.adapter.icon
                      ? <img src={w.adapter.icon} alt={w.adapter.name} style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
                      : <span style={{ fontSize: '24px', lineHeight: 1 }}>{meta.icon}</span>
                    }
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e0eaf4' }}>{w.adapter.name}</div>
                      <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {meta.description}
                      </div>
                    </div>
                    <span style={{ color: '#334455', fontSize: '16px' }}>›</span>
                  </button>
                )
              })}

              {/* Not installed wallets */}
              {notReadyWallets.length > 0 && (
                <>
                  <div style={{ fontSize: '12px', color: '#556677', marginTop: '8px', marginBottom: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
                    NOT INSTALLED
                  </div>
                  {notReadyWallets.map((w) => {
                    const meta = getWalletMeta(w.adapter.name)
                    return (
                      <a
                        key={w.adapter.name}
                        href={w.adapter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sol-wallet-btn not-installed"
                        style={{ textDecoration: 'none' }}
                      >
                        {w.adapter.icon
                          ? <img src={w.adapter.icon} alt={w.adapter.name} style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
                          : <span style={{ fontSize: '24px', lineHeight: 1 }}>{meta.icon}</span>
                        }
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e0eaf4' }}>{w.adapter.name}</div>
                          <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
                            Click to install
                          </div>
                        </div>
                        <span style={{ color: '#334455', fontSize: '13px' }}>↗</span>
                      </a>
                    )
                  })}
                </>
              )}

              <div style={{ fontSize: '11px', color: '#334455', textAlign: 'center', marginTop: '8px', fontFamily: "'IBM Plex Mono', monospace" }}>
                By connecting you agree to our Terms of Service
              </div>
            </div>
          )}

          {/* CONNECTING */}
          {view === 'connecting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
              <span style={{ fontSize: '48px', lineHeight: 1 }}>{connectingMeta?.icon ?? '🔐'}</span>
              <div className="sol-spinner" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#e0eaf4', marginBottom: '6px' }}>
                  Opening {connectingName}
                </div>
                <div style={{ fontSize: '12px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Approve in your wallet
                </div>
              </div>
              <button className="sol-action-btn" onClick={() => setView('select')}>← Back</button>
            </div>
          )}

          {/* CONNECTED */}
          {view === 'connected' && publicKey && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Address */}
              <div style={{
                background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div className="sol-status-dot" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '2px' }}>
                    CONNECTED VIA {activeWallet?.adapter?.name?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', fontFamily: "'IBM Plex Mono', monospace", color: '#e0eaf4', fontWeight: 500 }}>
                    {shortKey}
                  </div>
                </div>
                <button className="sol-action-btn" onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Balance */}
              <div style={{
                background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace" }}>BALANCE</span>
                <span style={{ fontSize: '14px', color: '#9945ff', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>
                  {balance != null ? `${balance.toFixed(4)} SOL` : '…'}
                </span>
              </div>

              {/* Network — Solana is always mainnet here */}
              <div style={{
                background: '#0d1117', border: '1px solid #1e2832', borderRadius: '10px',
                padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#556677', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '2px' }}>NETWORK</div>
                  <div style={{ fontSize: '13px', color: '#e0eaf4', fontWeight: 600 }}>◎ Solana Mainnet</div>
                </div>
              </div>

              <button className="sol-disconnect-btn" onClick={handleDisconnect}>Disconnect Wallet</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}