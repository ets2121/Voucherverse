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
      .from('business_services')
      .select('*')
      .eq('business_id', businessId);
      
    const { data, error } = await fetchWithTimezone(query);

    if (error) {
       console.error('Supabase services fetch error:', error);
       return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Services route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
