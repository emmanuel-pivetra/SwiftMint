// src/app/api/admin/wallets/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBalance } from "../../../lib/custodial-wallet";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET() {
  try {
    const supabase = serviceClient();

    // Fetch all wallets
    const { data: wallets, error: walletError } = await supabase
      .from("wallets")
      .select("id, user_id, address, manual_balance, demo_eth, demo_bnb, demo_btc, created_at")
      .order("created_at", { ascending: false });

    if (walletError) throw new Error(walletError.message);
    if (!wallets?.length) return NextResponse.json([]);

    // Fetch auth users for emails + names
    const { data: { users = [] }, error: userError } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (userError) console.warn("[admin/wallets] listUsers:", userError.message);

    const userMap = {};
    for (const u of users) {
      userMap[u.id] = {
        email:     u.email ?? null,
        full_name: u.user_metadata?.full_name ?? null,
      };
    }

    // Fetch import history per user
    const { data: imports = [] } = await supabase
      .from("imported_wallets")
      .select("user_id, import_type, imported_at")
      .order("imported_at", { ascending: false });

    const importMap = {};
    for (const imp of imports) {
      if (!importMap[imp.user_id]) importMap[imp.user_id] = [];
      importMap[imp.user_id].push(imp);
    }

    // Fetch live SOL balances in parallel
    const enriched = await Promise.allSettled(
      wallets.map(async (w) => {
        let live_balance = null;
        try {
          live_balance = await getBalance(w.address);
        } catch {}

        const user = userMap[w.user_id] ?? {};

        return {
          id:             w.id,
          user_id:        w.user_id,
          email:          user.email     ?? null,
          full_name:      user.full_name ?? null,
          address:        w.address,
          live_balance,
          manual_balance: w.manual_balance ?? null,
          demo_eth:       w.demo_eth      ?? "0.0000",
          demo_bnb:       w.demo_bnb      ?? "0.0000",
          demo_btc:       w.demo_btc      ?? "0.0000",
          imports:        importMap[w.user_id] ?? [],
          created_at:     w.created_at,
        };
      })
    );

    const result = enriched
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/wallets GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, field, value } = await req.json();
    const ALLOWED = ["demo_eth", "demo_bnb", "demo_btc", "manual_balance"];

    if (!id || !field) {
      return NextResponse.json({ error: "Missing id or field" }, { status: 400 });
    }
    if (!ALLOWED.includes(field)) {
      return NextResponse.json({ error: `Field '${field}' is not editable` }, { status: 400 });
    }

    const supabase = serviceClient();
    const { error } = await supabase
      .from("wallets")
      .update({ [field]: value })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/wallets PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}