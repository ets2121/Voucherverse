
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquarePlus, AlertTriangle, Send } from 'lucide-react';
import useSWR from 'swr';
import type { Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return res.json();
});

const TestimonialSkeleton = () => (
    <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-center">
                 <Skeleton className="h-48 w-full max-w-4xl" />
            </div>
        ))}
    </div>
);


const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="h-full flex flex-col justify-between">
        <CardContent className="p-4 flex flex-col items-center text-center">
             <Avatar className="h-8 w-8 mb-2 text-sm">
                <AvatarImage src={testimonial.image_url || ''} alt={testimonial.customer_name || 'Customer'} />
                <AvatarFallback>
                    {testimonial.customer_name ? testimonial.customer_name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{testimonial.customer_name || 'Anonymous'}</p>
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
);

const TestimonialCarousel = ({ testimonials, direction, delay }: { testimonials: Testimonial[], direction: 'forward' | 'backward', delay: number }) => {
    const [api, setApi] = useState<CarouselApi>();
    const [scaleValues, setScaleValues] = useState<number[]>([]);

    const plugin = useRef(
        Autoplay({ delay, stopOnInteraction: false, direction })
    );

    const onScroll = useCallback(() => {
        if (!api) return;

        const newScaleValues = api.scrollSnapList().map((_, index) => {
            const diff = Math.abs(index - api.selectedScrollSnap());
            const scale = 1 - diff * 0.2;
            return Math.max(0, scale);
        });
        setScaleValues(newScaleValues);

    }, [api]);


    useEffect(() => {
        if (!api) {
        return;
        }
        
        onScroll(); // Set initial scales
        api.on('select', onScroll);
        api.on('reInit', onScroll);
        api.on('scroll', onScroll);

        return () => {
            if (api) {
                api.off('select', onScroll);
                api.off('reInit', onScroll);
                api.off('scroll', onScroll);
            }
        };
    }, [api, onScroll]);

    return (
        <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            opts={{
            align: 'center',
            loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.play}
        >
            <CarouselContent>
                {testimonials.map((testimonial, index) => (
                    <CarouselItem key={testimonial.id} className="sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                        <motion.div 
                            className="p-1 h-full"
                            style={{
                                scale: scaleValues[index] ?? 0.8,
                                opacity: scaleValues[index] ?? 0,
                                transition: 'scale 0.5s ease-in-out, opacity 0.5s ease-in-out'
                            }}
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </motion.div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function AllTestimonialsSection() {
  const { business, openTestimonialModal } = useAppContext();
  const { data: testimonials, error, isLoading, mutate } = useSWR<Testimonial[]>(
    () => business?.id ? `/api/testimonials?business_id=${business.id}` : null,
    fetcher
  );

  const handleOpenModal = () => {
      openTestimonialModal(() => mutate());
  }

  const testimonialChunks = testimonials ? chunkArray(testimonials, 10) : [];
  
  return (
    <section id="all-testimonials" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        
        <div className="bg-background/95 py-4 mb-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div className="text-left">
                    <motion.h1 
                        className="font-headline text-3xl md:text-4xl font-bold"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        What Our Customers Say
                    </motion.h1>
                    <motion.p 
                        className="mt-1 text-md text-muted-foreground"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Honest feedback from our valued customers.
                    </motion.p>
                </div>
                <Button onClick={handleOpenModal} size="sm" className="shrink-0 w-full md:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Testimonial
                </Button>
            </div>
        </div>

        {isLoading && <TestimonialSkeleton />}

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could Not Load Testimonials</AlertTitle>
              <AlertDescription>
                We're having trouble loading customer stories at the moment. Please try again later.
              </AlertDescription>
            </Alert>
        )}
        
        {!isLoading && !error && testimonials?.length === 0 && (
             <div className="text-center py-16">
                <MessageSquarePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Testimonials Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Be the first to share your experience!
                </p>
                <Button onClick={handleOpenModal} className="mt-4">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Testimonial
                </Button>
            </div>
        )}

        {testimonialChunks.length > 0 && (
            <div className="space-y-8">
                {testimonialChunks.map((chunk, index) => {
                    const baseDelay = 2000;
                    const randomOffset = Math.floor(Math.random() * 1000); // Random value between 0 and 1000
                    const delay = baseDelay + randomOffset;
                    return (
                        <TestimonialCarousel 
                            key={index}
                            testimonials={chunk}
                            direction={index % 2 === 0 ? 'forward' : 'backward'}
                            delay={delay}
                        />
                    )
                })}
            </div>
        )}
      </div>
    </section>
  );
}