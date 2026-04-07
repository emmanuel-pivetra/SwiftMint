// src/app/api/wallet/send/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { sendSOL } from "@/src/app/lib/custodial-wallet";

export async function POST(req) {
  try {
    const cookieStore = await cookies();

    // Get authenticated user from session
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

    // Fetch encrypted private key using service role
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: wallet, error: walletError } = await serviceSupabase
      .from("wallets")
      .select("encrypted_priv_key")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Sign and broadcast the transaction
    const result = await sendSOL({
      privateKey: wallet.private_key,
      toAddress,
      amountSOL: Number(amountSOL),
    });

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