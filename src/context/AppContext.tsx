
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import type { Business, Voucher, Product } from '@/lib/types';

interface AppContextType {
  business: Business | undefined;
  isBusinessLoading: boolean;
  businessError: any;
  
  // Voucher Modal
  selectedVoucher: Voucher | null;
  isModalOpen: boolean;
  openModal: (voucher: Voucher) => void;
  closeModal: () => void;

  // Review Modal
  selectedProduct: Product | null;
  isReviewModalOpen: boolean;
  openReviewModal: (product: Product) => void;
  closeReviewModal: () => void;
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
  const { data: business, error: businessError, isLoading: isBusinessLoading } = useSWR<Business>(
    '/api/business', 
    fetcher, 
    { 
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
    }
  );

  // Voucher Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
  
  const openReviewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
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
    selectedProduct,
    isReviewModalOpen,
    openReviewModal,
    closeReviewModal,
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
