
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Product, Voucher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/shared/StarRating';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';

interface ProductCardProps {
  product: Product;
  onClaimVoucher: (voucher: Voucher) => void;
}

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
  const voucher = product.voucher;

  const claimedPercentage = voucher?.max_claims 
    ? (voucher.claimed_count / voucher.max_claims) * 100 
    : 0;

  const claimsLeft = voucher?.max_claims ? voucher.max_claims - voucher.claimed_count : 'Unlimited';

  const isSoldOut = voucher?.max_claims ? voucher.claimed_count >= voucher.max_claims : false;

  const hasDiscount = voucher && voucher.discount_amount && product.price;
  const discountedPrice = hasDiscount ? product.price * (1 - voucher.discount_amount / 100) : null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary transition-all duration-300">
        <CardHeader className="p-0">
           <div className="relative h-32 w-full overflow-hidden">
            <Image
              src={product.image_url || `https://picsum.photos/400/300?random=${product.id}`}
              alt={product.name}
              fill
              data-ai-hint="product food"
              className="object-cover"
            />
          </div>
          <div className="p-4 space-y-1">
            <StarRating ratingData={product.product_ratings} />
            <CardTitle className="font-headline pt-1 text-lg">{product.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">{product.short_description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          {voucher ? (
             <div className="bg-primary/10 p-3 rounded-lg border border-dashed border-primary space-y-2">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-sm text-primary">{voucher.description}</p>
                    <p className="text-xs text-primary/80">
                      {`Save ${voucher.discount_amount}% on this item!`}
                    </p>
                  </div>
                </div>
                {product.price && (
                    <div className="flex items-baseline justify-end gap-2 text-right">
                      {discountedPrice !== null && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xl font-bold text-foreground">
                        ${discountedPrice !== null ? discountedPrice.toFixed(2) : product.price.toFixed(2)}
                      </p>
                    </div>
                )}
              </div>
          ) : (
             product.price && (
                 <div className="flex items-baseline justify-end gap-2 text-right pt-2">
                     <p className="text-xl font-bold text-foreground">${product.price.toFixed(2)}</p>
                 </div>
             )
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-3 p-4 pt-0">
          {voucher && (
            <>
              <div>
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
                {isSoldOut ? 'Sold Out' : 'Claim Voucher'}
              </Button>
            </>
          )}
           {!voucher && (
             <p className="w-full text-center text-sm text-muted-foreground pt-4">No voucher currently available.</p>
           )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
