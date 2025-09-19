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

  if (!businessId) {
    return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const today = formatDateTime(new Date(), { useDeviceTimeZone: true, format: 'YYYY-MM-DD', returnAs: 'string' });

    // Supabase query: fetch all products with voucher left join
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
      .range(from, to);

    const { data, error, count } = await fetchWithTimezone(query);

    if (error) {
      console.error('Supabase products fetch error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Post-process: filter vouchers, compute average rating, and assign keyword score
    const keywordPriority = [
      'Spatial', '1.1', 'January 1', '2.2', 'February 2', '3.3', 'March 3',
      '4.4', 'April 4', '5.5', 'May 5', '6.6', 'June 6', '7.7', 'July 7',
      '8.8', 'August 8', '9.9', 'September 9', '10.10', 'October 10',
      '11.11', 'November 11', '12.12', 'December 12'
    ];

    const processedData = data?.map(p => {
      const singleVoucher = Array.isArray(p.voucher) ? p.voucher[0] : p.voucher;
      const singleRating = Array.isArray(p.product_ratings) ? p.product_ratings[0] : p.product_ratings;

      // Filter valid vouchers
      let finalVoucher = null;
      if (singleVoucher) {
        const startDate = new Date(singleVoucher.start_date + 'T00:00:00Z');
        const endDate = new Date(singleVoucher.end_date + 'T23:59:59Z');
        const now = new Date();
        if (singleVoucher.is_promo && now >= startDate && now <= endDate) {
          finalVoucher = singleVoucher;
        }
      }

      // Compute average rating
      let avgRating = 0;
      if (singleRating) {
        const totalVotes = singleRating.one_star + singleRating.two_star + singleRating.three_star + singleRating.four_star + singleRating.five_star;
        avgRating = totalVotes
          ? (singleRating.one_star*1 + singleRating.two_star*2 + singleRating.three_star*3 + singleRating.four_star*4 + singleRating.five_star*5) / totalVotes
          : 0;
      }

      // Keyword priority score
      let keywordScore = 0;
      if (finalVoucher?.promo_type) {
        for (let i = 0; i < keywordPriority.length; i++) {
          if (finalVoucher.promo_type.includes(keywordPriority[i])) {
            keywordScore = keywordPriority.length - i; // higher score = higher priority
            break;
          }
        }
      }

      return {
        ...p,
        voucher: finalVoucher,
        product_ratings: singleRating || null,
        avg_rating: avgRating,
        has_priority: finalVoucher?.priority_promo || false,
        keyword_score: keywordScore
      };
    });

    // JS post-sort:
    // 1. Priority voucher first
    // 2. Keyword prioritization
    // 3. Highest discount
    // 4. Highest average rating
    // 5. created_at descending
    const sortedData = processedData.sort((a, b) => {
      if ((a.has_priority || false) !== (b.has_priority || false)) return b.has_priority ? 1 : -1;
      if ((a.keyword_score || 0) !== (b.keyword_score || 0)) return b.keyword_score - a.keyword_score;
      if ((a.voucher?.discount_amount || 0) !== (b.voucher?.discount_amount || 0)) return (b.voucher?.discount_amount || 0) - (a.voucher?.discount_amount || 0);
      if ((a.avg_rating || 0) !== (b.avg_rating || 0)) return (b.avg_rating || 0) - (a.avg_rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ data: sortedData, count });
  } catch (e: any) {
    console.error('API Products route error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
                                    }
