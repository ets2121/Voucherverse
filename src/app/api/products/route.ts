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
    const today = new Date().toISOString();

    const { data, error } = await supabase
      .from('product')
      .select(`
        *,
        voucher!left(*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .filter('voucher.id', 'is', null) // Temporarily include products without vouchers
      .or(`voucher.start_date.lte.${today},voucher.end_date.gte.${today},voucher.id.is.null`);

    if (error) {
       console.error('Supabase products fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }
    
    // Fetch product_ratings separately
    const productIds = data?.map(p => p.id) || [];
    if (productIds.length > 0) {
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('product_ratings')
        .select('*')
        .in('product_id', productIds);

      if (ratingsError) {
        console.error('Supabase ratings fetch error:', ratingsError);
        // continue without ratings if it fails
      } else {
        // Attach ratings to products
        data?.forEach(product => {
          product.product_ratings = ratingsData?.find(r => r.product_id === product.id) || null;
        });
      }
    }


    // Post-process to flatten voucher
     const processedData = data?.map(p => {
        // If voucher is an array, take the first one, otherwise use the object or null.
        const singleVoucher = Array.isArray(p.voucher) ? p.voucher[0] : p.voucher;
        
        // Ensure voucher is valid (not expired, etc.)
        if (singleVoucher) {
            const startDate = new Date(singleVoucher.start_date);
            const endDate = new Date(singleVoucher.end_date);
            const now = new Date();
            if (now < startDate || now > endDate) {
                return { ...p, voucher: null }; // Invalidate expired voucher
            }
        }
        return { ...p, voucher: singleVoucher || null };
     });


    return NextResponse.json(processedData);
  } catch (e: any) {
    console.error('API Products route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
