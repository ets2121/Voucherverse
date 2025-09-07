import useSWR from 'swr';
import { useEffect } from 'react';
import type { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
});

export function useProducts(businessId: number | undefined) {
    const swrKey = businessId ? `/api/products?business_id=${businessId}` : null;
    const { data: products, error, isLoading, mutate } = useSWR<Product[]>(swrKey, fetcher);

    useEffect(() => {
        if (!businessId) return;

        // Create a unique channel name to avoid conflicts
        const channelName = `products-update-${businessId}-${Math.random().toString(36).substring(7)}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'vouchers'
                },
                (payload) => {
                    console.log('Voucher change detected, refetching products...', payload.new);
                    // Revalidate the products data to get the latest claim counts
                    mutate();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to ${channelName}`);
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('Subscription error:', err);
                }
            });

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [businessId, mutate]);

    return {
        products,
        isLoading,
        error,
        mutate,
    };
}
