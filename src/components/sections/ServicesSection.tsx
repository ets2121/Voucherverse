'use client';

import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import type { BusinessService } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch services');
    }
    return res.json();
});

export default function ServicesSection() {
  const { business } = useAppContext();
  const { data: services, error, isLoading } = useSWR<BusinessService[]>(
    () => business?.id ? `/api/services?business_id=${business.id}` : null,
    fetcher
  );

  if (isLoading) {
     return (
       <section id="services" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <Skeleton className="h-80 w-full" />
             <Skeleton className="h-80 w-full" />
             <Skeleton className="h-80 w-full" />
          </div>
        </div>
       </section>
     )
  }

  if (error) {
     return (
      <section id="services" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Services</AlertTitle>
              <AlertDescription>
                We couldn't load the services offered. The API might be down or there's a network issue.
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
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card hover:border-primary transition-colors duration-300 group">
                <CardHeader>
                  <div className="relative h-40 w-full mb-4 rounded-t-lg overflow-hidden">
                    <Image
                      src={service.image_url || `https://picsum.photos/400/250?random=${service.id}`}
                      alt={service.name}
                      fill
                      data-ai-hint="service abstract"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="font-headline text-xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
