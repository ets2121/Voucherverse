'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <FileQuestion className="w-24 h-24 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold font-headline mb-2">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
            Sorry, the page you are looking for does not exist or is not available.
        </p>
        <Button asChild>
            <Link href="/">Return to Homepage</Link>
        </Button>
    </div>
  );
}
