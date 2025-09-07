import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductRating } from '@/lib/types';

interface StarRatingProps {
  ratingData: ProductRating | null;
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

export default function StarRating({ ratingData }: StarRatingProps) {
  const { average, total } = calculateAverageRating(ratingData);
  const fullStars = Math.floor(average);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <Star
                key={i}
                className={cn('h-4 w-4 text-yellow-400', 
                    starValue <= average ? 'fill-yellow-400' : 'fill-transparent'
                )}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">{average.toFixed(1)} ({total} reviews)</span>
    </div>
  );
}
