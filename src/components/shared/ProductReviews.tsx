
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { ProductReview } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MessageSquareDashed, AlertTriangle, UserCircle, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


const ReviewSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        ))}
    </div>
);


const IndividualStarRating = ({ rating, starSize = 'h-4 w-4' }: { rating: number, starSize?: string }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={cn('text-yellow-400', starSize, i < rating ? 'fill-yellow-400' : 'fill-transparent')}
            />
            ))}
        </div>
    )
}

interface ProductReviewsProps {
  reviews: ProductReview[] | undefined;
  isLoading: boolean;
  error: any;
}

const formatEmailForPrivacy = (email: string): string => {
    const atIndex = email.indexOf('@');
    if (atIndex < 1) return 'Anonymous'; // Not a valid email format

    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex);

    let maskedLocalPart;
    if (localPart.length <= 3) {
        maskedLocalPart = `${localPart.charAt(0)}**`;
    } else {
        maskedLocalPart = `${localPart.substring(0, 3)}***`;
    }

    return `${maskedLocalPart}${domainPart}`;
};


export default function ProductReviews({ reviews, isLoading, error }: ProductReviewsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const REVIEWS_DISPLAY_LIMIT = 3;
  const EXPAND_THRESHOLD = 5;

  const showToggleButton = reviews && reviews.length > EXPAND_THRESHOLD;
  const displayedReviews = showToggleButton && !isExpanded ? reviews.slice(0, REVIEWS_DISPLAY_LIMIT) : reviews;

  return (
    <div className="space-y-4">
        <h3 className="font-headline text-lg font-semibold">Customer Reviews</h3>
        
        {isLoading && <ReviewSkeleton />}
        
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not load reviews. Please try again later.</AlertDescription>
            </Alert>
        )}

        {!isLoading && !error && (!reviews || reviews.length === 0) && (
             <div className="text-center text-muted-foreground py-8">
                <MessageSquareDashed className="mx-auto h-10 w-10" />
                <p className="mt-4 text-sm font-medium">No reviews yet.</p>
                <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
        )}

        {!isLoading && !error && displayedReviews && displayedReviews.length > 0 && (
            <div className="space-y-6">
                {displayedReviews.map((review, index) => (
                    <div key={review.id}>
                        <div className="flex gap-3">
                             <UserCircle className="h-8 w-8 text-muted-foreground shrink-0 mt-1" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-semibold break-all">{formatEmailForPrivacy(review.email)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                </p>
                                <IndividualStarRating rating={review.rating} />
                                <p className="text-sm text-foreground pt-1">{review.review}</p>
                            </div>
                        </div>
                        {index < displayedReviews.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
            </div>
        )}
        
        {showToggleButton && (
            <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? 'Show less reviews' : `Show all ${reviews?.length} reviews`}
            </Button>
        )}
    </div>
  );
}
