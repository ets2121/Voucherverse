
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const useIsAnimating = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // We don't want to show the loader on the initial page load.
    // We can track this by checking if a pathname has been set.
    const hasLoadedOnce = pathname !== null;
    if (!hasLoadedOnce) return;

    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 350); // A shorter duration for a snappier feel

    return () => clearTimeout(timer);
  }, [pathname]);

  return isAnimating;
};
