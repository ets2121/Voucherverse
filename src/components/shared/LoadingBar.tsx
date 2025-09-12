'use client';

import { motion } from 'framer-motion';
import { useNProgress } from '@tanem/react-nprogress';

interface LoadingBarProps {
  isAnimating: boolean;
}

export default function LoadingBar({ isAnimating }: LoadingBarProps) {
  const { animationDuration, isFinished, progress } = useNProgress({ isAnimating });

  return (
    <motion.div
      className="pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFinished ? 0 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="fixed top-0 left-0 h-1 w-full bg-primary z-[999]"
        initial={{
          marginLeft: '-100%',
        }}
        animate={{
          marginLeft: `${(-1 + progress) * 100}%`,
        }}
        transition={{
          duration: animationDuration,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
