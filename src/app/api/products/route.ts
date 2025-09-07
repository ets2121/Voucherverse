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
    const { data, error } = await supabase
      .from('product')
      .select(`
        *,
        voucher!left(*),
        product_ratings(*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (error) {
       console.error('Supabase products fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }
    
    // Post-process to flatten voucher and ratings, and filter invalid vouchers
     const processedData = data?.map(p => {
        // If voucher is an array, take the first one, otherwise use the object or null.
        const singleVoucher = Array.isArray(p.voucher) ? p.voucher[0] : p.voucher;
        const singleRating = Array.isArray(p.product_ratings) ? p.product_ratings[0] : p.product_ratings;
        
        let finalVoucher = null;
        // Ensure voucher is valid (not expired, etc.)
        if (singleVoucher) {
            const startDate = new Date(singleVoucher.start_date);
            const endDate = new Date(singleVoucher.end_date);
            const now = new Date();
            if (now >= startDate && now <= endDate) {
                finalVoucher = singleVoucher;
            }
        }
        // remove the original voucher and product_ratings array from the product object
        const { voucher, product_ratings, ...rest } = p;
        
        return { 
          ...rest, 
          voucher: finalVoucher,
          product_ratings: singleRating || null
        };
     });


    return NextResponse.json(processedData);
  } catch (e: any) {
    console.error('API Products route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
