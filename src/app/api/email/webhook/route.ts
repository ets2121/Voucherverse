'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createHmac } from 'crypto';

const signingSecret = process.env.RESEND_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    // Dump ALL headers for debugging
    const headersDump = Object.fromEntries(request.headers);
    console.log("=== Incoming Webhook Headers ===");
    console.log(headersDump);

    // Get raw body
    const rawBody = await request.text();
    console.log("=== Raw Webhook Body ===");
    console.log(rawBody);

    // Try to fetch signature
    const signature = request.headers.get('Resend-Signature');
    console.log("=== Extracted Signature Header ===");
    console.log(signature);

    if (!signingSecret || !signature) {
      console.warn('Missing signing secret or signature header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Compute HMAC SHA256 using signing secret
    const hmac = createHmac('sha256', signingSecret)
      .update(rawBody)
      .digest('base64'); // Resend sends base64

    console.log("=== Computed HMAC ===");
    console.log(hmac);

    if (hmac !== signature) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse JSON payload AFTER verification
    const payload = JSON.parse(rawBody);
    console.log("=== Parsed Payload ===");
    console.log(payload);

    const { type, data } = payload;

    if (type?.startsWith('email.')) {
      const emailId = data?.email_id;
      const status = type.split('.')[1]; // e.g., sent, delivered, bounced

      if (!emailId || !status) {
        console.warn('Webhook payload missing email_id or status', payload);
        return NextResponse.json({ error: 'Incomplete payload' }, { status: 400 });
      }

      // Call RPC in Supabase
      const { error: rpcError } = await supabase.rpc('verify_claims', {
        p_email_id: emailId,
        p_status: status,
      });

      if (rpcError) {
        console.error(`Error calling verify_claims for email_id ${emailId}:`, rpcError);
      } else {
        console.log(`Webhook processed: email_id=${emailId}, status=${status}`);
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (e: any) {
    console.error('Error processing webhook:', e.message);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
