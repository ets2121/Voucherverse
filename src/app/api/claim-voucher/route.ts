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
      // Forward the specific error from Supabase
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // The RPC function returns a plain text string.
    // The frontend expects a `voucher_code` for successful claims.
    const responseText = data as string;

    if (responseText && responseText.toLowerCase().includes('successfully claimed')) {
       return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    // Handle known error messages from the RPC
    if (responseText === 'promo fully claimed' || responseText === 'already claimed') {
      return NextResponse.json({ error: responseText }, { status: 409 });
    }
    
    // For any other text response from the RPC, treat it as a success/voucher code
    if (typeof responseText === 'string' && responseText.length > 0) {
        return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }
    
    // Fallback for unexpected responses
    return NextResponse.json({ data: responseText }, { status: 200 });

  } catch (e: any) {
    console.error('API claim-voucher route error:', e);
    return NextResponse.json(
      { error: e.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
