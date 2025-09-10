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

  const { p_business_id, p_customer_name, p_customer_email, p_message, p_rating } = body;

  if (!p_business_id || !p_customer_email || !p_message || !p_rating) {
    const missingParams = [
      !p_business_id && 'p_business_id',
      !p_customer_email && 'p_customer_email',
      !p_message && 'p_message',
      !p_rating && 'p_rating',
    ]
      .filter(Boolean)
      .join(', ');
    return NextResponse.json({ error: `Missing required parameters: ${missingParams}.` }, { status: 400 });
  }

  if (typeof p_rating !== 'number' || p_rating < 1 || p_rating > 5) {
    return NextResponse.json({ error: 'Invalid rating. Must be an integer between 1 and 5.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc('insert_testimonial', {
      p_business_id,
      p_customer_name: p_customer_name || null,
      p_customer_email,
      p_message,
      p_rating,
    });

    if (error) {
      console.error('Supabase RPC error in insert_testimonial:', error);
      // Check for unique constraint violation message
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json({ error: 'Email already used for this business', status: 'error' }, { status: 409 });
      }
      return NextResponse.json({ error: 'A database error occurred during the testimonial submission.' }, { status: 500 });
    }

    const responseText = data as string;

    if (responseText === 'Testimonial inserted successfully') {
      return NextResponse.json({ message: responseText, status: 'success' });
    } else {
      // Handles "Email already used for this business" from the RPC logic
      return NextResponse.json({ error: responseText, status: 'error' }, { status: 409 });
    }
  } catch (e: any) {
    console.error('Full API testimonial route error:', e);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
