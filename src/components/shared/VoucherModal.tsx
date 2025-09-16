
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Loader2, CheckCircle, XCircle, Ticket, AlertTriangle, Clock, MailCheck, MailWarning } from 'lucide-react';
import config from '@/../public/config/modals/voucherModal.json';
import { useVoucherStatus } from '@/hooks/useVoucherStatus';
import { useProducts } from '@/hooks/useProducts';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ClaimStatus = 'idle' | 'processing' | 'success' | 'error' | 'already-claimed' | 'expired' | 'failed-delivery';

export default function VoucherModal() {
  const { isModalOpen, closeModal, selectedVoucher, business } = useAppContext();
  const { mutate } = useProducts(business?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('An unknown error occurred. Please try again.');
  const [emailId, setEmailId] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const deliveryStatus = useVoucherStatus(emailId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!isModalOpen) {
      setTimeout(() => {
        form.reset();
        setIsSubmitting(false);
        setClaimStatus('idle');
        setErrorMessage('An unknown error occurred.');
        setEmailId(null);
        setSubmittedEmail('');
      }, 300);
    }
  }, [isModalOpen, form]);

  useEffect(() => {
    if (deliveryStatus === 'delivered') {
      setClaimStatus('success');
      mutate(); // Revalidate product data to show new claimed count
    } else if (deliveryStatus && deliveryStatus !== 'pending' && deliveryStatus !== 'processing') {
      // Handle failure cases like 'bounced', 'spam', 'failed'
      setClaimStatus('failed-delivery');
    }
  }, [deliveryStatus, mutate]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedVoucher || !business) return;

    if (new Date(selectedVoucher.end_date) < new Date()) {
        setClaimStatus('expired');
        return;
    }
      
    setIsSubmitting(true);
    setSubmittedEmail(values.email);

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
      
      // We expect a "processing" status from the new API flow
      if (result.status === 'processing' && result.emailId) {
          setEmailId(result.emailId);
          setClaimStatus('processing');
      } else {
          // Fallback for any other case
          throw new Error('Unexpected response from server.');
      }

    } catch (error: any) {
      const detailedError = error.message || 'An unexpected error occurred.';
      if (detailedError.includes('Already claimed')) {
        setClaimStatus('already-claimed');
      } else if (detailedError.includes('fully claimed')) {
          setErrorMessage(detailedError);
          setClaimStatus('error');
      }
      else {
        setErrorMessage(detailedError);
        setClaimStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
            key={claimStatus}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
        {claimStatus === 'processing' && (
            <div className="text-center flex flex-col items-center gap-4 p-8">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <h2 className="text-2xl font-headline">Processing Voucher</h2>
                <p className="text-muted-foreground">
                    Your request is being processed. We're sending the voucher to <span className="font-semibold text-foreground">{submittedEmail}</span>. Please wait...
                </p>
            </div>
        )}
        {claimStatus === 'success' && (
          <div className="text-center flex flex-col items-center gap-4 p-8">
            <MailCheck className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-headline">{config.success.title}</h2>
            <p className="text-muted-foreground">We've sent the voucher to your email. Please check your inbox!</p>
            <Button onClick={closeModal} className="mt-4">{config.success.buttonText}</Button>
          </div>
        )}
        {claimStatus === 'failed-delivery' && (
            <div className="text-center flex flex-col items-center gap-4 p-8">
                <MailWarning className="w-16 h-16 text-destructive" />
                <h2 className="text-2xl font-headline">Delivery Failed</h2>
                <p className="text-muted-foreground max-w-sm">
                    We couldn't deliver the voucher to <span className="font-semibold text-foreground">{submittedEmail}</span>. Please check for typos and try again.
                </p>
                <Button onClick={() => setClaimStatus('idle')} variant="outline" className="mt-4">Try Again</Button>
            </div>
        )}
        {claimStatus === 'already-claimed' && (
          <div className="text-center flex flex-col items-center gap-4 p-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
            <h2 className="text-2xl font-headline">{config.alreadyClaimed.title}</h2>
            <p className="text-muted-foreground max-w-sm">{config.alreadyClaimed.message}</p>
            <Button onClick={closeModal} variant="outline" className="mt-4">{config.alreadyClaimed.buttonText}</Button>
          </div>
        )}
        {claimStatus === 'expired' && (
            <div className="text-center flex flex-col items-center gap-4 p-8">
            <Clock className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">{config.expired.title}</h2>
            <p className="text-muted-foreground max-w-sm">{config.expired.message}</p>
            <Button onClick={closeModal} variant="outline" className="mt-4">{config.expired.buttonText}</Button>
            </div>
        )}
        {claimStatus === 'error' && (
          <div className="text-center flex flex-col items-center gap-4 p-8">
            <XCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">{config.error.title}</h2>
            <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
            <Button onClick={() => setClaimStatus('idle')} variant="outline" className="mt-4">{config.error.buttonText}</Button>
          </div>
        )}
        {claimStatus === 'idle' && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Ticket className="text-primary"/> {config.default.title}
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
                        <FormLabel>{config.default.emailLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={config.default.emailPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={closeModal}>{config.default.cancelButton}</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? config.submitting.submitButton : config.default.submitButton}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
        )}
        </motion.div>
    </AnimatePresence>
    );
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent 
            className="sm:max-w-[425px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
            {selectedVoucher ? renderContent() : null}
        </DialogContent>
    </Dialog>
  );
}

