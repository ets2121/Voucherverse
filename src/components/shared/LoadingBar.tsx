
'use client';

import { motion } from 'framer-motion';

interface LoadingBarProps {
  isAnimating: boolean;
}

export default function LoadingBar({ isAnimating }: LoadingBarProps) {

  return (
    <motion.div
      className="pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="fixed top-0 left-0 h-1 w-full bg-primary z-[999]"
        initial={{x: "-100%"}}
        animate={{ x: isAnimating ? "0%" : "100%"}}
        transition={{
          duration: isAnimating ? 0.5: 0.2,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
