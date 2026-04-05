// app/api/wallet/balance/route.js

import { NextResponse } from "next/server";
import { getBalance } from "@/src/app/lib/custodial-wallet";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const balance = await getBalance(address);
    return NextResponse.json({ balance, symbol: "SOL" });
  } catch (err) {
    console.error("[wallet/balance]", err);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}