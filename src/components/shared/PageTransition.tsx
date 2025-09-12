'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import LoadingBar from './LoadingBar';
import { useIsAnimating } from '@/hooks/use-is-animating';

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAnimating = useIsAnimating();

  return (
    <>
      <Suspense fallback={<LoadingBar isAnimating={true} />}>
        <LoadingBar isAnimating={isAnimating} />
      </Suspense>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
