'use server';

import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    console.error('Failed to parse request body:', e.message);
    return NextResponse.json({ error: "API Error: Invalid request body." }, { status: 400 });
  }

  const { voucher_id, user_email, business_id } = body;

  if (!voucher_id || !user_email || !business_id) {
    const missingParams = [
        !voucher_id && 'voucher_id',
        !user_email && 'user_email',
        !business_id && 'business_id'
    ].filter(Boolean).join(', ');
    const errorMessage = `API Error: Missing required parameters: ${missingParams}.`;
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
      return NextResponse.json({ error: "API Error: Supabase RPC failed." }, { status: 400 });
    }

    console.log('Supabase RPC success. Data:', rpcResponse);
    const responseText = rpcResponse as string;

    if (responseText === 'promo fully claimed') {
      return NextResponse.json({ error: "API Error: Voucher is fully claimed." }, { status: 409 });
    }
    if (responseText === 'already claimed') {
      return NextResponse.json({ error: "API Error: You have already claimed this voucher." }, { status: 409 });
    }

    if (typeof responseText === 'string' && responseText.length > 0) {
      return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: responseText });
    }

    return NextResponse.json({ data: responseText }, { status: 200 });

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json(
      { error: "API Error: An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}
