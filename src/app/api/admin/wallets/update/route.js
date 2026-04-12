// src/app/api/admin/wallets/update/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_FIELDS = ["manual_balance", "demo_eth", "demo_bnb", "demo_btc"];

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet_id } = body;

    if (!wallet_id) {
      return NextResponse.json({ error: "Missing wallet_id" }, { status: 400 });
    }

    // Build update object — accept any allowed field from the body
    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updates[field] = body[field] ?? null;
      }
    }

    // Also support passing { field, value } pattern from PATCH calls
    if (body.field && ALLOWED_FIELDS.includes(body.field)) {
      updates[body.field] = body.value ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from("wallets")
      .update(updates)
      .eq("id", wallet_id);

    if (error) throw new Error(error.message);

    console.log("[admin/wallets/update]", wallet_id, updates);
    return NextResponse.json({ success: true, updates });

  } catch (err) {
    console.error("[admin/wallets/update]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}