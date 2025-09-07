'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Ticket } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function VoucherModal() {
  const { isModalOpen, closeModal, selectedVoucher, mutate } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [claimedVoucherCode, setClaimedVoucherCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleClose = () => {
    closeModal();
    setTimeout(() => {
        form.reset();
        setIsSubmitting(false);
        setClaimStatus('idle');
        setClaimedVoucherCode(null);
    }, 300);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedVoucher) return;
    setIsSubmitting(true);
    setClaimStatus('idle');

    try {
      const response = await fetch('/api/claim-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucher_id: selectedVoucher.id,
          user_email: values.email,
          business_id: 1, // Hardcoded as per single business context
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to claim voucher.');
      }

      setClaimStatus('success');
      setClaimedVoucherCode(result.voucher_code);
      mutate(); // Re-fetch data to update claim count
    } catch (error: any) {
      setClaimStatus('error');
      toast({
        variant: 'destructive',
        title: 'Claim Failed',
        description: error.message,
      });
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
            <h2 className="text-2xl font-headline">Voucher Claimed!</h2>
            <p className="text-muted-foreground">Your voucher code is:</p>
            <div className="bg-primary/10 border border-dashed border-primary text-primary font-mono text-lg font-bold p-3 rounded-md">
              {claimedVoucherCode}
            </div>
            <p className="text-xs text-muted-foreground">This has been sent to your email.</p>
            <Button onClick={handleClose} className="mt-4">Done</Button>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center gap-4 p-8">
            <XCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-headline">Something Went Wrong</h2>
            <p className="text-muted-foreground">Please try again later.</p>
            <Button onClick={() => setClaimStatus('idle')} variant="outline" className="mt-4">Try Again</Button>
          </motion.div>
        );
      default:
        return (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Ticket className="text-primary"/> Claim Your Voucher
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Claim Now
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
        );
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
