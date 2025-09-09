
'use client';

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import type { ProductReview } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MessageSquareDashed, AlertTriangle, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch reviews');
    }
    return res.json();
});

const ReviewSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/5" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
);

export default function ProductReviews({ productId }: { productId: number }) {
  const { data: reviews, error, isLoading } = useSWR<ProductReview[]>(
    `/api/reviews?product_id=${productId}`, 
    fetcher
  );

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

        {!isLoading && !error && reviews && reviews.length > 0 && (
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <div key={review.id}>
                        <div className="flex gap-3">
                             <UserCircle className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold">{review.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-sm text-foreground mt-1">{review.review}</p>
                            </div>
                        </div>
                        {index < reviews.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
