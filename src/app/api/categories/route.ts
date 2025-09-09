import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  try {
    // We want to fetch categories that are actually being used by active products
    // for the given business. This prevents showing empty category filters.
    const { data, error } = await supabase.rpc('get_business_product_categories', {
        p_business_id: parseInt(businessId, 10)
    });

    if (error) {
       console.error('Supabase categories fetch error:', error);
       return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Categories route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
