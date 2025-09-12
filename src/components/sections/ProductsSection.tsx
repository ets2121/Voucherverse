
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardSmall from './ProductCardSmall';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Search, X, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/use-debounce';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const ProductsSkeleton = () => (
    <section id="products" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-1/2 mx-auto" />
          <Skeleton className="h-5 w-1/3 mx-auto mt-2" />
        </div>
        <div className="sticky top-[80px] z-20 bg-background/95 backdrop-blur-sm py-4 mb-8 border-b">
          <div className="flex flex-col gap-4 justify-center items-center">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-10 w-full max-w-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
             <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full">
                <Skeleton className="aspect-square w-full" />
                <div className="p-2 flex flex-col flex-grow space-y-2">
                   <Skeleton className="h-4 w-5/6" />
                   <Skeleton className="h-4 w-3/4" />
                   <div className="pt-2 space-y-1">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                   </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
);


export default function ProductsSection() {
  const { business, openModal } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { 
    products, 
    isLoading, 
    error, 
    loadMore, 
    isLoadingMore, 
    isReachingEnd 
  } = useProducts(business?.id);
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories(business?.id);
  const isMobile = useIsMobile();
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef);

  useEffect(() => {
    if (isIntersecting && !isLoadingMore && !isReachingEnd) {
      loadMore();
    }
  }, [isIntersecting, isLoadingMore, isReachingEnd, loadMore]);

  useEffect(() => {
    if (products.length > 0) {
      const productIdFromBanner = sessionStorage.getItem('selectedProductIdFromBanner');
      if (productIdFromBanner) {
        const product = products.find(p => p.id === parseInt(productIdFromBanner, 10));
        if (product) {
          setSelectedProduct(product);
        }
        sessionStorage.removeItem('selectedProductIdFromBanner');
      }
    }
  }, [products]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleGoBack = () => {
    setSelectedProduct(null);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
        const searchMatch = debouncedSearchQuery
            ? product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
              product.short_description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            : true;

        const categoryMatch = selectedCategoryId
            ? product.category_id === parseInt(selectedCategoryId, 10)
            : true;
            
        return searchMatch && categoryMatch;
    });
  }, [products, debouncedSearchQuery, selectedCategoryId]);

  const showCategoryFilter = categories && categories.length > 1;

  if (isLoading) {
    return <ProductsSkeleton />;
  }
  

  return (
    <motion.section 
        id="products" 
        className="py-20 md:py-24 bg-background relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {selectedProduct && (
            <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed top-0 left-0 right-0 bottom-0 bg-background z-40 overflow-y-auto"
            >
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm p-2 border-b">
                    <Button variant="ghost" onClick={handleGoBack} className="w-full justify-start md:max-w-max">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deals
                    </Button>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-lg mx-auto">
                        <ProductCard product={selectedProduct} onClaimVoucher={openModal} />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Our Exclusive Deals
            </h2>
             <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover unique products and claim special vouchers. Click on any item to see more details.
            </p>
        </div>
        
        <div className="sticky top-[80px] z-20 bg-background/95 backdrop-blur-sm py-4 mb-8 border-b">
            <div className="flex flex-col gap-4 justify-center items-center">
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
                    <Tabs 
                        value={selectedCategoryId || 'all'}
                        onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)}
                        className="w-full max-w-full"
                    >
                        <TabsList className="flex w-full overflow-x-auto justify-start md:justify-center">
                           {categoriesLoading ? (
                                <>
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                </>
                           ) : (
                             <>
                                <TabsTrigger value="all">All</TabsTrigger>
                                {categories.map((cat) => (
                                    <TabsTrigger key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </TabsTrigger>
                                ))}
                             </>
                           )}
                        </TabsList>
                    </Tabs>
                )}
            </div>
        </div>
        
         {error && (
            <Alert variant="destructive" className="max-w-lg mx-auto mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could Not Load Deals</AlertTitle>
              <AlertDescription>
                We're having trouble loading our product deals at the moment. Please try again later.
              </AlertDescription>
            </Alert>
         )}

        <AnimatePresence mode="wait">
            <motion.div
                key={`${selectedCategoryId || 'all'}-${debouncedSearchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {filteredProducts.length === 0 && !isLoading ? (
                    <div className="text-center py-16">
                        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Products Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 items-start">
                        {filteredProducts.map((product) => (
                            <ProductCardSmall key={product.id} product={product} onClick={() => handleSelectProduct(product)} />
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

        <div ref={loadMoreRef} className="h-10 mt-8 flex justify-center items-center">
            {isLoadingMore && <Loader2 className="animate-spin" />}
            {isReachingEnd && !isLoadingMore && products.length > 0 && <p className="text-muted-foreground">You've reached the end.</p>}
        </div>
      </div>
    </motion.section>
  );
}
