// pages/api/auth/verify.js
import nacl from "tweetnacl";
import bs58 from "bs58";

// Same in-memory store (dev only)
const NONCE_STORE = global.__NONCE_STORE ||= new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { pubkey, signature, nonce } = req.body || {};
  if (!pubkey || !signature || !nonce) {
    return res.status(400).json({ error: "missing fields" });
  }

  const entry = NONCE_STORE.get(pubkey);
  if (!entry || entry.nonce !== nonce) {
    return res.status(400).json({ error: "invalid or expired nonce" });
  }

  // Reconstruct message exactly as the client signed
  const msg = `Sign in to SwiftMint\nnonce: ${nonce}`;
  const msgBytes = new TextEncoder().encode(msg);

  try {
    // normalize signature
    const sigUint8 = Uint8Array.from(signature);
    const pubkeyUint8 = bs58.decode(pubkey);

    const verified = nacl.sign.detached.verify(msgBytes, sigUint8, pubkeyUint8);

    if (!verified) return res.status(401).json({ error: "signature verification failed" });

    // Success: consume nonce and clear timeout
    if (entry.timeoutId) clearTimeout(entry.timeoutId);
    NONCE_STORE.delete(pubkey);

    // TODO: create a real session (set httpOnly cookie / JWT)
    return res.status(200).json({ ok: true, pubkey });
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).json({ error: "server error" });
  }
}