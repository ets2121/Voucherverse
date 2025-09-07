import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  try {
    const { data, error } = await adminSupabase
      .from('testimonials')
      .select('*')
      .eq('business_id', businessId);
      
    if (error) {
      console.error('Testimonials fetch error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Testimonials Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
