// src/app/api/wallet/me/route.js
// Returns the current user's custodial wallet address and balance

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getBalance } from "@/src/app/lib/custodial-wallet";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Get the logged-in user from session
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

    // Fetch wallet using service role (bypasses RLS)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: wallet, error: walletError } = await serviceSupabase
      .from("wallets")
      .select("address")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Fetch live SOL balance from RPC
    const balance = await getBalance(wallet.address);

    return NextResponse.json({
      address: wallet.address,
      balance,
      symbol: "SOL",
    });
  } catch (err) {
    console.error("[wallet/me]", err);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}