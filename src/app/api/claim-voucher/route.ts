'use server';

import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { voucher_id, user_email, business_id } = await request.json();

    if (!voucher_id || !user_email || !business_id) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // Call the RPC function
    const { data, error } = await adminSupabase.rpc('voucher_claim', {
      p_voucher_id: voucher_id,
      p_user_email: user_email,
      p_business_id: business_id,
    });

    if (error) {
      // This will catch database-level errors, like if the RPC function doesn't exist
      console.error('RPC voucher_claim error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Handle specific logical outcomes from the RPC function
    if (data === 'promo fully claimed' || data === 'already claimed') {
      // These are business logic "errors", but the call was successful
      return NextResponse.json({ error: data }, { status: 409 }); // 409 Conflict is a good status here
    }
    
    // On success, the RPC should return the voucher code or a success message.
    // The frontend expects a `voucher_code` property.
    if (typeof data === 'string' && data.length > 0) {
       const voucherCode = data.includes('successfully claimed') ? 'CLAIMED' : data;
       return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: voucherCode });
    }

    // Fallback for any other unexpected but non-error response from the RPC
    console.error('Unexpected RPC response:', data);
    return NextResponse.json({ error: 'An unexpected response was received from the server.' }, { status: 500 });

  } catch (e: any) {
    // This is the crucial part. It catches ANY error during the process,
    // including JSON parsing errors, network issues, or unexpected crashes.
    console.error('API claim-voucher route error:', e);
    return NextResponse.json(
      { error: e.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
