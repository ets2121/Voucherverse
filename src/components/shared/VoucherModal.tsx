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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProducts } from '@/hooks/useProducts';
import { Loader2, CheckCircle, XCircle, Ticket, AlertTriangle, Clock } from 'lucide-react';
import modalConfig from '@/../public/modalConfig.json';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function VoucherModal() {
  const { isModalOpen, closeModal, selectedVoucher, business } = useAppContext();
  const { mutate } = useProducts(business?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error' | 'already-claimed' | 'expired'>('idle');
  const [errorMessage, setErrorMessage] = useState('An unknown error occurred. Please try again.');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    // Reset state when modal is closed or voucher changes
    if (!isModalOpen) {
      setTimeout(() => {
        form.reset();
        setIsSubmitting(false);
        setClaimStatus('idle');
        setErrorMessage('An unknown error occurred. Please try again.');
      }, 300); // Delay to allow for closing animation
    }
  }, [isModalOpen, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedVoucher || !business) return;

    // Client-side validation for expiry date
    if (new Date(selectedVoucher.end_date) < new Date()) {
        setClaimStatus('expired');
        return;
    }
      
    setIsSubmitting(true);
    setClaimStatus('idle');

    try {
      const response = await fetch('/api/claim-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucher_id: selectedVoucher.id,
          user_email: values.email,
          business_id: business.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.error || `Modal Error: Failed to claim voucher.`);
      }

      setClaimStatus('success');
      mutate(); // Re-fetch products data to update claim count
    } catch (error: any) {
      const detailedError = error.message || 'An unexpected error occurred.';
      if (detailedError.includes('Already claimed')) {
        setClaimStatus('already-claimed');
      } else {
        setErrorMessage(detailedError);
        setClaimStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const renderContent = () => {
    switch (claimStatus) {
      case 'success':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-headline">{modalConfig.success.title}</h2>
            <p className="text-muted-foreground">{modalConfig.success.message}</p>
            <Button onClick={closeModal} className="mt-4">{modalConfig.success.buttonText}</Button>
          </motion.div>
        );
      case 'already-claimed':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
            <h2 className="text-2xl font-headline">{modalConfig.alreadyClaimed.title}</h2>
            <p className="text-muted-foreground max-w-sm">{modalConfig.alreadyClaimed.message}</p>
            <Button onClick={closeModal} variant="outline" className="mt-4">{modalConfig.alreadyClaimed.buttonText}</Button>
          </motion.div>
        );
      case 'expired':
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <Clock className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">{modalConfig.expired.title}</h2>
            <p className="text-muted-foreground max-w-sm">{modalConfig.expired.message}</p>
            <Button onClick={closeModal} variant="outline" className="mt-4">{modalConfig.expired.buttonText}</Button>
            </motion.div>
        );
      case 'error':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <XCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">{modalConfig.error.title}</h2>
            <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
            <Button onClick={() => setClaimStatus('idle')} variant="outline" className="mt-4">{modalConfig.error.buttonText}</Button>
          </motion.div>
        );
      default:
        return (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Ticket className="text-primary"/> {modalConfig.default.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedVoucher?.description}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{modalConfig.default.emailLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={modalConfig.default.emailPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={closeModal}>{modalConfig.default.cancelButton}</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? modalConfig.submitting.submitButton : modalConfig.default.submitButton}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
        );
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        {selectedVoucher ? renderContent() : null}
      </DialogContent>
    </Dialog>
  );
}
