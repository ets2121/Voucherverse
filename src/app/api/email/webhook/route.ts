'use server';

import { NextResponse } from "next/server";
import { Webhook } from "svix"; // ✅ Svix package, not Resend
import { supabase } from "@/lib/supabase";

const signingSecret = process.env.RESEND_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    console.log("=== Incoming Headers ===", headers);
    console.log("=== Raw Body ===", rawBody);

    // Use Svix verifier
    const wh = new Webhook(signingSecret);
    const payload = wh.verify(rawBody, headers);

    console.log("✅ Verified Payload:", payload);

    const { type, data } = payload as any;
    if (type?.startsWith("email.")) {
      const emailId = data?.email_id;
      const status = type.split(".")[1];

      console.log(`📨 Email Event: ${emailId} → ${status}`);

      if (emailId && status) {
        const { error } = await supabase.rpc("verify_claims", {
          p_email_id: emailId,
          p_status: status,
        });

        if (error) {
          console.error("❌ Supabase RPC error:", error);
        } else {
          console.log("✅ Supabase updated successfully");
        }
      }
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
