// app/api/wallet/create/route.js
// Call this once per user after they sign up

import { NextResponse } from "next/server";
import { generateWallet } from "@/src/app/lib/custodial-wallet";

export async function POST(req) {
  try {
    // TODO: get the real user ID from your auth session
    // e.g. const session = await getServerSession(authOptions)
    // const userId = session?.user?.id
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a fresh keypair
    const { address, encryptedPrivKey } = generateWallet();

    // TODO: Save to your database
    // Example with Prisma:
    // await prisma.wallet.create({
    //   data: { userId, address, encryptedPrivKey }
    // })
    //
    // Example with Supabase:
    // await supabase.from("wallets").insert({ user_id: userId, address, encrypted_priv_key: encryptedPrivKey })

    // Return only the address — NEVER return the private key to the client
    return NextResponse.json({ address });
  } catch (err) {
    console.error("[wallet/create]", err);
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
  }
}