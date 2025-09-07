
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
      console.error('RPC voucher_claim error:', error);
      // Pass the specific Supabase error message to the client
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // The RPC returns a status message or a voucher code.
    // Check for specific error messages returned from the function logic.
    if (data === 'promo fully claimed' || data === 'already claimed') {
      return NextResponse.json({ error: data }, { status: 409 });
    }
    
    // On success, the RPC should return the voucher code or a success message.
    if (typeof data === 'string' && data.length > 0) {
       // The front-end expects a `voucher_code` property.
       // If the function just returns a success message, we can use that or a generic code.
       const voucherCode = data.includes('successfully claimed') ? 'CLAIMED' : data;
       return NextResponse.json({ message: 'Voucher claimed successfully!', voucher_code: voucherCode });
    }

    // Fallback for any other unexpected response from the RPC
    console.error('Unexpected RPC response:', data);
    return NextResponse.json({ error: 'An unexpected response was received from the server.' }, { status: 500 });

  } catch (e: any) {
    console.error('API claim-voucher error:', e);
    // This will catch JSON parsing errors or other unexpected issues
    return NextResponse.json({ error: e.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
