
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithTimezone } from '@/lib/utils';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  try {
    const query = supabase
      .from('testimonials')
      .select('*')
      .eq('business_id', businessId)
      .gte('rating', 4) // Only fetch ratings greater than or equal to 4
      .order('created_at', { ascending: false }); // Order by newest first
      
    const { data, error } = await fetchWithTimezone(query);
      
    if (error) {
      console.error('Supabase testimonials fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Testimonials route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
