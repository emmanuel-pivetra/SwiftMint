// src/app/api/wallet/me/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getBalance } from "@/src/app/lib/custodial-wallet";

export async function GET() {
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

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch wallet — now includes demo balances
    const { data: wallet, error: walletError } = await serviceSupabase  // ← destructure error
      .from("wallets")
      .select("address, demo_eth, demo_bnb, demo_btc, manual_balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Insufficient funds you didn’t meet the minimum amount of wager" }, { status: 404 });
    }


    const liveBalance    = await getBalance(wallet.address);
    const manualBalance  = wallet.manual_balance != null ? Number(wallet.manual_balance) : null;

    return NextResponse.json({
      address:        wallet.address,
      balance:        manualBalance ?? liveBalance,  // ← override takes priority
      live_balance:   liveBalance,
      manual_balance: manualBalance,
      symbol:         "SOL",
      demo_eth:       wallet.demo_eth ?? "0.0000",
      demo_bnb:       wallet.demo_bnb ?? "0.0000",
      demo_btc:       wallet.demo_btc ?? "0.0000",
    });
  } catch (err) {
    console.error("[wallet/me]", err);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}