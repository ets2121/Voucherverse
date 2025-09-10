'use client';

import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import useSWR from 'swr';
import type { Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return res.json();
});

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="h-full flex flex-col justify-between">
        <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative h-20 w-20 mb-4 rounded-full overflow-hidden">
                <Image
                    src={testimonial.image_url || `https://picsum.photos/100/100?random=${testimonial.id}`}
                    alt={testimonial.customer_name || 'Customer'}
                    fill
                    data-ai-hint="person headshot"
                    className="object-contain"
                />
            </div>
            <p className="mt-4 font-semibold">{testimonial.customer_name}</p>
            <div className="flex justify-center mt-1">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
            </div>
            <blockquote className="mt-4 text-sm text-muted-foreground italic">
                "{testimonial.message}"
            </blockquote>
        </CardContent>
    </Card>
);

export default function AllTestimonialsSection() {
  const { business } = useAppContext();
  const { data: testimonials, error, isLoading } = useSWR<Testimonial[]>(
    () => business?.id ? `/api/testimonials?business_id=${business.id}` : null,
    fetcher
  );

  return (
    <section id="all-testimonials" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-headline text-3xl md:text-4xl font-bold">
            What Our Customers Say
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Honest feedback from our valued customers.
          </p>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could Not Load Testimonials</AlertTitle>
              <AlertDescription>
                We're having trouble loading customer stories at the moment. Please try again later.
              </AlertDescription>
            </Alert>
        )}

        {testimonials && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
