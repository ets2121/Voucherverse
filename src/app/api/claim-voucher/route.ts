'use server';

import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { voucher_id, user_email, business_id } = await request.json();

    if (!voucher_id || !user_email || !business_id) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const { data, error } = await adminSupabase.rpc('voucher_claim', {
      p_voucher_id: voucher_id,
      p_user_email: user_email,
      p_business_id: business_id,
    });

    if (error) {
      console.error('RPC voucher_claim error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // The RPC function returns a plain text string.
    const responseText = data as string;

    if (responseText === 'promo fully claimed' || responseText === 'already claimed') {
      return NextResponse.json({ error: responseText }, { status: 409 });
    }
    
    if (responseText && responseText.toLowerCase().includes('successfully claimed')) {
       // The frontend expects a `voucher_code` property. We'll send a generic success code.
       return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: 'CLAIMED' });
    }

    // Handle any other unexpected but non-error response from the RPC.
    // It might be the actual voucher code as plain text.
    if (typeof responseText === 'string' && responseText.length > 0) {
        return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    console.error('Unexpected RPC response:', data);
    return NextResponse.json({ error: 'An unexpected response was received from the server.' }, { status: 500 });

  } catch (e: any) {
    console.error('API claim-voucher route error:', e);
    return NextResponse.json(
      { error: e.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
