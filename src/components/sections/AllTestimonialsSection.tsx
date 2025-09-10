
'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquarePlus } from 'lucide-react';
import useSWR from 'swr';
import type { Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch testimonials');
    }
    return res.json();
});

const TestimonialSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full flex flex-col justify-between">
                <CardContent className="p-4 flex flex-col items-center text-center">
                    <Skeleton className="h-10 w-10 mb-3 rounded-full" />
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-20 mb-3" />
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);


const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="h-full flex flex-col justify-between">
        <CardContent className="p-4 flex flex-col items-center text-center">
             <Avatar className="h-10 w-10 mb-3 text-base">
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

export default function AllTestimonialsSection() {
  const { business, openTestimonialModal } = useAppContext();
  const { data: testimonials, error, isLoading } = useSWR<Testimonial[]>(
    () => business?.id ? `/api/testimonials?business_id=${business.id}` : null,
    fetcher
  );

  return (
    <section id="all-testimonials" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="sticky top-[80px] z-40 bg-background/80 backdrop-blur-sm py-4 mb-8 border-b -mx-4 px-4">
            <div className="container mx-auto flex justify-between items-center">
                <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-left"
                >
                <h1 className="font-headline text-2xl md:text-3xl font-bold">
                    What Our Customers Say
                </h1>
                <p className="mt-1 text-md text-muted-foreground">
                    Honest feedback from our valued customers.
                </p>
                </motion.div>
                 <Button onClick={openTestimonialModal}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" /> Submit a Testimonial
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
        
        {!isLoading && testimonials?.length === 0 && (
             <div className="text-center py-16">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Testimonials Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Be the first one to share your feedback!
                </p>
            </div>
        )}

        {testimonials && testimonials.length > 0 && (
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
