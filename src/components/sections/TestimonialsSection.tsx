'use client';

import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import useSWR from 'swr';
import type { Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TestimonialsSection() {
  const { business } = useAppContext();
  const { data: testimonials, isLoading, error } = useSWR<Testimonial[]>(
    () => business?.id ? `/api/testimonials?business_id=${business.id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="flex justify-center">
            <Skeleton className="h-64 w-full max-w-sm" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full flex flex-col justify-between bg-background">
                    <CardContent className="flex flex-col gap-4 p-6">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              testimonial.rating && i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="italic text-foreground">"{testimonial.message}"</p>
                      <div className="flex items-center gap-4 pt-4">
                        <Image
                          src={testimonial.image_url || `https://picsum.photos/100/100?random=${testimonial.id}`}
                          alt={testimonial.customer_name || 'Customer'}
                          width={48}
                          height={48}
                          data-ai-hint="person avatar"
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-bold">{testimonial.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.customer_email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
