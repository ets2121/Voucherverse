
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardSmall from './ProductCardSmall';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Search, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/use-debounce';


export default function ProductsSection() {
  const { business, openModal } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { products, isLoading, error } = useProducts(business?.id, debouncedSearchQuery, selectedCategoryId);
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories(business?.id);
  const isMobile = useIsMobile();

  const handleSelectProduct = (product: Product) => {
    if (isMobile) {
      setSelectedProduct(product);
    }
  };

  const handleGoBack = () => {
    setSelectedProduct(null);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products;
  }, [products]);

  const showCategoryFilter = categories && categories.length > 1;

  if (isLoading && !searchQuery) {
    return (
      <section id="products" className="py-20 md:py-24 bg-background border-t border-b">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-4">Our Exclusive Deals</h2>
          <div className="flex justify-center mb-12">
             <Skeleton className="h-10 w-full max-w-xs" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        </div>
      </section>
    );
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
    
    if (filteredProducts.length === 0 && !isLoading) {
        return (
             <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
             >
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Products Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters.
                </p>
            </motion.div>
        )
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
         {filteredProducts.map((product) =>
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
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-4">
          Our Exclusive Deals
        </h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
                {searchQuery && (
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                     onClick={handleClearSearch}
                    >
                     <X className="h-4 w-4" />
                   </Button>
                )}
            </div>
            {showCategoryFilter && (
              <Select onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)} defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
        </div>
        
         {error && (
            <Alert variant="destructive" className="max-w-lg mx-auto mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Products</AlertTitle>
              <AlertDescription>
                We couldn't load the product deals. The API might be down or there's a network issue.
                <strong>Details:</strong> {error.message}
              </AlertDescription>
            </Alert>
         )}

        <AnimatePresence mode="wait">
            {isLoading && filteredProducts.length === 0 ? (
                 <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6"
                 >
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                 </motion.div>
            ) : (
                renderProductView()
            )}
        </AnimatePresence>
      </div>
    </section>
  );
}
