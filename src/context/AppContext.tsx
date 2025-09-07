'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [businessError, setBusinessError] = useState<any>(null);
  const [isBusinessLoading, setIsBusinessLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch('/api/business');
        if (!response.ok) {
          throw new Error('Failed to fetch business data');
        }
        const data = await response.json();
        setBusiness(data);
      } catch (error) {
        setBusinessError(error);
      } finally {
        setIsBusinessLoading(false);
      }
    };

    fetchBusiness();
  }, []);

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
