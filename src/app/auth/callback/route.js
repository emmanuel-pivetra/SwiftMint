// src/app/auth/callback/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateWallet } from "../../lib/custodial-wallet";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

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

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("[auth/callback] session error:", error);
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  const user = data.user;

  // ── Custodial wallet: create one if user doesn't have one yet ────────────
  try {
    // Use service role to bypass RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if wallet already exists for this user
    const { data: existing } = await serviceSupabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      // Generate a fresh Solana custodial wallet
      const { address, encryptedPrivKey } = generateWallet();

      const { error: insertError } = await serviceSupabase
        .from("wallets")
        .insert({
          user_id:            user.id,
          address,
          encrypted_priv_key: encryptedPrivKey,
        });

      if (insertError) {
        console.error("[auth/callback] wallet insert error:", insertError);
      } else {
        console.log("[auth/callback] wallet created for user:", user.id, address);
      }
    }
  } catch (walletErr) {
    // Don't block login if wallet creation fails — user can retry
    console.error("[auth/callback] wallet creation failed:", walletErr);
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}${next}`);
}