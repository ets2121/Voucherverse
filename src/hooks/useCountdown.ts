import { useEffect, useState } from "react";

function useCountdown(endDate: string, expiredMessage: string = "Expired") {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    message: "",
  });

  useEffect(() => {
    // Force the end date to last until 23:59:59 of that day (UTC)
    const target = new Date(endDate + "T23:59:59Z").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime(); // Current UTC time
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          message: expiredMessage,
        });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        message: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, expiredMessage]);

  return timeLeft;
}

export default useCountdown;
