
'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

// The webhook handler function
export async function POST(request: Request) {
  // Check for the secret to ensure the request is from Resend
  const providedSecret = request.headers.get('authorization');
  if (!webhookSecret || `Bearer ${webhookSecret}` !== providedSecret) {
    console.warn('Webhook received with invalid or missing secret.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { type, data } = payload;
    
    // We only care about email delivery status events
    if (type.startsWith('email.')) {
        const emailId = data?.email_id;
        const status = type.split('.')[1]; // e.g., 'sent', 'delivered', 'bounced'

        if (!emailId || !status) {
            console.warn('Webhook payload missing email_id or status', payload);
            return NextResponse.json({ error: 'Incomplete webhook payload' }, { status: 400 });
        }
        
        // Call the RPC function to update the claim status in the database
        const { error: rpcError } = await supabase.rpc('verify_claims', {
            p_email_id: emailId,
            p_status: status,
        });

        if (rpcError) {
            console.error(`Error calling verify_claims for email_id ${emailId}:`, rpcError);
            // We return 200 even on DB error to prevent Resend from retrying.
            // The error is logged for debugging.
        } else {
            console.log(`Webhook processed: email_id=${emailId}, status=${status}`);
        }
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (e: any) {
    console.error('Error processing webhook:', e.message);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
