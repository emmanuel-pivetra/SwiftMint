// app/api/wallet/send/route.js

import { NextResponse } from "next/server";
import { sendSOL, getBalance } from "@/src/app/lib/custodial-wallet";

export async function POST(req) {
  try {
    // TODO: verify the request comes from an authenticated user
    // const session = await getServerSession(authOptions)
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // const userId = session.user.id

    const { userId, toAddress, amountSOL } = await req.json();

    if (!userId || !toAddress || !amountSOL) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic input validation
    if (typeof amountSOL !== "number" || amountSOL <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // TODO: look up the user's encrypted private key from your DB
    // Example with Prisma:
    // const wallet = await prisma.wallet.findUnique({ where: { userId } })
    // if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    // const encryptedPrivKey = wallet.encryptedPrivKey
    //
    // For now, read from env as a placeholder:
    const encryptedPrivKey = process.env[`WALLET_KEY_${userId}`]; // placeholder

    if (!encryptedPrivKey) {
      return NextResponse.json({ error: "Wallet not found for user" }, { status: 404 });
    }

    const result = await sendSOL({ encryptedPrivKey, toAddress, amountSOL });

    return NextResponse.json({
      success:     true,
      signature:   result.signature,
      explorerUrl: result.explorerUrl,
    });
  } catch (err) {
    console.error("[wallet/send]", err);
    return NextResponse.json({ error: err.message || "Transaction failed" }, { status: 500 });
  }
}