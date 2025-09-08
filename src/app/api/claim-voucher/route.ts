'use server';

import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    console.error('API Error: Failed to parse request body.', e);
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const { voucher_id, user_email, business_id } = body;

  if (!voucher_id || !user_email || !business_id) {
    const missingParams = [
        !voucher_id && 'voucher_id',
        !user_email && 'user_email',
        !business_id && 'business_id'
    ].filter(Boolean).join(', ');
    const errorMessage = `Missing required parameters: ${missingParams}.`;
    console.error(errorMessage, { voucher_id, user_email, business_id });
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  try {
    console.log('Calling voucher_claim RPC with:', { p_voucher_id: voucher_id, p_user_email: user_email, p_business_id: business_id });

    const { data: rpcResponse, error: rpcError } = await adminSupabase.rpc('voucher_claim', {
      p_voucher_id: voucher_id,
      p_user_email: user_email,
      p_business_id: business_id,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return NextResponse.json({ error: "A database error occurred." }, { status: 500 });
    }

    console.log('Supabase RPC success. Response text:', rpcResponse);
    const responseText = rpcResponse as string;

    if (responseText === 'Successfully claimed') {
      return NextResponse.json({ message: 'Voucher claimed successfully!', status: 'success' });
    } else {
       // Handles 'Already claimed' and 'Promo fully claimed'
       return NextResponse.json({ error: responseText, status: 'error' }, { status: 409 });
    }

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json(
      { error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}