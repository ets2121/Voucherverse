
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useVoucherStatus(emailId: string | null) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!emailId) {
      setStatus(null);
      return;
    }

    const channel = supabase
      .channel(`voucher-status-${emailId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'promo_claims',
          filter: `email_id=eq.${emailId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          if (newStatus) {
            console.log(`Voucher status updated for ${emailId}: ${newStatus}`);
            setStatus(newStatus);
            // Once we get a final status, we can unsubscribe
            if (newStatus === 'delivered' || newStatus === 'failed' || newStatus === 'bounced') {
                supabase.removeChannel(channel);
            }
          }
        }
      )
      .subscribe((subStatus, err) => {
          if (err) {
              console.error(`Subscription error for emailId ${emailId}:`, err);
          }
      });
      
    // Initial fetch of status in case the update was missed
    const checkInitialStatus = async () => {
        const { data, error } = await supabase
            .from('promo_claims')
            .select('status')
            .eq('email_id', emailId)
            .single();
        
        if (data && data.status) {
            setStatus(data.status);
        } else if (error) {
            console.log("Could not fetch initial status, waiting for subscription update.");
        }
    };
    checkInitialStatus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [emailId]);

  return status;
}

