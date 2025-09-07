'use client';

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function Footer() {
  const { business } = useAppContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {business?.name || 'VoucherVerse'}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {business?.social_links &&
              Object.entries(business.social_links).map(([platform, url]) => (
                <Link key={platform} href={url} target="_blank" className="text-sm hover:text-primary transition-colors">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
