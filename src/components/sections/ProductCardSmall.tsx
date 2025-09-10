
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import StarRating from '@/components/shared/StarRating';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import priceConfig from '@/../public/priceConfig.json';
import { motion } from 'framer-motion';

interface ProductCardSmallProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCardSmall({ product, onClick }: ProductCardSmallProps) {
  const { voucher, name, price, product_ratings, image_url, id } = product;
  const currencySymbol = priceConfig.currency_symbol;
  
  const hasDiscount = voucher && voucher.discount_amount && price && price > 0;
  
  let discountedPrice: number | null = null;
  let discountPercent = 0;

  if (hasDiscount && price) {
    discountedPrice = price - voucher.discount_amount!;
    if (discountedPrice < 0) discountedPrice = 0;
    discountPercent = Math.min(Math.round((voucher.discount_amount! / price) * 100), 100);
  }

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col cursor-pointer h-full"
    >
      <div className="relative aspect-square w-full">
        <Image
          src={image_url || `https://picsum.photos/300/300?random=${id}`}
          alt={name}
          fill
          data-ai-hint="product food"
          className="object-cover"
        />
         {hasDiscount && discountPercent > 0 && (
            <Badge variant="destructive" className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5">
              <Tag className="w-2.5 h-2.5 mr-1"/> {discountPercent}%
            </Badge>
          )}
        {voucher?.promo_type && (
            <div className="absolute bottom-2 left-2">
                <p className="bg-destructive text-destructive-foreground text-xs font-semibold uppercase tracking-wider rounded-md px-2 py-1">
                    {voucher.promo_type}
                </p>
            </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight flex-grow">{name}</h3>
        <div className='mt-2'>
            {price && (
              <div className="flex items-baseline gap-1.5">
                {discountedPrice !== null ? (
                  <>
                    <p className="text-md font-bold text-primary">
                      {currencySymbol}{discountedPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {currencySymbol}{price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-md font-bold text-foreground">
                    {currencySymbol}{price.toFixed(2)}
                  </p>
                )}
              </div>
            )}
            <StarRating 
                ratingData={product_ratings} 
                showReviewCount={false} 
                showAverage={true} 
                starSize='w-3.5 h-3.5'
            />
        </div>
      </div>
    </motion.div>
  );
}
