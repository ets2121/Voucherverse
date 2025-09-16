'use server';

import { NextResponse } from 'next/server';
import { Webhook } from 'resend';
import { supabase } from '@/lib/supabase';

const signingSecret = process.env.RESEND_WEBHOOK_SECRET!;
const webhook = new Webhook(signingSecret);

export async function POST(req: Request) {
  try {
    // Raw body
    const rawBody = await req.text();

    // Log lahat ng headers
    console.log("📩 Incoming webhook headers:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    // Signature header
    const signature = req.headers.get('resend-signature');
    console.log("🔑 Resend Secret (env):", signingSecret ? "[LOADED]" : "[MISSING]");
    console.log("📝 Signature Header:", signature || "❌ Not found");
    console.log("📦 Raw Body:", rawBody);

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    // Verify using SDK
    const { payload } = webhook.verifySignature(rawBody, signature);

    console.log("✅ Verified Payload:", payload);

    const { type, data } = payload as any;
    if (type?.startsWith('email.')) {
      const emailId = data?.email_id;
      const status = type.split('.')[1];

      console.log(`📨 Email Event: ${emailId} → ${status}`);

      if (emailId && status) {
        const { error: rpcError } = await supabase.rpc('verify_claims', {
          p_email_id: emailId,
          p_status: status,
        });

        if (rpcError) {
          console.error("❌ Supabase RPC error:", rpcError);
        } else {
          console.log("✅ Supabase updated successfully");
        }
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook processing failed:", err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
