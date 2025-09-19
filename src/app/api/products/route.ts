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
    const query = supabase
  .from("product")
  .select(
    `
    *,
    voucher!left(*),
    product_ratings(*),
    product_category(*)
  `,
    { count: "exact" }
  )
  .eq("business_id", businessId)
  .eq("is_active", true)
  .gte("voucher.end_date", today)   // dito ilagay ang date filter
  .eq("voucher.is_promo", true)    // dito ang is_promo filter
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
