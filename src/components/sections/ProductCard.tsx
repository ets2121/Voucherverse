
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product, Voucher, ProductReview, ProductImage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/shared/StarRating';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, Tag, MessageSquareQuote, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import productCardConfig from '@/config/productCardConfig.json';
import { useAppContext } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import ProductReviews from '@/components/shared/ProductReviews';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import useCountdown from '@/hooks/useCountdown';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


interface ProductCardProps {
  product: Product;
  onClaimVoucher: (voucher: Voucher) => void;
  isDetailedView?: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch reviews');
    }
    return res.json();
});

const CountdownTimer = ({ expiryDate }: { expiryDate: string }) => {
  const timeLeft = useCountdown(expiryDate);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      {timeLeft.isExpired ? (
        <span>Promo expired</span>
      ) : (
        <span className="font-mono tracking-widest">
            {`${timeLeft.days}d :`}
            {`${String(timeLeft.hours).padStart(2, '0')}h :`}
            {`${String(timeLeft.minutes).padStart(2, '0')}m :`}
            {`${String(timeLeft.seconds).padStart(2, '0')}s `}
          <span className="font-sans gap-0"><strong>Left</strong></span>
        </span>
      )}
    </div>
  );
};

const MediaCarousel = ({ images, productName }: { images: ProductImage[], productName: string }) => {
    if (!images || images.length === 0) {
        return (
            <div className="relative h-48 w-full overflow-hidden md:h-full md:min-h-[300px] md:rounded-l-lg md:rounded-r-none bg-muted flex items-center justify-center">
                 <div className="flex flex-col items-center text-muted-foreground">
                    <ImageOff className="h-12 w-12" />
                    <p className="mt-2 text-sm">No image available</p>
                </div>
            </div>
        );
    }
    
    return (
        <Carousel className="relative h-48 w-full overflow-hidden md:h-full md:min-h-[300px] group">
            <CarouselContent>
                {images.map((media) => (
                    <CarouselItem key={media.id} className="w-full h-full">
                         <div className="relative w-full h-full md:rounded-l-lg md:rounded-r-none">
                            {media.resource_type === 'image' ? (
                                <Image
                                    src={media.image_url}
                                    alt={media.alt_text || productName}
                                    fill
                                    className="object-contain"
                                    data-ai-hint="product retail"
                                />
                            ) : (
                                <video
                                    src={media.image_url}
                                    controls
                                    className="w-full h-full object-contain"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {images.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
            )}
        </Carousel>
    )
}


export default function ProductCard({ product, onClaimVoucher, isDetailedView = false }: ProductCardProps) {
  const { openReviewModal } = useAppContext();
  const voucher = product.voucher;
  const { currency_symbol, display: displayConfig, badge: badgeConfig } = productCardConfig;
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
  
  const isLongDescription = product.short_description && product.short_description.length > 100;
  const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);

  const cardContent = (
      <>
        <div className="relative">
            <MediaCarousel images={product.product_images} productName={product.name} />
            {hasDiscount && discountPercent > 0 && (
                <Badge 
                variant={badgeConfig.discount_variant as any} 
                className="absolute top-2 right-2 z-10"
                >
                <Tag className="w-3 h-3 mr-1"/> {discountPercent}% OFF
                </Badge>
            )}
            {voucher?.promo_type && (
                <div className="absolute bottom-2 left-2 z-10 inline-block">
                    <div className={badgeConfig.promo_type_classes}>
                        {voucher.promo_type}
                    </div>
                </div>
            )}
        </div>
        <div className="flex flex-col flex-grow">
          <CardHeader className="p-4 space-y-2">
            <CardTitle className="font-headline pt-1 text-xl lg:text-2xl line-clamp-1">{product.name}</CardTitle>
            
            {product.price && (
              <div className="flex items-baseline gap-2">
                {discountedPrice !== null ? (
                  <>
                    <p className="text-2xl lg:text-3xl font-bold text-primary">
                      {currency_symbol}{discountedPrice.toFixed(2)}
                    </p>
                    <p className="text-md lg:text-lg text-muted-foreground line-through">
                      {currency_symbol}{product.price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {currency_symbol}{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            )}
            
            {displayConfig.show_rating_on_card && (
              <StarRating 
                  ratingData={product.product_ratings} 
                  showReviewCount={displayConfig.show_review_count_on_card}
              />
            )}
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
             {displayConfig.show_description_on_card && product.short_description && (
              <div className="w-full pt-4">
                  <h4 className="font-headline text-md font-semibold">Description</h4>
                  <CardDescription className={cn("text-sm pt-1", !isDetailedView && !isDescriptionExpanded && "line-clamp-2")}>
                      {product.short_description}
                  </CardDescription>
                  {!isDetailedView && isLongDescription && (
                      <Button variant="link" size="sm" onClick={toggleDescription} className="p-0 h-auto text-xs">
                          {isDescriptionExpanded ? 'See less' : 'See more'}
                      </Button>
                  )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-3 p-4 pt-2 mt-auto">
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

              <Button variant="outline" size="sm" className="w-full" onClick={() => openReviewModal(product)}>
                  <MessageSquareQuote className="mr-2 h-4 w-4" />
                  Write a review
              </Button>
              
              {isDetailedView && displayConfig.show_reviews_on_card && (
                <div className="w-full pt-2">
                  <Separator className="my-2" />
                  <ProductReviews 
                    reviews={reviews} 
                    isLoading={reviewsLoading} 
                    error={reviewsError} 
                  />
                </div>
              )}
          </CardFooter>
        </div>
      </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className={cn(
          "h-full flex flex-col overflow-hidden bg-card transition-all duration-300",
          !isDetailedView && "group hover:shadow-lg hover:-translate-y-1",
          isDetailedView && "md:grid md:grid-cols-2 md:gap-0"
        )}>
        {cardContent}
      </Card>
    </motion.div>
  );
}
