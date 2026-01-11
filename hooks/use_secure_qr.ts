// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-expo";
// import { apiService } from "@/api";

// export const useSecureQR = (isEnabled: boolean) => {
//   const { getToken } = useAuth();
//   const [qrData, setQrData] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!isEnabled) {
//       setLoading(false);
//       return;
//     }

//     let isMounted = true;

//     const fetchQR = async () => {
//       try {
//         const token = await getToken();
//         if (!token) return;

//         const res = await apiService.getDynamicQR(token);

//         if (isMounted) {
//           setQrData(res.token);
//           setTimeLeft(60);
//           setLoading(false);
//         }
//       } catch (e) {
//         console.error("Failed to fetch Secure QR", e);
//       }
//     };

//     // Initial Fetch
//     fetchQR();

//     // Refresh data every 55 seconds (before 2 min expiry)
//     const refreshInterval = setInterval(fetchQR, 55000);

//     // Visual Countdown every 1 second
//     const countdownInterval = setInterval(() => {
//       setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);

//     return () => {
//       isMounted = false;
//       clearInterval(refreshInterval);
//       clearInterval(countdownInterval);
//     };
//   }, [isEnabled, getToken]);

//   return { qrData, timeLeft, loading };
// };

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";

export const useSecureQR = (isPremium: boolean) => {
  const { getToken } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  // 🛡️ SAFETY GUARD: Tracks the last time we successfully fetched
  const lastFetchTime = useRef<number>(0);

  useEffect(() => {
    // If user is not premium, do nothing
    if (!isPremium) {
      setQrData(null);
      return;
    }

    let isMounted = true;

    const fetchQR = async () => {
      const now = Date.now();

      // 🛑 THROTTLE: If we fetched less than 15 seconds ago, STOP.
      // This prevents the "spam every second" bug if a parent re-renders.
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
          lastFetchTime.current = Date.now(); // Mark success time
        }
      } catch (e) {
        console.error("QR Fetch failed", e);
      }
    };

    // 1. Fetch immediately on mount
    fetchQR();

    // 2. Set API refresh interval (every 55s)
    const refreshInterval = setInterval(fetchQR, 55000);

    // 3. Set Visual countdown (every 1s) - This causes re-renders, but won't trigger fetchQR
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };

    // ⚠️ CRITICAL: Only depend on the BOOLEAN 'isPremium', not the object 'premium'
    // and do NOT put 'getToken' here if it changes often.
  }, [isPremium]);

  return { qrData, timeLeft };
};