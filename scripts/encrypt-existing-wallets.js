import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── Inline encryption (same as src/app/lib/encryption.js) ────────────────────
const ALGORITHM  = "aes-256-gcm";
const IV_LENGTH  = 16;
const TAG_LENGTH = 16;

function getKey() {
  const raw = process.env.WALLET_ENCRYPTION_KEY;
  if (!raw) throw new Error("WALLET_ENCRYPTION_KEY not set in .env.local");
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return crypto.createHash("sha256").update(raw).digest();
}

function encrypt(plaintext) {
  if (!plaintext) return null;
  const key = getKey();
  const iv  = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function isAlreadyEncrypted(value) {
  if (!value || typeof value !== "string") return false;
  // Plain base58 private keys are 87-88 chars and only contain base58 chars
  // Encrypted values are base64 and much longer
  if (/^[1-9A-HJ-NP-Za-km-z]{80,95}$/.test(value)) return false;
  // Looks like base64 packed data — likely already encrypted
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length > IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}

// ── Main migration ────────────────────────────────────────────────────────────
async function migrate() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   SwiftMint Wallet Encryption Migration  ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // ── 1. Migrate wallets table ──────────────────────────────────────────────
  console.log("📋 Fetching wallets table...");
  const { data: wallets, error: walletsError } = await supabase
    .from("wallets")
    .select("id, address, private_key");

  if (walletsError) {
    console.error("❌ Failed to fetch wallets:", walletsError.message);
    process.exit(1);
  }

  console.log(`   Found ${wallets.length} wallets\n`);

  let walletsDone = 0, walletsSkipped = 0, walletsFailed = 0;

  for (const wallet of wallets) {
    const shortAddr = `${wallet.address?.slice(0, 8)}…${wallet.address?.slice(-4)}`;

    if (!wallet.private_key || wallet.private_key === "watch-only") {
      console.log(`   ⏭  ${shortAddr} — skipped (watch-only or empty)`);
      walletsSkipped++;
      continue;
    }

    if (isAlreadyEncrypted(wallet.private_key)) {
      console.log(`   ✅ ${shortAddr} — already encrypted`);
      walletsSkipped++;
      continue;
    }

    try {
      const encrypted = encrypt(wallet.private_key);
      const { error } = await supabase
        .from("wallets")
        .update({ private_key: encrypted })
        .eq("id", wallet.id);

      if (error) throw new Error(error.message);
      console.log(`   🔐 ${shortAddr} — encrypted`);
      walletsDone++;
    } catch (err) {
      console.error(`   ❌ ${shortAddr} — FAILED: ${err.message}`);
      walletsFailed++;
    }
  }

  console.log(`\n   wallets: ${walletsDone} encrypted, ${walletsSkipped} skipped, ${walletsFailed} failed`);

  // ── 2. Migrate imported_wallets table ─────────────────────────────────────
  console.log("\n📋 Fetching imported_wallets table...");
  const { data: imported, error: importedError } = await supabase
    .from("imported_wallets")
    .select("id, address, private_key, seed_phrase");

  if (importedError) {
    console.error("❌ Failed to fetch imported_wallets:", importedError.message);
    process.exit(1);
  }

  console.log(`   Found ${imported.length} imported wallets\n`);

  let importedDone = 0, importedSkipped = 0, importedFailed = 0;

  for (const row of imported) {
    const shortAddr = `${row.address?.slice(0, 8)}…${row.address?.slice(-4)}`;
    const updates   = {};

    // Encrypt private_key if needed
    if (row.private_key && !isAlreadyEncrypted(row.private_key)) {
      updates.private_key = encrypt(row.private_key);
    }

    // Encrypt seed_phrase if present and not already encrypted
    if (row.seed_phrase && !isAlreadyEncrypted(row.seed_phrase)) {
      updates.seed_phrase = encrypt(row.seed_phrase);
    }

    if (Object.keys(updates).length === 0) {
      console.log(`   ✅ ${shortAddr} — already encrypted`);
      importedSkipped++;
      continue;
    }

    try {
      const { error } = await supabase
        .from("imported_wallets")
        .update(updates)
        .eq("id", row.id);

      if (error) throw new Error(error.message);
      const fields = Object.keys(updates).join(", ");
      console.log(`   🔐 ${shortAddr} — encrypted [${fields}]`);
      importedDone++;
    } catch (err) {
      console.error(`   ❌ ${shortAddr} — FAILED: ${err.message}`);
      importedFailed++;
    }
  }

  console.log(`\n   imported_wallets: ${importedDone} encrypted, ${importedSkipped} skipped, ${importedFailed} failed`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalFailed = walletsFailed + importedFailed;
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║              Migration done              ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`   Total encrypted : ${walletsDone + importedDone}`);
  console.log(`   Total skipped   : ${walletsSkipped + importedSkipped}`);
  console.log(`   Total failed    : ${totalFailed}`);

  if (totalFailed > 0) {
    console.log("\n⚠️  Some rows failed — check logs above and re-run.");
    process.exit(1);
  } else {
    console.log("\n✅ All private keys are now encrypted in the database.");
  }
}

migrate().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});