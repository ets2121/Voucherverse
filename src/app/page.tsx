'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import { Skeleton } from '@/components/ui/skeleton';
import config from '@/../public/config.json';
import VoucherModal from '@/components/shared/VoucherModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ProductsSection from '@/components/sections/ProductsSection';
import PromoBanner from '@/components/sections/PromoBanner';

const sectionComponents: Record<string, FC> = {
  hero: HeroSection,
  services: ServicesSection,
  testimonials: TestimonialsSection,
  products: ProductsSection,
  promoBanner: PromoBanner,
};

const LoadingSkeleton = () => (
  <div className="flex flex-col min-h-screen">
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className='hidden md:flex items-center gap-6'>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-9 w-24" />
        </div>
        <div className='md:hidden'>
            <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </header>
    <main className="flex-grow pt-20">
      <div className="container mx-auto px-4 py-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-4 pt-12 md:pt-24">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-40 mt-4" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/3 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
         <div className="space-y-8">
          <Skeleton className="h-10 w-1/3 mx-auto" />
          <div className="flex justify-center">
             <Skeleton className="h-56 w-full max-w-sm" />
          </div>
        </div>
      </div>
    </main>
    <footer className="border-t">
       <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
            </div>
        </div>
       </div>
    </footer>
  </div>
);

export default function Home() {
  const { isBusinessLoading, businessError } = useAppContext();
  const { sections } = config;

  if (isBusinessLoading) {
    return <LoadingSkeleton />;
  }

  if (businessError) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            We're having trouble loading our store information. This could be due to a network issue. Please check your connection and try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {sections.map((sectionName, index) => {
          const SectionComponent = sectionComponents[sectionName];
          if (!SectionComponent) return null;

          return (
            <motion.div
              key={sectionName}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SectionComponent />
            </motion.div>
          );
        })}
      </main>
      <Footer />
      <VoucherModal />
    </div>
  );
}
