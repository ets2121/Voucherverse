
'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardSmall from './ProductCardSmall';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import type { Product } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';


export default function ProductsSection() {
  const { business, openModal } = useAppContext();
  const { products, isLoading, error } = useProducts(business?.id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isMobile = useIsMobile();

  const handleSelectProduct = (product: Product) => {
    if(isMobile) {
      setSelectedProduct(product);
    }
  };

  const handleGoBack = () => {
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Our Exclusive Deals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full hidden lg:block" />
            <Skeleton className="h-96 w-full hidden xl:block" />
            <Skeleton className="h-96 w-full hidden 2xl:block" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
        <div className="container mx-auto px-4">
           <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Products</AlertTitle>
              <AlertDescription>
                We couldn't load the product deals. The API might be down or there's a network issue.
                 <strong>Details:</strong> {error.message}
              </AlertDescription>
            </Alert>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }
  
  const renderProductView = () => {
    if (isMobile && selectedProduct) {
       return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-md mx-auto"
        >
            <div className="fixed top-20 left-0 right-0 bg-background z-10 p-4 pt-0 border-b">
              <Button variant="ghost" onClick={handleGoBack} className="w-full justify-start">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deals
              </Button>
            </div>
            <div className="pt-16 pb-4">
              <ProductCard product={selectedProduct} onClaimVoucher={openModal} />
            </div>
        </motion.div>
      );
    }

    return (
        <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 items-start"
        >
         {products.map((product) =>
            isMobile ? (
              <ProductCardSmall key={product.id} product={product} onClick={() => handleSelectProduct(product)} />
            ) : (
              <ProductCard key={product.id} product={product} onClaimVoucher={openModal} />
            )
          )}
        </motion.div>
    )
  }


  return (
    <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          Our Exclusive Deals
        </h2>
        <AnimatePresence mode="wait">
            {renderProductView()}
        </AnimatePresence>
      </div>
    </section>
  );
}
