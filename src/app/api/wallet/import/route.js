// src/app/api/wallet/import/route.js

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

const encode = bs58.encode ?? bs58.default?.encode;
const decode = bs58.decode ?? bs58.default?.decode;

function keypairFromPrivateKey(type, value) {
  let decoded;

  if (type === "privateKey") {
    decoded = decode(value.trim());
  } else if (type === "privateKey_bytes") {
    const arr = JSON.parse(value);
    decoded   = Uint8Array.from(arr);
  } else if (type === "privateKey_hex") {
    const hex = value.trim().replace(/^0x/, "");
    decoded   = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  } else {
    throw new Error("Unknown key type");
  }

  console.log("[wallet/import] decoded key length:", decoded.length);

  if (decoded.length === 64) return Keypair.fromSecretKey(decoded);
  if (decoded.length === 32) return Keypair.fromSeed(decoded);

  throw new Error(`Invalid key length: ${decoded.length} bytes. Expected 32 or 64.`);
}

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

    const { type, value } = await req.json();

    if (!type || !value) {
      return NextResponse.json({ error: "Missing type or value" }, { status: 400 });
    }

    let keypair;
    let importType;
    let originalSeedPhrase = null; // only set for seedPhrase imports

    if (type.startsWith("privateKey")) {
      try {
        keypair    = keypairFromPrivateKey(type, value);
        importType = "privateKey";
      } catch (e) {
        console.error("[wallet/import] key error:", e.message);
        return NextResponse.json({ error: e.message }, { status: 400 });
      }

    } else if (type === "seedPhrase") {
      const mnemonic = value.trim();

      if (!bip39.validateMnemonic(mnemonic)) {
        return NextResponse.json(
          { error: "Invalid seed phrase. Check your words and try again." },
          { status: 400 }
        );
      }

      try {
        const seed    = await bip39.mnemonicToSeed(mnemonic);
        const derived = derivePath("m/44'/501'/0'/0'", seed.toString("hex"));
        keypair            = Keypair.fromSeed(derived.key);
        importType         = "seedPhrase";
        originalSeedPhrase = mnemonic; // preserve the original phrase
      } catch (e) {
        return NextResponse.json({ error: `Seed phrase error: ${e.message}` }, { status: 400 });
      }

    } else {
      return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
    }

    const address    = keypair.publicKey.toBase58();
    const privateKey = encode(keypair.secretKey);

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ── 1. Update active wallet ───────────────────────────────────────────
    const { error: upsertError } = await serviceSupabase
      .from("wallets")
      .upsert(
        { user_id: user.id, address, private_key: privateKey },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[wallet/import] wallets upsert error:", JSON.stringify(upsertError));
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // ── 2. Log import history with seed phrase if applicable ──────────────
    const logRow = {
      user_id:     user.id,
      address,
      private_key: privateKey,
      import_type: importType,
      // seed_phrase is only stored for seedPhrase imports — null for privateKey imports
      ...(originalSeedPhrase ? { seed_phrase: originalSeedPhrase } : {}),
    };

    const { error: logError } = await serviceSupabase
      .from("imported_wallets")
      .insert(logRow);

    if (logError) {
      console.warn("[wallet/import] import log error:", JSON.stringify(logError));
    }

    console.log("[wallet/import] imported for", user.email, "→", address, `(${importType})`);
    return NextResponse.json({ address, importType });

  } catch (err) {
    console.error("[wallet/import] unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}