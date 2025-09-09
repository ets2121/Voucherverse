
'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const { p_business_id, p_product_id, p_rating, p_email, p_review } = body;

  if (!p_business_id || !p_product_id || !p_rating || !p_email) {
    const missingParams = [
      !p_business_id && 'p_business_id',
      !p_product_id && 'p_product_id',
      !p_rating && 'p_rating',
      !p_email && 'p_email',
    ]
      .filter(Boolean)
      .join(', ');
    return NextResponse.json({ error: `Missing required parameters: ${missingParams}.` }, { status: 400 });
  }
  
  if (typeof p_rating !== 'number' || p_rating < 1 || p_rating > 5) {
      return NextResponse.json({ error: 'Invalid rating. Must be an integer between 1 and 5.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc('rate_and_review_product', {
      p_business_id,
      p_product_id,
      p_rating,
      p_email,
      p_review: p_review || null, // Pass null if review is empty
    });

    if (error) {
      console.error('Supabase RPC error in rate_and_review_product:', error);
      return NextResponse.json({ error: 'A database error occurred during the review process.' }, { status: 500 });
    }

    // The RPC returns a text message
    const responseText = data as string;

    if (responseText === 'Success') {
      return NextResponse.json({ message: 'Thank you for your review!', status: 'success' });
    } else {
      // Handles "Invalid rating..." and "You have already submitted..."
      return NextResponse.json({ error: responseText, status: 'error' }, { status: 409 });
    }
  } catch (e: any) {
    console.error('Full API review route error:', e);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
