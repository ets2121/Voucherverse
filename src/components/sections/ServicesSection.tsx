
'use client';

import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import type { BusinessService } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch services');
    }
    return res.json();
});

const ServicesSkeleton = () => (
    <section id="services" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
                What We Offer
            </h2>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
              <div className="space-y-16">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-8 even:flex-row-reverse">
                          <Skeleton className="w-48 h-48 rounded-lg" />
                          <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-5/6" />
                          </div>
                      </div>
                  ))}
              </div>
            </div>
        </div>
    </section>
);

export default function ServicesSection() {
  const { business } = useAppContext();
  const { data: services, error, isLoading } = useSWR<BusinessService[]>(
    () => business?.id ? `/api/services?business_id=${business.id}` : null,
    fetcher
  );

  if (isLoading) {
     return <ServicesSkeleton />;
  }

  if (error) {
     return (
      <section id="services" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could Not Load Services</AlertTitle>
              <AlertDescription>
                We're having trouble loading our services at the moment. Please try again later.
              </AlertDescription>
            </Alert>
        </div>
      </section>
     )
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-16">
          What We Offer
        </h2>
        
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-5 md:left-1/2 top-5 bottom-0 w-0.5 bg-border/50 -translate-x-1/2" aria-hidden="true"></div>

          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="relative mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <div className={cn(
                  "flex flex-col md:flex-row items-center gap-8",
                  index % 2 !== 0 && "md:flex-row-reverse"
              )}>
                {/* Image */}
                <div className="md:w-1/2 flex-shrink-0">
                  <div className="relative aspect-square w-full max-w-sm mx-auto md:max-w-none rounded-lg overflow-hidden shadow-lg border border-border">
                    <Image
                      src={service.image_url || `https://picsum.photos/400/400?random=${service.id}`}
                      alt={service.name}
                      fill
                      data-ai-hint="service technology"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={cn(
                  "md:w-1/2 text-center md:text-left",
                  index % 2 !== 0 && "md:text-right"
                )}>
                  <h3 className="font-headline text-2xl font-bold text-primary mb-2">{service.name}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </div>

              {/* Number Circle */}
               <div className="absolute top-0 left-5 md:left-1/2 w-10 h-10 bg-background border-2 border-primary rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <span className="font-bold text-primary">{index + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
