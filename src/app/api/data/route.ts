import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export const revalidate = 0; // Don't cache this route

export async function GET() {
  const businessId = 1; // Hardcoded for single business context

  try {
    const [
      businessRes,
      productsRes,
      servicesRes,
      testimonialsRes
    ] = await Promise.all([
      adminSupabase.from('businesses').select('*').eq('id', businessId).single(),
      adminSupabase.from('products').select(`
        *,
        vouchers (*),
        product_ratings (*)
      `).eq('business_id', businessId).eq('is_active', true),
      adminSupabase.from('business_services').select('*').eq('business_id', businessId),
      adminSupabase.from('testimonials').select('*').eq('business_id', businessId)
    ]);
    
    if (businessRes.error) throw new Error(`Business fetch error: ${businessRes.error.message}`);
    if (productsRes.error) throw new Error(`Products fetch error: ${productsRes.error.message}`);
    if (servicesRes.error) throw new Error(`Services fetch error: ${servicesRes.error.message}`);
    if (testimonialsRes.error) throw new Error(`Testimonials fetch error: ${testimonialsRes.error.message}`);

    const data = {
      business: businessRes.data,
      products: productsRes.data,
      services: servicesRes.data,
      testimonials: testimonialsRes.data,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Data Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
