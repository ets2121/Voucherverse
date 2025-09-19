import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithTimezone } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatDateTime';
export const revalidate = 0; // Don't cache this route

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const timezone = searchParams.get('timezone');

  
  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const today = formatDateTime(new Date(),{useDeviceTimeZone: true, format:'YYYY-MM-DD', returnAs:'string'});
   // const today = "2025-09-19";

const query = supabase
  .from("product")
  .select(
    `
    *,
    voucher!left(*),
    product_ratings(*),
    product_category(*),
    product_ratings!inner(
      one_star,
      two_star,
      three_star,
      four_star,
      five_star
    )
  `,
    { count: "exact" }
  )
  .eq("business_id", businessId)
  .eq("is_active", true)
  .or(`voucher.start_date.lte.${today},voucher.end_date.gte.${today}`)
  .eq("voucher.is_promo", true)
  .order("voucher.priority_promo", { ascending: false }) // ✅ use computed column
  .order("voucher.is_promo", { ascending: false })
  .order("voucher.start_date", { ascending: true })
  .order("voucher.end_date", { ascending: true })
  .order("voucher.discount_amount", { ascending: false })
  .order(
    `(product_ratings.one_star*1 + product_ratings.two_star*2 + product_ratings.three_star*3 + product_ratings.four_star*4 + product_ratings.five_star*5) / 
     NULLIF((product_ratings.one_star + product_ratings.two_star + product_ratings.three_star + product_ratings.four_star + product_ratings.five_star),0)`,
    { ascending: false }
  )
  .order("created_at", { ascending: false })
  .range(from, to);

    const { data, error, count } = await fetchWithTimezone(query);

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
        const startDate = new Date(singleVoucher.start_date+'T00:00:00Z');
        const endDate = new Date(singleVoucher.end_date+'T23:59:59Z');
        const now = formatDateTime(new Date(),{useDeviceTimeZone: true, format:'YYYY-MM-DD Hh:mm:ss', returnAs:'date'});
        if (now >= startDate && now <= endDate) {
          finalVoucher = singleVoucher;
        }
      }

      const { voucher, product_ratings, ...rest } = p;

      return {
        ...rest,
        voucher: finalVoucher,
        product_ratings: singleRating || null,
      };
    });

    return NextResponse.json({ data: processedData, count });
  } catch (e: any) {
    console.error('API Products route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
