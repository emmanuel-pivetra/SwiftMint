// pages/api/auth/nonce.js
import { randomUUID } from "crypto";

// In-memory store for development only.
// Key: pubkey (base58) -> { nonce, createdAt, timeoutId }
const NONCE_STORE = global.__NONCE_STORE ||= new Map();

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { pubkey } = req.query;
  if (!pubkey) return res.status(400).json({ error: "missing pubkey" });

  // Create a one-time nonce
  const nonce = randomUUID();
  const createdAt = Date.now();

  // Clear any previous nonce for this pubkey
  if (NONCE_STORE.has(pubkey)) {
    const prev = NONCE_STORE.get(pubkey);
    if (prev?.timeoutId) clearTimeout(prev.timeoutId);
  }

  // Auto-expire entry after 5 minutes
  const timeoutId = setTimeout(() => {
    NONCE_STORE.delete(pubkey);
  }, 5 * 60 * 1000);

  NONCE_STORE.set(pubkey, { nonce, createdAt, timeoutId });

  return res.status(200).json({ nonce });
}