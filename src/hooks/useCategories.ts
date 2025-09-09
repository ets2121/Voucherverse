import useSWR from 'swr';
import type { ProductCategory } from '@/lib/types';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorBody = await res.json();
        const error = new Error(errorBody.error || 'Failed to fetch categories');
        throw error;
    }
    return res.json();
};

export function useCategories(businessId: number | undefined) {
    const swrKey = businessId ? `/api/categories?business_id=${businessId}` : null;
    
    const { data: categories, error, isLoading } = useSWR<ProductCategory[]>(swrKey, fetcher, {
        revalidateOnFocus: false,
    });

    return {
        categories,
        isLoading,
        error,
    };
}
