'use client';

import { useAppContext } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ProductsSection() {
  const { business, openModal } = useAppContext();
  const { products, isLoading, error } = useProducts(business?.id);
  
  if (isLoading) {
    return (
      <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Our Exclusive Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
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

  return (
    <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          Our Exclusive Deals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClaimVoucher={openModal} />
          ))}
        </div>
      </div>
    </section>
  );
}
