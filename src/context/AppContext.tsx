'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import type { Business, Voucher } from '@/lib/types';

interface AppContextType {
  business: Business | undefined;
  isBusinessLoading: boolean;
  businessError: any;
  selectedVoucher: Voucher | null;
  isModalOpen: boolean;
  openModal: (voucher: Voucher) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorBody = await res.json();
    const error = new Error(errorBody.error || 'An error occurred while fetching the data.');
    throw error;
  }

  return res.json();
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: business, error: businessError, isLoading: isBusinessLoading } = useSWR<Business>('/api/business', fetcher, { shouldRetryOnError: false });

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedVoucher(null);
    }, 300);
  };

  const value: AppContextType = {
    business,
    isBusinessLoading,
    businessError,
    selectedVoucher,
    isModalOpen,
    openModal,
    closeModal,
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
