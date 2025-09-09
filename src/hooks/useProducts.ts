import useSWR from 'swr';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorBody = await res.json();
        const error = new Error(errorBody.error || 'Failed to fetch products');
        throw error;
    }
    return res.json();
};

export function useProducts(businessId: number | undefined) {
    const swrKey = businessId ? `/api/products?business_id=${businessId}` : null;
    const { data: products, error, isLoading, mutate } = useSWR<Product[]>(swrKey, fetcher, {
      revalidateOnFocus: false,
    });

    useEffect(() => {
        if (!businessId) return;

        const channel = supabase
            .channel(`voucher_changes_for_business_${businessId}`)
            .on(
                'postgres_changes',
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'Voucher',
                },
                (payload) => {
                    const updatedVoucher = payload.new as Product['voucher'];
                    if (!updatedVoucher) return;
                    
                    // Optimistically update the SWR cache
                    mutate((currentData) => {
                        if (!currentData) return [];
                        
                        // Check if the updated voucher belongs to a product of the current business
                        const productExists = currentData.some(p => p.id === updatedVoucher.product_id);
                        if (!productExists) {
                            return currentData;
                        }

                        return currentData.map(product => {
                            if (product.voucher && product.voucher.id === updatedVoucher.id) {
                                // Return a new product object to trigger re-render
                                return { ...product, voucher: updatedVoucher };
                            }
                            return product;
                        });
                    }, false); // 'false' prevents revalidation, we trust the real-time update
                }
            )
            .subscribe();

        // Cleanup function to remove the subscription
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
