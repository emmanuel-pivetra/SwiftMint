import { createClient } from "@supabase/supabase-js";
import { sendSOL, getBalance } from "../src/app/lib/custodial-wallet.js";

// ── Config ────────────────────────────────────────────────────────────────
const HOT_WALLET    = process.env.HOT_WALLET_ADDRESS;  // set in .env.local
const MIN_SWEEP_SOL = 0.005;  // skip wallets below this balance
const TX_DELAY_MS   = 600;    // delay between txns to avoid RPC rate limits
// ─────────────────────────────────────────────────────────────────────────

if (!HOT_WALLET) {
  console.error("❌  HOT_WALLET_ADDRESS is not set in .env.local");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatSOL(n) {
  return `${Number(n).toFixed(6)} SOL`;
}

async function sweepAll() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  SwiftMint — Wallet Sweep");
  console.log(`  Hot wallet : ${HOT_WALLET}`);
  console.log(`  Min sweep  : ${formatSOL(MIN_SWEEP_SOL)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Fetch all wallets from DB
  const { data: wallets, error } = await supabase
    .from("wallets")
    .select("user_id, address, encrypted_priv_key");

  if (error) {
    console.error("❌  Failed to fetch wallets:", error.message);
    process.exit(1);
  }

  console.log(`Found ${wallets.length} wallet(s)\n`);

  let totalSwept   = 0;
  let successCount = 0;
  let skipCount    = 0;
  let failCount    = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const label  = `[${i + 1}/${wallets.length}] ${wallet.address}`;

    // Skip if it's the hot wallet itself
    if (wallet.address === HOT_WALLET) {
      console.log(`⏭  ${label} — this is the hot wallet, skipping`);
      skipCount++;
      continue;
    }

    // Fetch live balance
    let balance;
    try {
      balance = await getBalance(wallet.address);
    } catch (err) {
      console.log(`⚠  ${label} — could not fetch balance: ${err.message}`);
      failCount++;
      continue;
    }

    // Skip low-balance wallets
    if (balance < MIN_SWEEP_SOL) {
      console.log(`⏭  ${label} — balance ${formatSOL(balance)} below minimum, skipping`);
      skipCount++;
      continue;
    }

    // Reserve enough for the transaction fee (~5000 lamports = 0.000005 SOL)
    const TX_FEE    = 0.000005;
    const amountSOL = balance - TX_FEE;

    console.log(`→  ${label}`);
    console.log(`   Balance : ${formatSOL(balance)}`);
    console.log(`   Sending : ${formatSOL(amountSOL)}`);

    try {
      const result = await sendSOL({
        privateKey: wallet.private_key,
        toAddress:        HOT_WALLET,
        amountSOL,
      });

      console.log(`✓  Signature : ${result.signature}`);
      console.log(`   Explorer  : ${result.explorerUrl}\n`);

      totalSwept   += amountSOL;
      successCount += 1;
    } catch (err) {
      console.log(`❌  Failed: ${err.message}\n`);
      failCount += 1;
    }

    // Delay to avoid hammering the RPC
    if (i < wallets.length - 1) await sleep(TX_DELAY_MS);
  }

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Sweep complete");
  console.log(`  ✓ Swept    : ${successCount} wallet(s) — ${formatSOL(totalSwept)}`);
  console.log(`  ⏭ Skipped  : ${skipCount} wallet(s)`);
  console.log(`  ❌ Failed   : ${failCount} wallet(s)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

sweepAll().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});