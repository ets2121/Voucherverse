
import useSWRInfinite from 'swr/infinite';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 12;

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
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!businessId) return null;
    if (previousPageData && !previousPageData.data.length) return null; // Reached the end
    return `/api/products?business_id=${businessId}&page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
  };

  const { 
    data, 
    error, 
    size, 
    setSize, 
    isValidating, 
    mutate 
  } = useSWRInfinite<any>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const products: Product[] = data ? [].concat(...data.map(page => page.data)) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  
  const totalProducts = data?.[0]?.count ?? 0;
  const isReachingEnd = data ? (products.length >= totalProducts) : false;

  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel(`voucher_changes_for_business_${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
        },
        (payload) => {
           // We received a change, let's refetch the data to be safe
           console.log('Change detected, refetching products:', payload);
           mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, mutate]);

  return {
    products,
    isLoading: isLoadingInitialData,
    isLoadingMore,
    isReachingEnd,
    error,
    mutate,
    loadMore: () => setSize(size + 1),
  };
}
