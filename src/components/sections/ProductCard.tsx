'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/shared/StarRating';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket } from 'lucide-react';
import type { Voucher } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onClaimVoucher: (voucher: Voucher) => void;
}

export default function ProductCard({ product, onClaimVoucher }: ProductCardProps) {
  const primaryVoucher = product.voucher?.find(v => v.is_promo);

  if (!primaryVoucher) return null;

  const claimedPercentage = primaryVoucher.max_claims 
    ? (primaryVoucher.claimed_count / primaryVoucher.max_claims) * 100 
    : 0;

  const claimsLeft = primaryVoucher.max_claims ? primaryVoucher.max_claims - primaryVoucher.claimed_count : 'Unlimited';

  const isSoldOut = primaryVoucher.max_claims ? primaryVoucher.claimed_count >= primaryVoucher.max_claims : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary transition-all duration-300">
        <CardHeader>
          <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
            <Image
              src={product.image_url || `https://picsum.photos/400/300?random=${product.id}`}
              alt={product.name}
              fill
              data-ai-hint="product food"
              className="object-cover"
            />
          </div>
          <StarRating ratingData={product.product_ratings} />
          <CardTitle className="font-headline pt-2">{product.name}</CardTitle>
          <CardDescription>{product.short_description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="bg-primary/10 p-4 rounded-lg border border-dashed border-primary">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-lg text-primary">{primaryVoucher.description}</p>
                <p className="text-sm text-primary/80">
                  {`Save ${primaryVoucher.discount_amount}% on this item!`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-muted-foreground font-medium">Vouchers Claimed</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={primaryVoucher.claimed_count}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-bold text-accent"
                >
                  {primaryVoucher.max_claims ? `${claimsLeft} left` : 'Unlimited claims'}
                </motion.p>
              </AnimatePresence>
            </div>
            {primaryVoucher.max_claims && (
              <Progress value={claimedPercentage} className="h-2" />
            )}
          </div>
          <Button 
            className="w-full" 
            onClick={() => onClaimVoucher(primaryVoucher)}
            disabled={isSoldOut}
          >
            {isSoldOut ? 'Sold Out' : 'Claim Voucher'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
