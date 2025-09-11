
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Product, Voucher, ProductReview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/shared/StarRating';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, Tag, MessageSquareQuote } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import priceConfig from '@/../public/priceConfig.json';
import { useAppContext } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import ProductReviews from '@/components/shared/ProductReviews';
import useSWR from 'swr';


interface ProductCardProps {
  product: Product;
  onClaimVoucher: (voucher: Voucher) => void;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch reviews');
    }
    return res.json();
});

const CountdownTimer = ({ expiryDate }: { expiryDate: string }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const end = new Date(expiryDate);
    let delta = differenceInSeconds(end, now);

    if (delta <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    const seconds = Math.floor(delta % 60);

    return { days, hours, minutes, seconds };
  };
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const isExpired = !Object.values(timeLeft).some(val => val > 0);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      {isExpired ? (
        <span>Expired</span>
      ) : (
        <span className="font-mono tracking-widest">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${String(timeLeft.hours).padStart(2, '0')}h `}
            {`${String(timeLeft.minutes).padStart(2, '0')}m `}
            {`${String(timeLeft.seconds).padStart(2, '0')}s`}
        </span>
      )}
    </div>
  );
};


export default function ProductCard({ product, onClaimVoucher }: ProductCardProps) {
  const { openReviewModal } = useAppContext();
  const voucher = product.voucher;
  const currencySymbol = priceConfig.currency_symbol;

  const { data: reviews, error: reviewsError, isLoading: reviewsLoading } = useSWR<ProductReview[]>(
    `/api/reviews?product_id=${product.id}`, 
    fetcher
  );

  const claimedPercentage = voucher?.max_claims 
    ? (voucher.claimed_count / voucher.max_claims) * 100 
    : 0;

  const claimsLeft = voucher?.max_claims ? voucher.max_claims - voucher.claimed_count : 'Unlimited';

  const isSoldOut = voucher?.max_claims ? voucher.claimed_count >= voucher.max_claims : false;

  const hasDiscount = voucher && voucher.discount_amount && product.price && product.price > 0;
  
  let discountedPrice = null;
  let discountPercent = 0;

  if (hasDiscount && product.price) {
    discountedPrice = product.price - voucher.discount_amount!;
    if (discountedPrice < 0) discountedPrice = 0;

    discountPercent = Math.min(Math.round((voucher.discount_amount! / product.price) * 100), 100);
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden bg-card transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
           <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={product.image_url || `https://picsum.photos/400/300?random=${product.id}`}
              alt={product.name}
              fill
              data-ai-hint="product food"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {hasDiscount && discountPercent > 0 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                <Tag className="w-3 h-3 mr-1"/> {discountPercent}% OFF
              </Badge>
            )}
            {voucher?.promo_type && (
                <div className="absolute bottom-2 left-2 inline-block">
                    <div className="relative px-3 py-1 text-xs font-bold text-primary-foreground bg-primary rounded-md overflow-hidden">
                      <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-background"></div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-background"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-background"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-background"></div>
                      <span className="relative z-10">{voucher.promo_type}</span>
                    </div>
                </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <CardTitle className="font-headline pt-1 text-xl line-clamp-1">{product.name}</CardTitle>
            
            {product.price && (
              <div className="flex items-baseline gap-2">
                {discountedPrice !== null ? (
                  <>
                    <p className="text-2xl font-bold text-primary">
                      {currencySymbol}{discountedPrice.toFixed(2)}
                    </p>
                    <p className="text-md text-muted-foreground line-through">
                      {currencySymbol}{product.price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {currencySymbol}{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            )}
            
            <StarRating 
                ratingData={product.product_ratings} 
                showReviewCount={true}
            />
            <CardDescription className="text-sm line-clamp-3 pt-1">{product.short_description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
           {voucher && !hasDiscount && (
             <div className="bg-primary/10 p-3 rounded-lg border border-dashed border-primary space-y-2 flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-primary">{voucher.description}</p>
                    <p className="text-xs text-primary/80">
                      Special voucher available!
                    </p>
                  </div>
              </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-3 p-4 pt-2 mt-auto">
           <Button variant="outline" size="sm" className="w-full" onClick={() => openReviewModal(product)}>
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Write a review
            </Button>
          {voucher && (
            <>
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-muted-foreground font-medium">Vouchers Claimed</p>
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={voucher.claimed_count}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs font-bold text-accent"
                      >
                        {voucher.max_claims ? `${claimsLeft} left` : 'Unlimited claims'}
                      </motion.p>
                    </AnimatePresence>
                </div>
                {voucher.max_claims && (
                    <Progress value={claimedPercentage} className="h-2" />
                )}
                <div className="mt-2">
                    <CountdownTimer expiryDate={voucher.end_date} />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => onClaimVoucher(voucher)}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'Fully Claimed' : 'Claim Voucher'}
              </Button>
            </>
          )}
           {!voucher && (
             <p className="w-full text-center text-sm text-muted-foreground pt-4">No voucher available for this product.</p>
           )}
            <div className="w-full pt-2">
              <Separator className="my-2" />
              <ProductReviews 
                reviews={reviews} 
                isLoading={reviewsLoading} 
                error={reviewsError} 
              />
            </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
