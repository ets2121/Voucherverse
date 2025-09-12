'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { SearchX, Gem } from 'lucide-react';

export default function NotFound() {
  const { business } = useAppContext();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center p-4 bg-grid-white/[0.05]">
        <div 
          className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2 mb-8">
              {business?.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="p-2 bg-primary rounded-full text-primary-foreground">
                  <Gem size={24} />
                </div>
              )}
              <span className="font-headline text-2xl font-bold">{business?.name || 'VoucherVerse'}</span>
            </Link>

            <SearchX className="w-24 h-24 text-primary mb-6" />

            <h1 className="text-5xl font-bold font-headline mb-3 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                404 - Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Oops! It seems the page you are looking for has taken a detour. It might have been moved, deleted, or never existed in the first place.
            </p>
            <Button asChild size="lg">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </div>
    </div>
  );
}
