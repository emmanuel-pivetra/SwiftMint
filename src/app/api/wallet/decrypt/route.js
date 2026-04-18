import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/src/app/lib/encryption";

export async function POST(req) {
  try {
    const { wallet_id } = await req.json();

    if (!wallet_id) {
      return NextResponse.json({ error: "Missing wallet_id" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("id, address, private_key")
      .eq("id", wallet_id)
      .single();

    if (error || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.private_key === "watch-only") {
      return NextResponse.json({ error: "Watch-only wallet — no private key stored." }, { status: 400 });
    }

    // Decrypt in memory — never logged
    const rawKey = decrypt(wallet.private_key);

    if (!rawKey) {
      return NextResponse.json({ error: "Failed to decrypt private key." }, { status: 500 });
    }

    // Log access for audit trail (no key in log)
    console.log(`[admin/decrypt] private key accessed for wallet ${wallet.address?.slice(0, 8)}… at ${new Date().toISOString()}`);

    return NextResponse.json({ private_key: rawKey });

  } catch (err) {
    console.error("[admin/decrypt]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}