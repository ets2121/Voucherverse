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
    const { data, error } = await supabase
      .from('business_services')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error('Services fetch error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Services Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
