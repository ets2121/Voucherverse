
'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingBarProps {
  isAnimating: boolean;
}

export default function LoadingBar({ isAnimating }: LoadingBarProps) {

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: isAnimating ? 1 : 0.8, opacity: isAnimating ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </motion.div>
    </motion.div>
  );
}
