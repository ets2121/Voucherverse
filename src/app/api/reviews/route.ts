import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithTimezone } from '@/lib/utils';

export const revalidate = 0; // Don't cache reviews, always get the latest

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  }

  try {
    const query = supabase
      .from('product_reviews')
      .select('*') 
      .eq('product_id', productId)
      .not('review', 'is', null)
      .order('created_at', { ascending: false });

    const { data, error } = await fetchWithTimezone(query);

    if (error) {
      console.error('Supabase reviews fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Reviews route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
