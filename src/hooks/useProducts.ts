import useSWR from 'swr';
import type { Product } from '@/lib/types';

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
      revalidateOnFocus: false, // Optional: prevent re-fetching on window focus
    });

    return {
        products,
        isLoading,
        error,
        mutate,
    };
}
