
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
