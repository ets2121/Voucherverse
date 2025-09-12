'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const useIsAnimating = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 750); // Corresponds to animation duration

    return () => clearTimeout(timer);
  }, [pathname]);

  return isAnimating;
};
