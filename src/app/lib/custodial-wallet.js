// src/app/lib/custodial-wallet.js
// Server-side only — never import in client components

import {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// ── Generate a new wallet ─────────────────────────────────────────────────
export function generateWallet() {
  const keypair = Keypair.generate();
  return {
    address:    keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey), // stored as base58 string
  };
}

// ── Reconstruct keypair from stored base58 private key ────────────────────
export function keypairFromPrivateKey(base58PrivKey) {
  const decoded = bs58.decode(base58PrivKey);
  return Keypair.fromSecretKey(decoded);
}

// ── Get connection ────────────────────────────────────────────────────────
export function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

// ── Get SOL balance ───────────────────────────────────────────────────────
export async function getBalance(address) {
  const connection = getConnection();
  const pubkey     = new PublicKey(address);
  const lamports   = await connection.getBalance(pubkey, "confirmed");
  return lamports / LAMPORTS_PER_SOL;
}

// ── Send SOL ──────────────────────────────────────────────────────────────
export async function sendSOL({ privateKey, toAddress, amountSOL }) {
  if (!privateKey)              throw new Error("No private key provided");
  if (!toAddress)               throw new Error("No destination address");
  if (!amountSOL || amountSOL <= 0) throw new Error("Invalid amount");

  const fromKeypair = keypairFromPrivateKey(privateKey);
  const connection  = getConnection();
  const toPubkey    = new PublicKey(toAddress);
  const lamports    = Math.floor(amountSOL * LAMPORTS_PER_SOL);

  const balance = await connection.getBalance(fromKeypair.publicKey, "confirmed");
  if (balance < lamports + 5000) {
    throw new Error(
      `Insufficient balance. Have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL, need ${amountSOL} SOL + fees`
    );
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey,
      lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
  return {
    signature,
    explorerUrl: `https://solscan.io/tx/${signature}`,
  };
}