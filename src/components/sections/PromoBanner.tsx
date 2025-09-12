
'use client';

import { useRef, useMemo } from 'react';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';
import { useAppContext } from '@/context/AppContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import config from '@/../public/config/promoBannerConfig.json';

const PromoBannerSkeleton = () => (
  <section className="py-12 md:py-16 bg-card">
    <div className="container mx-auto px-4">
      <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
      <div className="flex justify-center">
        <Skeleton className="h-[200px] w-full max-w-2xl" />
      </div>
    </div>
  </section>
);

export default function PromoBanner() {
  const { business } = useAppContext();
  const { products, isLoading, error } = useProducts(business?.id);

  const promoProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.voucher);
  }, [products]);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) {
    return <PromoBannerSkeleton />;
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Could Not Load Promotions</AlertTitle>
            <AlertDescription>
              There was an issue loading the current deals. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (promoProducts.length === 0) {
    return null; // Don't render the section if there are no promo products
  }

  return (
    <section id="promo-banner" className="py-12 md:py-16 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          {config.title}
        </h2>
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-2xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {promoProducts.map((product) => {
              const { voucher, price } = product;
              let discountPercent = 0;
              if (voucher && voucher.discount_amount && price && price > 0) {
                discountPercent = Math.min(Math.round((voucher.discount_amount / price) * 100), 100);
              }

              return (
                <CarouselItem key={product.id}>
                  <div className="p-1">
                    <div className="relative rounded-lg overflow-hidden p-4 md:p-6 bg-gradient-to-r from-primary/20 to-accent/20">
                       <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
                       <div className="grid grid-cols-3 gap-4 items-center relative z-10">
                        <motion.div
                            className="col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="relative aspect-square w-full max-w-[80px] mx-auto">
                                <Image
                                    src={product.image_url || `https://picsum.photos/300/300?random=${product.id}`}
                                    alt={product.name}
                                    fill
                                    data-ai-hint="product shoe"
                                    className="rounded-lg object-contain filter blur-sm"
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            className="text-left col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            {discountPercent > 0 && (
                                <p className="font-bold text-base md:text-lg text-accent">
                                    <span className="text-white">{discountPercent}%</span> OFF
                                </p>
                            )}
                             <h3 className="font-headline text-base md:text-lg font-bold mt-1 text-white">
                                {product.name}
                            </h3>
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                {product.short_description}
                            </p>
                        </motion.div>
                       </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-[-1rem] sm:left-[-2rem]" />
          <CarouselNext className="right-[-1rem] sm:right-[-2rem]" />
        </Carousel>
      </div>
    </section>
  );
}
