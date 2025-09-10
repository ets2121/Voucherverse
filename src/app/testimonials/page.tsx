'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AllTestimonialsSection from '@/components/sections/AllTestimonialsSection';

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <AllTestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
