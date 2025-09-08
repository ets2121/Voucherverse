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
      // Make DB error more user-friendly
      const userMessage = rpcError.message.includes('duplicate key') 
        ? 'This voucher has already been claimed by this email address.' 
        : 'A database error occurred. Please try again later.';
      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    console.log('Supabase RPC success. Data:', rpcResponse);
    const responseText = rpcResponse as string;

    // Handle specific, known string responses from the RPC
    if (responseText === 'promo fully claimed') {
      return NextResponse.json({ error: 'This voucher is fully claimed and no longer available.' }, { status: 409 });
    }
    if (responseText === 'already claimed') {
      return NextResponse.json({ error: 'You have already claimed this voucher with this email.' }, { status: 409 });
    }

    // Handle success case where a voucher code is returned
    if (typeof responseText === 'string' && responseText.length > 0) {
      return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    // Fallback for any other successful but unexpected response
    return NextResponse.json({ data: responseText }, { status: 200 });

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred. Please contact support.' },
      { status: 500 }
    );
  }
}
