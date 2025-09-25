
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import StarRating from '@/components/shared/StarRating';
import { Tag, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import productCardConfig from '@/config/productCardConfig.json';
import { motion } from 'framer-motion';

interface ProductCardSmallProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCardSmall({ product, onClick }: ProductCardSmallProps) {
  const { voucher, name, price, product_ratings, product_images, id } = product;
  const { currency_symbol, display: displayConfig, badge: badgeConfig } = productCardConfig;
  
  const hasDiscount = voucher && voucher.discount_amount && price && price > 0;
  
  let discountedPrice: number | null = null;
  let discountPercent = 0;

  if (hasDiscount && price) {
    discountedPrice = price - voucher.discount_amount!;
    if (discountedPrice < 0) discountedPrice = 0;
    discountPercent = Math.min(Math.round((voucher.discount_amount! / price) * 100), 100);
  }

  const primaryImage = product_images?.find(img => img.is_primary && img.resource_type === 'image') || product_images?.find(img => img.resource_type === 'image');

  console.log(`ProductCardSmall (ID: ${id}): All images`, product_images);
  console.log(`ProductCardSmall (ID: ${id}): Selected primary image`, primaryImage);


  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col cursor-pointer h-full"
    >
      <div className="relative aspect-square w-full">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || name}
            fill
            data-ai-hint="product food"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
         {hasDiscount && discountPercent > 0 && (
            <Badge 
              variant={badgeConfig.discount_variant as any} 
              className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5"
            >
              <Tag className="w-2.5 h-2.5 mr-1"/> {discountPercent}%
            </Badge>
          )}
        {voucher?.promo_type && (
            <div className="absolute bottom-1.5 left-1.5 inline-block">
                <div className={badgeConfig.promo_type_classes}>
                  {voucher.promo_type}
                </div>
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
                      {currency_symbol}{discountedPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {currency_symbol}{price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-md font-bold text-foreground">
                    {currency_symbol}{price.toFixed(2)}
                  </p>
                )}
              </div>
            )}
            {displayConfig.show_rating_on_card && (
              <StarRating 
                  ratingData={product_ratings} 
                  showReviewCount={false} 
                  showAverage={true} 
                  starSize='w-3.5 h-3.5'
              />
            )}
        </div>
      </div>
    </motion.div>
  );
}
