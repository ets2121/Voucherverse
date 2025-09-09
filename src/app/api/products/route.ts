import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Don't cache this route

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const categoryId = searchParams.get('category_id');
  const searchQuery = searchParams.get('search');

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('product')
      .select(`
        *,
        voucher!left(*),
        product_ratings(*),
        product_category(*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchQuery) {
        // Using ilike for case-insensitive search on name and description
        query = query.or(`name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
       console.error('Supabase products fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }
    
    // Post-process to flatten voucher and ratings, and filter invalid vouchers
     const processedData = data?.map(p => {
        const singleVoucher = Array.isArray(p.voucher) ? p.voucher[0] : p.voucher;
        const singleRating = Array.isArray(p.product_ratings) ? p.product_ratings[0] : p.product_ratings;
        
        let finalVoucher = null;
        if (singleVoucher) {
            const startDate = new Date(singleVoucher.start_date);
            const endDate = new Date(singleVoucher.end_date);
            const now = new Date();
            if (now >= startDate && now <= endDate) {
                finalVoucher = singleVoucher;
            }
        }
        
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
