'use server';

import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    console.error('Failed to parse request body:', e.message);
    return NextResponse.json({ error: `Invalid request body: ${e.message}` }, { status: 400 });
  }

  const { voucher_id, user_email, business_id } = body;

  if (!voucher_id || !user_email || !business_id) {
    console.error('Missing required parameters in request', { voucher_id, user_email, business_id });
    return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  try {
    console.log('Calling voucher_claim RPC with:', { p_voucher_id: voucher_id, p_user_email: user_email, p_business_id: business_id });

    const { data, error } = await adminSupabase.rpc('voucher_claim', {
      p_voucher_id: voucher_id,
      p_user_email: user_email,
      p_business_id: business_id,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('Supabase RPC success. Data:', data);
    const responseText = data as string;

    if (responseText && responseText.toLowerCase().includes('successfully claimed')) {
       return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    if (responseText === 'promo fully claimed' || responseText === 'already claimed') {
      return NextResponse.json({ error: responseText }, { status: 409 });
    }
    
    if (typeof responseText === 'string' && responseText.length > 0) {
        return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    return NextResponse.json({ data: responseText }, { status: 200 });

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json(
      { error: e.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
