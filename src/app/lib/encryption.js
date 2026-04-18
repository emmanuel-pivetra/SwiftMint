// src/app/lib/encryption.js
// AES-256-GCM encryption for sensitive wallet data

import crypto from "crypto";

const ALGORITHM  = "aes-256-gcm";
const IV_LENGTH  = 16; // bytes
const TAG_LENGTH = 16; // bytes

function getKey() {
  const raw = process.env.WALLET_ENCRYPTION_KEY;
  if (!raw) throw new Error("WALLET_ENCRYPTION_KEY is not set in environment variables.");

  // Accept either a 64-char hex string or a 32-char plain string
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  // Derive a 32-byte key from the string using SHA-256
  return crypto.createHash("sha256").update(raw).digest();
}

/**
 * Encrypt a string.
 * Returns a base64 string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext) {
  if (!plaintext) return null;
  const key = getKey();
  const iv  = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Pack as base64: iv | tag | ciphertext
  const packed = Buffer.concat([iv, tag, encrypted]);
  return packed.toString("base64");
}

/**
 * Decrypt a base64 string produced by encrypt().
 * Returns the original plaintext string.
 */
export function decrypt(ciphertext) {
  if (!ciphertext) return null;

  // Legacy — if value doesn't look like base64 packed data, return as-is
  // This handles wallets saved before encryption was added
  try {
    const key    = getKey();
    const packed = Buffer.from(ciphertext, "base64");

    const iv         = packed.subarray(0, IV_LENGTH);
    const tag        = packed.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted  = packed.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    // Return as-is if decryption fails (handles unencrypted legacy data)
    console.warn("[encryption] decrypt failed — returning raw value (legacy data?)");
    return ciphertext;
  }
}

/**
 * Returns true if a value appears to be encrypted by this module.
 */
export function isEncrypted(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length > IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}