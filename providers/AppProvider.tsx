import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  UserStats,
  Leaderboard,
  Achievement,
  CalendarResponse,
  DaysStat,
  UserData,
} from "../types/api.types";
import { apiService } from "@/api";

interface AppContextType {
  // Data
  userData: UserData | null;
  userStats: UserStats | null;
  leaderboard: Leaderboard | null;
  achievements: Achievement[] | null;
  calendar: CalendarResponse | null;
  weeklyStats: DaysStat | null;
  friends: UserData[] | [];

  // Refresh Functions
  refreshUserData: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshCalendar: (year?: number, month?: number) => Promise<void>;
  refreshWeeklyStats: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Actions
  addDrinking: (drankToday: boolean) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;

  // Global State
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { getToken, isSignedIn } = useAuth();

  // State
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DaysStat | null>(null);
  const [friends, setFriends] = useState<UserData[] | []>([]);

  // Global loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if initial load has happened
  const hasInitialized = useRef(false);

  // ============================================
  // Centralized Loading/Error Handler
  // ============================================

  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiCall();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("API Error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================
  // Refresh Functions
  // ============================================

  const refreshUserData = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.fetchUser(token);
      },
      (data) => setUserData(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshUserStats = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUserStats(token);
      },
      (data) => setUserStats(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshLeaderboard = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getFriendsLeaderboard(token);
      },
      (data) => setLeaderboard(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshAchievements = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getAchievements(token);
      },
      (data) => setAchievements(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshCalendar = useCallback(
    async (year?: number, month?: number) => {
      if (!isSignedIn) return;

      await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          if (year && month) {
            return await apiService.getCalendar(year, month, token);
          } else {
            return await apiService.getCurrentMonthCalendar(token);
          }
        },
        (data) => setCalendar(data)
      );
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const refreshWeeklyStats = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getWeeklyStats(token);
      },
      (data) => setWeeklyStats(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshFriends = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getFriends(token);
      },
      (data) => setFriends(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  // ============================================
  // Refresh All - Using Parallel Execution
  // ============================================

  const refreshAll = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const [user, stats, board, achiev, cal, friends, weekly] =
        await Promise.all([
          apiService.fetchUser(token),
          apiService.getUserStats(token),
          apiService.getFriendsLeaderboard(token),
          apiService.getAchievements(token),
          apiService.getCurrentMonthCalendar(token),
          apiService.getFriends(token),
          apiService.getWeeklyStats(token),
        ]);

      // Update all state at once
      setUserData(user);
      setUserStats(stats);
      setLeaderboard(board);
      setAchievements(achiev);
      setCalendar(cal);
      setFriends(friends);
      setWeeklyStats(weekly);

      return true;
    });
  }, [isSignedIn, getToken, withLoadingAndError]);

  // ============================================
  // Actions
  // ============================================

  const addDrinking = useCallback(
    async (drankToday: boolean) => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to log drinking");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        await apiService.addDrinking({ drank_today: drankToday }, token);

        // Refresh relevant data after logging
        const [stats, board, cal, weekly] = await Promise.all([
          apiService.getUserStats(token),
          apiService.getFriendsLeaderboard(token),
          apiService.getCurrentMonthCalendar(token),
          apiService.getWeeklyStats(token),
        ]);

        return { stats, board, cal, weekly };
      });

      if (result) {
        setUserStats(result.stats);
        setLeaderboard(result.board);
        setCalendar(result.cal);
        setWeeklyStats(result.weekly);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const addFriend = useCallback(
    async (friendId: string) => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to log drinking");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        await apiService.addFriend( friendId , token);

        // Refresh relevant data after adding friend
        const [friends] = await Promise.all([apiService.getFriends(token)]);

        return { friends };
      });

      if (result) {
        setFriends(result.friends);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  // ============================================
  // Initial Load - FIXED to prevent infinite loop
  // ============================================

  useEffect(() => {
    if (isSignedIn && !hasInitialized.current) {
      hasInitialized.current = true;
      refreshAll();
    }

    // Reset initialization flag when user signs out
    if (!isSignedIn) {
      hasInitialized.current = false;
      setUserData(null);
      setUserStats(null);
      setLeaderboard(null);
      setAchievements(null);
      setCalendar(null);
      setWeeklyStats(null);
    }
  }, [isSignedIn]); // Only depend on isSignedIn, NOT refreshAll

  // ============================================
  // Context Value
  // ============================================

  const value: AppContextType = {
    // Data
    userData,
    userStats,
    leaderboard,
    achievements,
    calendar,
    weeklyStats,
    friends,

    // Refresh Functions
    refreshUserData,
    refreshUserStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshCalendar,
    refreshWeeklyStats,
    refreshFriends,
    refreshAll,

    // Actions
    addDrinking,
    addFriend,

    // Global State
    isLoading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================
// Hook to use the context
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
