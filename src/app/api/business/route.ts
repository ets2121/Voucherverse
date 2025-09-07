import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  const businessId = 1; // Hardcoded for single business context

  try {
    const { data, error } = await adminSupabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('Business fetch error:', error);
      throw new Error(error.message);
    }

    if (!data) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Business Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
