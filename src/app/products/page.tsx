'use client';

import ProductsSection from '@/components/sections/ProductsSection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VoucherModal from '@/components/shared/VoucherModal';
import ReviewModal from '@/components/shared/ReviewModal';

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <ProductsSection />
      </main>
      <Footer />
      <VoucherModal />
      <ReviewModal />
    </div>
  );
}
