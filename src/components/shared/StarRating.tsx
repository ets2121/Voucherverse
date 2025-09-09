import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductRating } from '@/lib/types';

interface StarRatingProps {
  ratingData: ProductRating | null;
  showReviewCount?: boolean;
  showAverage?: boolean;
  starSize?: string;
}

export function calculateAverageRating(ratingData: ProductRating | null) {
  if (!ratingData) {
    return { average: 0, total: 0 };
  }

  const ratings = [
    ratingData.one_star,
    ratingData.two_star,
    ratingData.three_star,
    ratingData.four_star,
    ratingData.five_star,
  ];
  const totalRatings = ratings.reduce((acc, count) => acc + count, 0);
  if (totalRatings === 0) {
    return { average: 0, total: 0 };
  }

  const weightedSum = ratings.reduce((acc, count, i) => acc + count * (i + 1), 0);
  const averageRating = weightedSum / totalRatings;

  return { average: parseFloat(averageRating.toFixed(1)), total: totalRatings };
}

export default function StarRating({ 
  ratingData, 
  showReviewCount = true, 
  showAverage = true,
  starSize = 'h-4 w-4'
}: StarRatingProps) {
  const { average, total } = calculateAverageRating(ratingData);
  
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <Star
                key={i}
                className={cn('text-yellow-400', starSize,
                    starValue <= average ? 'fill-yellow-400' : 'fill-transparent'
                )}
            />
          );
        })}
      </div>
       {(showAverage || showReviewCount) && (
        <span className="text-xs text-muted-foreground">
          {showAverage && average > 0 && average.toFixed(1)}
          {showAverage && showReviewCount && average > 0 && <span className="mr-1"> </span>}
          {showReviewCount && `(${total} reviews)`}
        </span>
      )}
    </div>
  );
}
