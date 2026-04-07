// src/app/api/wallet/create/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { generateWallet } from "@/src/app/lib/custodial-wallet";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Get logged-in user from session
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

    // Service role to bypass RLS
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if wallet already exists
    const { data: existing } = await serviceSupabase
      .from("wallets")
      .select("id, address")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ address: existing.address, existed: true });
    }

    // Generate new wallet
    const { address, privateKey } = generateWallet();

    const { error: insertError } = await serviceSupabase
      .from("wallets")
      .insert({
        user_id:     user.id,
        address,
        private_key: privateKey,
      });

    if (insertError) {
      console.error("[wallet/create] insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("[wallet/create] created wallet for", user.email, "→", address);
    return NextResponse.json({ address, existed: false });
  } catch (err) {
    console.error("[wallet/create] unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}