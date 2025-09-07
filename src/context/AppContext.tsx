'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { PageData, Voucher, Product } from '@/lib/types';

interface AppContextType extends PageData {
  isLoading: boolean;
  error: any;
  selectedVoucher: Voucher | null;
  isModalOpen: boolean;
  openModal: (voucher: Voucher) => void;
  closeModal: () => void;
  mutate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AppProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<PageData>('/api/data', fetcher);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('voucher_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vouchers' },
        (payload) => {
          console.log('Voucher change detected, refetching data...', payload);
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  const openModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  const value: AppContextType = {
    business: data?.business,
    products: data?.products ?? [],
    services: data?.services ?? [],
    testimonials: data?.testimonials ?? [],
    isLoading,
    error,
    selectedVoucher,
    isModalOpen,
    openModal,
    closeModal,
    mutate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
