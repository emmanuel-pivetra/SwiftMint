"use client";

import { useEffect, useState } from "react";
import NotFound from "../not-found";
import { useUser } from "../components/hooks/useUser";

const DEMO_NETS = [
  { key: "demo_eth", label: "ETH", icon: "⟠", color: "text-blue-400" },
  { key: "demo_bnb", label: "BNB", icon: "◈", color: "text-yellow-400" },
  { key: "demo_btc", label: "BTC", icon: "₿",  color: "text-orange-400" },
];

function fmtSol(val) {
  if (val == null) return "—";
  return `${Number(val).toFixed(4)}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors ml-1"
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

function BalanceCell({ value, onSave, symbol }) {
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState(value);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSave() {
    const n = parseFloat(input);
    if (isNaN(n) || n < 0) return;
    setLoading(true);
    onSave(parseFloat(n.toFixed(6)), () => {
      setLoading(false);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")  handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus min="0" step="0.0001"
          className="w-20 rounded-lg bg-[#0b0b0c] border border-purple-500/50 px-2 py-1 text-[11px] text-white text-right focus:outline-none font-mono"
        />
        <button onClick={handleSave} disabled={loading} className="px-1.5 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-[10px] transition-colors">
          {loading ? "…" : "✓"}
        </button>
        <button onClick={() => setEditing(false)} className="px-1.5 py-1 rounded bg-white/10 text-gray-400 text-[10px] transition-colors">✕</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setInput(value); setEditing(true); }}
      className={`w-full text-right font-mono text-[11px] transition-all px-1.5 py-0.5 rounded hover:bg-white/5 ${
        saved ? "text-green-400" : "text-gray-300 hover:text-white"
      }`}
      title={`Click to edit ${symbol} balance`}
    >
      {saved ? "✓ Saved" : fmtSol(value)}
    </button>
  );
}

// ── Private Key Cell with decrypt button ──────────────────────────────────────
function PrivateKeyCell({ walletId }) {
  const [status,     setStatus]     = useState("hidden"); // hidden | loading | revealed | error
  const [privateKey, setPrivateKey] = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [error,      setError]      = useState(null);

  async function handleDecrypt() {
    setStatus("loading");
    setError(null);
    try {
      const res  = await fetch("/api/wallet/decrypt", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ wallet_id: walletId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Decryption failed");
      setPrivateKey(data.private_key);
      setStatus("revealed");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(privateKey ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleHide() {
    setPrivateKey(null);
    setStatus("hidden");
    setCopied(false);
  }

  if (status === "hidden") {
    return (
      <button
        onClick={handleDecrypt}
        className="text-[9px] px-2 py-1 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors font-medium"
      >
        🔓 Decrypt
      </button>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-full border border-gray-600 border-t-gray-200 animate-spin" />
        <span className="text-[9px] text-gray-500">Decrypting…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-red-400">{error}</span>
        <button onClick={() => setStatus("hidden")} className="text-[9px] text-gray-500 hover:text-gray-300">✕</button>
      </div>
    );
  }

  // revealed
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[9px] text-yellow-300 break-all leading-relaxed bg-yellow-500/5 border border-yellow-500/20 rounded px-2 py-1">
        {privateKey}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
            copied
              ? "bg-green-500/15 border-green-500/30 text-green-400"
              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          {copied ? "✓ Copied" : "⎘ Copy"}
        </button>
        <button
          onClick={handleHide}
          className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
        >
          Hide
        </button>
      </div>
    </div>
  );
}

// ── Wallet row ────────────────────────────────────────────────────────────────
function WalletRow({ wallet, onUpdate }) {
  const email     = wallet.email      ?? "—";
  const fullName  = wallet.full_name  ?? null;
  const address   = wallet.address    ?? "";
  const liveSOL   = wallet.live_balance ?? wallet.sol_balance ?? null;
  const manualBal = wallet.manual_balance ?? null;
  const imports   = Array.isArray(wallet.imports) ? wallet.imports : [];

  const [editingSOL, setEditingSOL] = useState(false);
  const [solInput,   setSolInput]   = useState(String(manualBal ?? ""));
  const [solSaved,   setSolSaved]   = useState(false);
  const [solLoading, setSolLoading] = useState(false);

  async function saveDemoNet(field, value, done) {
    try {
      const res = await fetch("/api/admin/wallets/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ wallet_id: wallet.id, field, value: String(value) }),
      });
      if (!res.ok) throw new Error("Failed");
      onUpdate(wallet.id, { [field]: String(value) });
      done?.();
    } catch (err) {
      console.error(err);
    }
  }

  async function saveManualSOL() {
    const num = solInput === "" ? null : parseFloat(solInput);
    if (solInput !== "" && (isNaN(num) || num < 0)) return;
    setSolLoading(true);
    try {
      const res = await fetch("/api/admin/wallets/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ wallet_id: wallet.id, manual_balance: num }),
      });
      if (!res.ok) throw new Error("Failed");
      onUpdate(wallet.id, { manual_balance: num });
      setEditingSOL(false);
      setSolSaved(true);
      setTimeout(() => setSolSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSolLoading(false);
    }
  }

  return (
    <div className="border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      <div
        className="grid gap-2 px-4 py-3 items-start"
        style={{ gridTemplateColumns: "2.5fr 1.5fr 2fr 1.5fr 1.5fr 1.5fr 2.5fr 1fr" }}
      >
        {/* User */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
              {(fullName?.[0] ?? email?.[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              {fullName && <div className="text-xs font-semibold text-white truncate">{fullName}</div>}
              <div className="text-[11px] text-white truncate">{email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 ml-9">
            <span className="text-[10px] text-gray-600">{fmtDate(wallet.created_at)}</span>
            {imports.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">
                {imports[0]?.import_type === "seedPhrase" ? "Seed" : "Key"}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="font-mono text-[10px] text-white truncate pt-1">
          {address
            ? <>{address.slice(0, 8)}…{address.slice(-4)}<CopyBtn text={address} /></>
            : "—"}
        </div>

        {/* SOL — live + override */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-purple-300 font-mono">◎ {fmtSol(liveSOL)}</span>
            {manualBal != null && <span className="text-[9px] text-gray-500">live</span>}
          </div>
          {editingSOL ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={solInput}
                onChange={(e) => setSolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  saveManualSOL();
                  if (e.key === "Escape") setEditingSOL(false);
                }}
                autoFocus min="0" step="0.001"
                placeholder={fmtSol(liveSOL)}
                className="w-16 rounded bg-[#0b0b0c] border border-purple-500/40 px-1.5 py-0.5 text-[10px] text-white text-right focus:outline-none font-mono"
              />
              <button onClick={saveManualSOL} disabled={solLoading} className="px-1.5 py-0.5 rounded bg-green-600 text-white text-[9px]">
                {solLoading ? "..." : "✓"}
              </button>
              <button onClick={() => setEditingSOL(false)} className="text-gray-500 text-[9px] hover:text-gray-300">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSolInput(String(manualBal ?? "")); setEditingSOL(true); }}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  manualBal != null
                    ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-gray-200"
                }`}
              >
                {solSaved ? "✓ Saved" : manualBal != null ? `↑ ${fmtSol(manualBal)}` : "Override"}
              </button>
              {manualBal != null && (
                <button
                  onClick={async () => {
                    await fetch("/api/admin/wallets/update", {
                      method:  "POST",
                      headers: { "Content-Type": "application/json" },
                      body:    JSON.stringify({ wallet_id: wallet.id, manual_balance: null }),
                    });
                    onUpdate(wallet.id, { manual_balance: null });
                  }}
                  className="text-[9px] text-red-400/60 hover:text-red-400 transition-colors"
                  title="Remove override"
                >✕</button>
              )}
            </div>
          )}
        </div>

        {/* ETH */}
        <div className="flex items-center gap-1.5">
          <BalanceCell value={wallet.demo_eth ?? "0.0000"} symbol="ETH" onSave={(v, done) => saveDemoNet("demo_eth", v, done)} />
        </div>

        {/* BNB */}
        <div className="flex items-center gap-1.5">
          <BalanceCell value={wallet.demo_bnb ?? "0.0000"} symbol="BNB" onSave={(v, done) => saveDemoNet("demo_bnb", v, done)} />
        </div>

        {/* BTC */}
        <div className="flex items-center gap-1.5">
          <BalanceCell value={wallet.demo_btc ?? "0.0000"} symbol="BTC" onSave={(v, done) => saveDemoNet("demo_btc", v, done)} />
        </div>

        {/* Private Key — decrypt on demand */}
        <div>
          <PrivateKeyCell walletId={wallet.id} />
        </div>

        {/* Type */}
        <div className="text-right pt-1">
          {imports.length > 0
            ? <span className="text-[10px] text-white">imported</span>
            : <span className="text-[10px] text-white">auto</span>
          }
        </div>
      </div>
    </div>
  );
}

