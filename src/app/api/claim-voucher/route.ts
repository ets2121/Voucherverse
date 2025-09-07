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
      // More specific error messages
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json({ error: 'You have already claimed this voucher.' }, { status: 409 });
      }
      if (error.message.includes('Voucher has reached its maximum claim limit')) {
        return NextResponse.json({ error: 'This voucher is fully claimed.' }, { status: 409 });
      }
       if (error.message.includes('function voucher_claim')) {
         return NextResponse.json({ error: 'The voucher claim function is not available in the database.' }, { status: 500 });
       }
      return NextResponse.json({ error: 'An unexpected error occurred during claim.' }, { status: 500 });
    }

    // The RPC returns the voucher code on success
    return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: data });
  } catch (e: any) {
    console.error('API claim-voucher error:', e);
    // This will catch JSON parsing errors or other unexpected issues
    return NextResponse.json({ error: e.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
