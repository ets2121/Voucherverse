
'use client';

import { useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import config from '@/../public/config/promoBannerConfig.json';
import productCardConfig from '@/../public/productCardConfig.json';
import { useRouter } from 'next/navigation';

const PromoBannerSkeleton = () => (
  <section className="py-12 md:py-16 bg-card">
    <div className="container mx-auto px-4">
      <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
      <div className="flex justify-center">
        <Skeleton className="h-[400px] w-full max-w-6xl" />
      </div>
    </div>
  </section>
);

export default function PromoBanner() {
  const { business, openModal } = useAppContext();
  const { products, isLoading, error } = useProducts(business?.id);
  const router = useRouter();

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
          className="w-full max-w-6xl mx-auto"
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
                    <div className="relative rounded-lg overflow-hidden p-8 md:p-12 bg-gradient-to-r from-primary/20 to-accent/20">
                       <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
                       <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <Image
                                src={product.image_url || `https://picsum.photos/600/400?random=${product.id}`}
                                alt={product.name}
                                width={600}
                                height={400}
                                data-ai-hint="product shoe"
                                className="rounded-lg object-contain aspect-video"
                            />
                        </motion.div>
                        <motion.div 
                            className="text-center md:text-left"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            {discountPercent > 0 && (
                                <p className="font-bold text-3xl md:text-5xl text-accent">
                                    GET UP TO <span className="text-white">{discountPercent}%</span> OFF
                                </p>
                            )}
                             <h3 className="font-headline text-2xl md:text-4xl font-bold mt-2 text-white">
                                {product.name}
                            </h3>
                            <p className="text-muted-foreground mt-4 line-clamp-2">
                                {product.short_description}
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" onClick={() => openModal(product.voucher!)}>Claim Now</Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/products">Shop All Deals</Link>
                                </Button>
                            </div>
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
