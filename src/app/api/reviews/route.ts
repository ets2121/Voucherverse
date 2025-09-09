
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Don't cache reviews, always get the latest

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  }

  try {
    // Query the source table directly and filter for actual reviews.
    // Let the Supabase client handle the timestamp conversion to a proper ISO 8601 string.
    // This is the most reliable way to ensure correct parsing in the browser.
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, created_at') 
      .eq('product_id', productId)
      .not('review', 'is', null) // Only fetch rows with a review text
      .order('created_at', { ascending: false });

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
