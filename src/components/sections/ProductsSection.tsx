'use client';

import { useAppContext } from '@/context/AppContext';
import ProductCard from './ProductCard';

export default function ProductsSection() {
  const { products } = useAppContext();
  
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
