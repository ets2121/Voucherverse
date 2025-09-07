import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Don't cache this route

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vouchers (*),
        product_ratings (*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (error) {
      console.error('Products fetch error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Products Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
