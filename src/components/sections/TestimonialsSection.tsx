
'use client';

import { useRef } from 'react';
import Link from 'next/link';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';


const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return res.json();
});

export default function TestimonialsSection() {
  const { business } = useAppContext();
  const { data: allTestimonials, error, isLoading } = useSWR<Testimonial[]>(
    () => business?.id ? `/api/testimonials?business_id=${business.id}` : null,
    fetcher
  );

  const testimonials = allTestimonials?.slice(0, 5);

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
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

  if (error) {
     return (
      <section id="testimonials" className="py-20 md:py-24 bg-card">
        <div className="container mx-auto px-4">
           <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could Not Load Testimonials</AlertTitle>
              <AlertDescription>
                We're having trouble loading customer stories at the moment. Please try again later.
              </AlertDescription>
            </Alert>
        </div>
      </section>
     )
  }
  
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <Carousel 
          plugins={[plugin.current]}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col justify-between">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <Avatar className="h-10 w-10 mb-3 text-base">
                            <AvatarImage src={testimonial.image_url || ''} alt={testimonial.customer_name || 'Customer'} />
                            <AvatarFallback>
                                {testimonial.customer_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-sm">{testimonial.customer_name}</p>
                        <div className="flex justify-center mt-1">
                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <blockquote className="mt-2 text-xs text-muted-foreground italic">
                            "{testimonial.message}"
                        </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="text-center mt-12">
          <Button asChild variant="link">
            <Link href="/testimonials">
              View All Testimonials
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
