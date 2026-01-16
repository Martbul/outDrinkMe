import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";

export const useSecureQR = (isPremium: boolean) => {
  const { getToken } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const lastFetchTime = useRef<number>(0);

  useEffect(() => {
    if (!isPremium) {
      setQrData(null);
      return;
    }

    let isMounted = true;

    const fetchQR = async () => {
      const now = Date.now();

      if (now - lastFetchTime.current < 15000) {
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;

        const res = await apiService.getDynamicQR(token);

        if (isMounted) {
          setQrData(res.token);
          setTimeLeft(60);
          lastFetchTime.current = Date.now(); 
        }
      } catch (e) {
        console.error("QR Fetch failed", e);
      }
    };

    fetchQR();

    const refreshInterval = setInterval(fetchQR, 55000);

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };

  }, [isPremium]);

  return { qrData, timeLeft };
};