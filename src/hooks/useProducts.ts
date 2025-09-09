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
          event: 'UPDATE',
          schema: 'public',
          table: 'Voucher',
        },
        (payload) => {
          const updatedVoucher = payload.new as Product['voucher'];
          if (!updatedVoucher) return;

          mutate((currentData) => {
            if (!currentData) return [];
            
            return currentData.map(page => {
              return {
                ...page,
                data: page.data.map((product: Product) => {
                  if (product.voucher && product.voucher.id === updatedVoucher.id) {
                    return { ...product, voucher: updatedVoucher };
                  }
                  return product;
                })
              }
            });
            
          }, false);
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
