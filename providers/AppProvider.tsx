import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  UserStats,
  Leaderboard,
  Achievement,
  CalendarResponse,
  DaysStat,
} from "../types/api.types";
import { apiService } from "@/api";

interface AppContextType {
  // User Stats
  userStats: UserStats | null;
  loadingStats: boolean;
  refreshUserStats: () => Promise<void>;

  // Leaderboard
  leaderboard: Leaderboard | null;
  loadingLeaderboard: boolean;
  refreshLeaderboard: () => Promise<void>;

  // Achievements
  achievements: Achievement[] | null;
  loadingAchievements: boolean;
  refreshAchievements: () => Promise<void>;

  // Calendar
  calendar: CalendarResponse | null;
  loadingCalendar: boolean;
  refreshCalendar: (year?: number, month?: number) => Promise<void>;

  // Actions
  addDrinking: (drankToday: boolean) => Promise<void>;

  // Weekly Stats
  weeklyStats: DaysStat | null;
  loadingWeeklyStats: boolean;
  refreshWeeklyStats: () => Promise<void>;

  // Refresh All
  refreshAll: () => Promise<void>;

  // Global Loading
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
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DaysStat | null>(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingWeeklyStats, setLoadingWeeklyStats] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Computed loading
  const isLoading =
    loadingStats ||
    loadingLeaderboard ||
    loadingAchievements ||
    loadingCalendar ||
    loadingWeeklyStats;

  // ============================================
  // Refresh Functions
  // ============================================

  const refreshUserStats = async () => {
    if (!isSignedIn) return;

    setLoadingStats(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const stats = await apiService.getUserStats(token);
      setUserStats(stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load stats";
      setError(errorMessage);
      console.error("Failed to load user stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const refreshLeaderboard = async () => {
    if (!isSignedIn) return;

    setLoadingLeaderboard(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const data = await apiService.getFriendsLeaderboard(token);
      setLeaderboard(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load leaderboard";
      setError(errorMessage);
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const refreshAchievements = async () => {
    if (!isSignedIn) return;

    setLoadingAchievements(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const data = await apiService.getAchievements(token);
      setAchievements(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load achievements";
      setError(errorMessage);
      console.error("Failed to load achievements:", err);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const refreshCalendar = async (year?: number, month?: number) => {
    if (!isSignedIn) return;

    setLoadingCalendar(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      let data: CalendarResponse;
      if (year && month) {
        data = await apiService.getCalendar(year, month, token);
      } else {
        data = await apiService.getCurrentMonthCalendar(token);
      }
      setCalendar(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load calendar";
      setError(errorMessage);
      console.error("Failed to load calendar:", err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const refreshWeeklyStats = async () => {
    if (!isSignedIn) return;

    setLoadingWeeklyStats(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const data = await apiService.getWeeklyStats(token);
      setWeeklyStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load weekly stats";
      setError(errorMessage);
      console.error("Failed to load weekly stats:", err);
    } finally {
      setLoadingWeeklyStats(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      refreshUserStats(),
      refreshLeaderboard(),
      refreshAchievements(),
      refreshCalendar(),
      refreshWeeklyStats(),
    ]);
  };

  // ============================================
  // Actions
  // ============================================

  const addDrinking = async (drankToday: boolean) => {
    if (!isSignedIn) {
      throw new Error("Must be signed in to log drinking");
    }

    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      await apiService.addDrinking({ drank_today: drankToday }, token);

      // Refresh relevant data after logging
      await Promise.all([
        refreshUserStats(),
        refreshLeaderboard(),
        refreshCalendar(),
        refreshWeeklyStats(),
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to log drinking";
      setError(errorMessage);
      console.error("Failed to log drinking:", err);
      throw err;
    }
  };

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (isSignedIn) {
      refreshAll();
    }
  }, [isSignedIn]);

  // ============================================
  // Context Value
  // ============================================

  const value: AppContextType = {
    // User Stats
    userStats,
    loadingStats,
    refreshUserStats,

    // Leaderboard
    leaderboard,
    loadingLeaderboard,
    refreshLeaderboard,

    // Achievements
    achievements,
    loadingAchievements,
    refreshAchievements,

    // Calendar
    calendar,
    loadingCalendar,
    refreshCalendar,

    // Weekly Stats
    weeklyStats,
    loadingWeeklyStats,
    refreshWeeklyStats,

    // Actions
    addDrinking,

    // Refresh All
    refreshAll,

    // Global
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
