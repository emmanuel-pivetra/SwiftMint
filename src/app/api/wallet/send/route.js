// src/app/api/wallet/send/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { sendSOL } from "../../lib/custodial-wallet";
import { decrypt } from "../../lib/encryption";

export async function POST(req) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toAddress, amountSOL } = await req.json();

    if (!toAddress || !amountSOL || amountSOL <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch wallet — select private_key (encrypted)
    const { data: wallet, error: walletError } = await serviceSupabase
      .from("wallets")
      .select("address, private_key")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Block watch-only wallets
    if (wallet.private_key === "watch-only") {
      return NextResponse.json(
        { error: "This is a watch-only wallet. You cannot send funds from it." },
        { status: 403 }
      );
    }

    // Decrypt private key in memory — never logged or stored
    const rawPrivateKey = decrypt(wallet.private_key);

    if (!rawPrivateKey) {
      return NextResponse.json({ error: "Failed to decrypt wallet key." }, { status: 500 });
    }

    // Sign and broadcast transaction using decrypted key
    const result = await sendSOL({
      privateKey: rawPrivateKey, // ← decrypted, used only for this request
      toAddress,
      amountSOL:  Number(amountSOL),
    });

    // rawPrivateKey goes out of scope here — never stored anywhere

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