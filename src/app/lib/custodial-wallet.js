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
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";

const RPC_URL    = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const SECRET_KEY = process.env.CUSTODIAL_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  throw new Error("CUSTODIAL_ENCRYPTION_KEY is not set in .env.local");
}

function getEncryptionKey() {
  return createHash("sha256").update(SECRET_KEY).digest();
}

export function encryptPrivateKey(privateKeyBytes) {
  const iv        = randomBytes(16);
  const key       = getEncryptionKey();
  const cipher    = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(privateKeyBytes)), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPrivateKey(stored) {
  const [ivHex, encryptedHex] = stored.split(":");
  const key       = getEncryptionKey();
  const iv        = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher  = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return new Uint8Array(decrypted);
}

export function generateWallet() {
  const keypair = Keypair.generate();
  return {
    address:          keypair.publicKey.toBase58(),
    encryptedPrivKey: encryptPrivateKey(keypair.secretKey),
  };
}

export function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

export async function getBalance(address) {
  const connection = getConnection();
  const pubkey     = new PublicKey(address);
  const lamports   = await connection.getBalance(pubkey, "confirmed");
  return lamports / LAMPORTS_PER_SOL;
}

export async function sendSOL({ encryptedPrivKey, toAddress, amountSOL }) {
  if (!encryptedPrivKey) throw new Error("No private key provided");
  if (!toAddress)        throw new Error("No destination address");
  if (!amountSOL || amountSOL <= 0) throw new Error("Invalid amount");

  const privKeyBytes = decryptPrivateKey(encryptedPrivKey);
  const fromKeypair  = Keypair.fromSecretKey(privKeyBytes);
  const connection   = getConnection();
  const toPubkey     = new PublicKey(toAddress);
  const lamports     = Math.floor(amountSOL * LAMPORTS_PER_SOL);

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