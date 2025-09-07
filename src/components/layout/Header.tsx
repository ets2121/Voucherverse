'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

export default function Header() {
  const { business } = useAppContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/80 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {business?.logo_url ? (
            <Image
              src={business.logo_url}
              alt={`${business.name} logo`}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="p-2 bg-primary rounded-full text-primary-foreground">
              <Gem size={16} />
            </div>
          )}
          <span className="font-headline text-lg font-bold">{business?.name || 'VoucherVerse'}</span>
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href={business?.website_url || '#'} target="_blank">
              Our Website
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