// ── Main Transact page ────────────────────────────────────────────────────────
export default function Transact() {
  const { user, loading: userLoading } = useUser();
  const [wallets,  setWallets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) fetchWallets();
  }, [isAdmin]);

  // ── Functions ─────────────────────────────────────────────────────────────
  async function fetchWallets() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/wallets");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      setWallets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }

  function handleUpdate(walletId, changes) {
    setWallets((prev) =>
      prev.map((w) => w.id === walletId ? { ...w, ...changes } : w)
    );
  }

  const filtered = wallets.filter((w) =>
    !search ||
    w.email?.toLowerCase().includes(search.toLowerCase()) ||
    w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase())
  );

  const overrideCount = wallets.filter((w) => w.manual_balance != null).length;

  // ── Early returns AFTER all hooks ────────────────────────────────────────
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        <span className="animate-spin h-4 w-4 rounded-full border-2 border-gray-600 border-t-gray-200 mr-2" />
        Checking access…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <NotFound />;
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 w-full">

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Wallet Manager</h1>
        </div>
        <button
          onClick={fetchWallets}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total wallets", value: wallets.length },
          { label: "SOL overrides", value: overrideCount },
          { label: "On-chain only", value: wallets.length - overrideCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-900 border border-white/10 p-3 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name or address…"
          className="w-full rounded-xl bg-gray-900 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 p-8 text-sm text-gray-400">
          <span className="animate-spin h-4 w-4 rounded-full border-2 border-gray-600 border-t-gray-200" />
          Loading wallets…
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
          <button onClick={fetchWallets} className="ml-3 underline text-red-300 hover:text-red-200">Retry</button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-gray-900 overflow-hidden overflow-x-auto">
          <div
            className="grid gap-2 px-4 py-2.5 border-b border-white/10 bg-gray-950/60 text-[10px] font-medium text-white uppercase tracking-wider"
            style={{ gridTemplateColumns: "2.5fr 1.5fr 2fr 1.5fr 1.5fr 1.5fr 2.5fr 1fr" }}
          >
            <div>User</div>
            <div>Address</div>
            <div>◎ SOL</div>
            <div>⟠ ETH</div>
            <div>◈ BNB</div>
            <div>₿ BTC</div>
            <div>🔐 Private Key</div>
            <div className="text-right">Type</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-white text-sm">
              {search ? "No wallets match your search." : "No wallets found."}
            </div>
          ) : (
            filtered.map((wallet) => (
              <WalletRow key={wallet.id} wallet={wallet} onUpdate={handleUpdate} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
