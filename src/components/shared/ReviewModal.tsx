
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';

import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CheckCircle, XCircle, Star, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  rating: z.number().min(1, { message: 'Please select a rating.' }).max(5),
  review: z.string().max(500, { message: 'Review must be 500 characters or less.' }).optional(),
});

const StarRatingInput = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-8 h-8 cursor-pointer transition-colors ${
            (hoverValue || value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        />
      ))}
    </div>
  );
};

export default function ReviewModal() {
  const { isReviewModalOpen, closeReviewModal, selectedProduct, business } = useAppContext();
  const { mutate } = useProducts(business?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already-claimed'>('idle');
  const [errorMessage, setErrorMessage] = useState('An unknown error occurred. Please try again.');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      rating: 0,
      review: '',
    },
  });

  useEffect(() => {
    if (!isReviewModalOpen) {
      setTimeout(() => {
        form.reset();
        setIsSubmitting(false);
        setSubmitStatus('idle');
        setErrorMessage('An unknown error occurred.');
      }, 300);
    }
  }, [isReviewModalOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedProduct || !business) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_product_id: selectedProduct.id,
          p_business_id: business.id,
          p_email: values.email,
          p_rating: values.rating,
          p_review: values.review,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.error || `Failed to submit review.`);
      }

      setSubmitStatus('success');
      mutate(); // Re-fetch products to update ratings if needed
    } catch (error: any) {
      const detailedError = error.message || 'An unexpected error occurred.';
       if (detailedError.includes('already submitted a review')) {
        setSubmitStatus('already-claimed');
      } else {
        setErrorMessage(detailedError);
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderContent = () => {
    switch (submitStatus) {
      case 'success':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-headline">Review Submitted!</h2>
            <p className="text-muted-foreground">Thank you for your valuable feedback.</p>
            <Button onClick={closeReviewModal} className="mt-4">Done</Button>
          </motion.div>
        );
      case 'already-claimed':
         return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
            <h2 className="text-2xl font-headline">Already Reviewed</h2>
            <p className="text-muted-foreground max-w-sm">It looks like you've already submitted a review for this product with this email address.</p>
            <Button onClick={closeReviewModal} variant="outline" className="mt-4">Close</Button>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <XCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">Submission Failed</h2>
            <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
            <Button onClick={() => setSubmitStatus('idle')} variant="outline" className="mt-4">Try Again</Button>
          </motion.div>
        );
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline">Rate & Review '{selectedProduct?.name}'</DialogTitle>
              <DialogDescription>
                Your feedback helps us and other customers. Let us know what you think!
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating</FormLabel>
                      <FormControl>
                        <StarRatingInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us more about your experience..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeReviewModal}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        );
    }
  };

  return (
    <Dialog open={isReviewModalOpen} onOpenChange={closeReviewModal}>
      <DialogContent className="sm:max-w-md">
        {selectedProduct ? renderContent() : null}
      </DialogContent>
    </Dialog>
  );
}
