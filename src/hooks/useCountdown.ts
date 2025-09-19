
import { useEffect, useState, useCallback } from 'react';

function useCountdown(endDate: string, expiredMessage: string = 'Expired') {
  const calculateTimeLeft = useCallback(() => {
    // The endDate is a 'YYYY-MM-DD' string. We interpret it as the end of that day in the user's local timezone.
    // By creating the date string like this, the JS Date object will parse it in the client's local timezone.
    const target = new Date(`${endDate}T23:59:59.999`).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        message: expiredMessage,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      message: `${days}d ${hours}h ${minutes}m ${seconds}s left`,
    };
  }, [endDate, expiredMessage]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    // Set initial value
    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Stop the interval if the component unmounts or the date expires
    if (timeLeft.isExpired) {
        clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [endDate, calculateTimeLeft, timeLeft.isExpired]);

  return timeLeft;
}

export default useCountdown;
