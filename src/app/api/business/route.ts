import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithTimezone } from '@/lib/utils';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  const businessId = process.env.BUSINESS_ID || 1; 

  try {
    const query = supabase
      .from('business')
      .select('*')
      .eq('id', businessId)
      .single();

    const { data, error } = await fetchWithTimezone(query);

    if (error) {
      console.error('Supabase business fetch error:', error);
      // Pass the specific Supabase error message to the client
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Business with the specified ID not found.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('API Business route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
