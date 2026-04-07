// src/app/api/wallet/import/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

export async function POST(req) {
  try {
    const cookieStore = await cookies();

    // Get authenticated user
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

    const { type, value } = await req.json();

    if (!type || !value) {
      return NextResponse.json({ error: "Missing type or value" }, { status: 400 });
    }

    let keypair;

    if (type === "privateKey") {
      try {
        const decoded = bs58.decode(value.trim());
        keypair = Keypair.fromSecretKey(decoded);
      } catch {
        return NextResponse.json(
          { error: "Invalid private key. Make sure it is base58 encoded." },
          { status: 400 }
        );
      }
    } else if (type === "seedPhrase") {
      const mnemonic = value.trim();
      if (!bip39.validateMnemonic(mnemonic)) {
        return NextResponse.json(
          { error: "Invalid seed phrase. Check your words and try again." },
          { status: 400 }
        );
      }
      const seed    = await bip39.mnemonicToSeed(mnemonic);
      const derived = derivePath("m/44'/501'/0'/0'", seed.toString("hex"));
      keypair       = Keypair.fromSeed(derived.key);
    } else {
      return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
    }

    // Store address + raw base58 private key (no encryption)
    const address    = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);

    // Save to DB using service role
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Upsert — replaces existing wallet if user already has one
    const { error: upsertError } = await serviceSupabase
      .from("wallets")
      .upsert(
        {
          user_id:     user.id,
          address,
          private_key: privateKey,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[wallet/import] upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save wallet" }, { status: 500 });
    }

    console.log("[wallet/import] imported wallet for", user.email, "→", address);
    return NextResponse.json({ address });
  } catch (err) {
    console.error("[wallet/import]", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}