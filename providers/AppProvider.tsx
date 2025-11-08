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
  UpdateUserProfileReq,
  FriendDiscoveryDisplayProfileResponse,
  YourMixPostData,
  DrunkThought,
  AlcoholDbItem,
} from "../types/api.types";
import { apiService } from "@/api";
import { Alert } from "react-native";

interface AppContextType {
  // Data
  userData: UserData | null;
  userStats: UserStats | null;
  leaderboard: Leaderboard | null;
  achievements: Achievement[] | null;
  calendar: CalendarResponse | null;
  weeklyStats: DaysStat | null;
  friends: UserData[] | [];
  discovery: UserData[] | [];
  yourMixData: YourMixPostData[] | [];
  mixTimelineData: YourMixPostData[] | [];
  friendDiscoveryProfile: FriendDiscoveryDisplayProfileResponse | null;
  drunkThought: string | null;
  friendsDrunkThoughts: DrunkThought[] | [];
  alcoholCollection: AlcoholDbItem[] | [];

  // Refresh Functions
  refreshUserData: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshCalendar: (year?: number, month?: number) => Promise<void>;
  refreshWeeklyStats: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshDiscovery: () => Promise<void>;
  refreshYourMixData: () => Promise<void>;
  refreshMixTimelineData: () => Promise<void>;
  refreshDrunkThought: () => Promise<void>;
  refreshFriendsDrunkThoughs: () => Promise<void>;
  refreshUserAlcoholCollection: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Actions
  addDrinking: (
    drinkToday: boolean,
    imageUri?: string | null,
    locationText?: string,
    mentionedBuddies?: UserData[] | []
  ) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  searchUsers: (searchQuery: string) => Promise<UserData[]>;
  updateUserProfile: (updateReq: UpdateUserProfileReq) => Promise<any>;
  getFriendDiscoveryDisplayProfile: (friendDiscoveryId: string) => Promise<any>;
  deleteUserAccount: () => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<void>;
  addDrunkThought: (drunkThought: string) => Promise<void>;

  // Global State
  isLoading: boolean;
  isInitialLoading: boolean;
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
  const [discovery, setDiscovery] = useState<UserData[] | []>([]);
  const [yourMixData, setYourMixData] = useState<YourMixPostData[] | []>([]);
  const [mixTimelineData, setMixTimelineData] = useState<
    YourMixPostData[] | []
  >([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [drunkThought, setDrunkThought] = useState<string | null>(null);
  const [friendsDrunkThoughts, setFriendsDrunkThoughts] = useState<
    DrunkThought[] | []
  >([]);
const [alcoholCollection, setAlcoholCollection] = useState<
    AlcoholDbItem[] | []
  >([]);
  const [friendDiscoveryProfile, setFriendDiscoveryProfile] =
    useState<FriendDiscoveryDisplayProfileResponse | null>(null);

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

  const refreshDiscovery = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getDiscovery(token);
      },
      (data) => setDiscovery(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshYourMixData = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getYourMixData(token);
      },
      (data) => setYourMixData(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshMixTimelineData = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getMixTimeline(token);
      },
      (data) => setMixTimelineData(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshDrunkThought = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getDrunkThought(token);
      },
      (data) => setDrunkThought(data || null)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshFriendsDrunkThoughs = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getFriendsDrunkThoughts(token);
      },
      (data) => setFriendsDrunkThoughts(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]); 
  
  const refreshUserAlcoholCollection = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUserAlcoholCollection(token);
      },
      (data) => setAlcoholCollection(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  // ============================================
  // Refresh All - Using Parallel Execution
  // ============================================

  const refreshAll = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const results = await Promise.allSettled([
        apiService.fetchUser(token),
        apiService.getUserStats(token),
        apiService.getFriendsLeaderboard(token),
        apiService.getAchievements(token),
        apiService.getCurrentMonthCalendar(token),
        apiService.getFriends(token),
        apiService.getDiscovery(token),
        apiService.getYourMixData(token),
        apiService.getMixTimeline(token),
        apiService.getWeeklyStats(token),
        apiService.getDrunkThought(token),
        apiService.getFriendsDrunkThoughts(token),
      ]);

      // Extract successful results and handle failures
      const [
        userResult,
        statsResult,
        boardResult,
        achievResult,
        calResult,
        friendsResult,
        discoveryResult,
        yourMixDataResult,
        mixTimelineDataResult,
        weeklyResult,
        drunkThoughtResult,
        friendsDrunkThoughtsResult,
      ] = results;

      if (userResult.status === "fulfilled") {
        setUserData(userResult.value);
      } else {
        console.error("Failed to fetch user:", userResult.reason);
      }

      if (statsResult.status === "fulfilled") {
        setUserStats(statsResult.value);
      } else {
        console.error("Failed to fetch user stats:", statsResult.reason);
      }

      if (boardResult.status === "fulfilled") {
        setLeaderboard(boardResult.value);
      } else {
        console.error("Failed to fetch leaderboard:", boardResult.reason);
        setLeaderboard({ entries: [], total_users: 0 });
      }

      if (achievResult.status === "fulfilled") {
        setAchievements(achievResult.value);
      } else {
        console.error("Failed to fetch achievements:", achievResult.reason);
      }

      if (calResult.status === "fulfilled") {
        setCalendar(calResult.value);
      } else {
        console.error("Failed to fetch calendar:", calResult.reason);
      }

      if (friendsResult.status === "fulfilled") {
        setFriends(friendsResult.value);
      } else {
        console.error("Failed to fetch friends:", friendsResult.reason);
        setFriends([]);
      }

      if (discoveryResult.status === "fulfilled") {
        setDiscovery(discoveryResult.value);
      } else {
        console.error("Failed to fetch friends:", discoveryResult.reason);
        setDiscovery([]);
      }

      if (yourMixDataResult.status === "fulfilled") {
        setYourMixData(yourMixDataResult.value);
      } else {
        console.error("Failed to mix timeline data:", yourMixDataResult.reason);
        setYourMixData([]);
      }

      if (mixTimelineDataResult.status === "fulfilled") {
        setMixTimelineData(mixTimelineDataResult.value);
      } else {
        console.error(
          "Failed to mix timeline data:",
          mixTimelineDataResult.reason
        );
        setMixTimelineData([]);
      }

      if (weeklyResult.status === "fulfilled") {
        setWeeklyStats(weeklyResult.value);
      } else {
        console.error("Failed to fetch weekly stats:", weeklyResult.reason);
      }

      if (drunkThoughtResult.status === "fulfilled") {
        setDrunkThought(drunkThoughtResult.value);
      } else {
        setDrunkThought(null);
        console.error(
          "Failed to fetch drunk thought:",
          drunkThoughtResult.reason
        );
      }

      if (friendsDrunkThoughtsResult.status === "fulfilled") {
        setFriendsDrunkThoughts(friendsDrunkThoughtsResult.value);
      } else {
        setFriendsDrunkThoughts([]);
        console.error(
          "Failed to fetch friends drunk thoughts:",
          friendsDrunkThoughtsResult.reason
        );
      }

      // Collect any errors
      const failedCalls = results.filter((r) => r.status === "rejected");
      if (failedCalls.length > 0) {
        setError(
          `${failedCalls.length} API call(s) failed. Some data may be incomplete.`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("RefreshAll Error:", err);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  // ============================================
  // Actions
  // ============================================

  const addDrinking = useCallback(
    async (
      drinkToday: boolean,
      imageUri?: string | null,
      locationText?: string,
      mentionedBuddies?: UserData[] | []
    ) => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to log drinking");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        await apiService.addDrinking(
          {
            drank_today: drinkToday,
            image_url: imageUri,
            location_text: locationText,
            mentioned_buddies: mentionedBuddies,
          },
          token
        );

        // Refresh relevant data after logging
        const [userData, stats, board, cal, weekly] = await Promise.all([
          apiService.fetchUser(token),
          apiService.getUserStats(token),
          apiService.getFriendsLeaderboard(token),
          apiService.getCurrentMonthCalendar(token),
          apiService.getWeeklyStats(token),
        ]);

        return { userData, stats, board, cal, weekly };
      });

      if (result) {
        setUserData(result.userData);
        setUserStats(result.stats);
        setLeaderboard(result.board);
        setCalendar(result.cal);
        setWeeklyStats(result.weekly);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const addDrunkThought = useCallback(
    async (drunkThought: string) => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to log drinking");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const newDrunkThought = await apiService.addDrunkThought(
          drunkThought,
          token
        );

        return newDrunkThought;
      });

      if (result) {
        setDrunkThought(result.drunk_thought);
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

        await apiService.addFriend(friendId, token);

        const [friends, discovery] = await Promise.all([
          apiService.getFriends(token),
          apiService.getDiscovery(token),
        ]);

        return { friends, discovery };
      });

      if (result) {
        setFriends(result.friends);
        setDiscovery(result.discovery);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to log drinking");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        await apiService.removeFriend(friendId, token);

        const [friends, discovery] = await Promise.all([
          apiService.getFriends(token),
          apiService.getDiscovery(token),
        ]);

        return { friends, discovery };
      });

      if (result) {
        setFriends(result.friends);
        setDiscovery(result.discovery);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const searchUsers = useCallback(
    async (searchQuery: string): Promise<UserData[]> => {
      if (!searchQuery.trim()) {
        Alert.alert("Error", "Please enter a username to search");
        return [];
      }

      if (!isSignedIn) {
        throw new Error("Must be signed in to search friends");
      }

      const result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const users = await apiService.searchUsers(searchQuery, token);
        return users;
      });

      return result || [];
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const updateUserProfile = useCallback(
    async (updateReq: UpdateUserProfileReq): Promise<any> => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to search friends");
      }

      let result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        await apiService.updateUserProfile(updateReq, token);

        const [user] = await Promise.all([apiService.fetchUser(token)]);

        return { user };
      });
      if (result) {
        setUserData(result.user);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const getFriendDiscoveryDisplayProfile = useCallback(
    async (friendDiscoveryId: string): Promise<any> => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to search friends");
      }

      let result = await withLoadingAndError(async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const friendDiscover =
          await apiService.getFriendDiscoveryDisplayProfile(
            friendDiscoveryId,
            token
          );

        return friendDiscover;
      });
      if (result) {
        setFriendDiscoveryProfile(result);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const deleteUserAccount = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) {
      throw new Error("Must be signed in to delete account");
    }

    const result = await withLoadingAndError(async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const success = await apiService.deleteUserAccount(token);
      return success;
    });

    if (result === true) {
      setUserData(null);
      setUserStats(null);
      setLeaderboard(null);
      setAchievements(null);
      setCalendar(null);
      setWeeklyStats(null);
      setFriends([]);
      setDiscovery([]);
      setFriendDiscoveryProfile(null);
      setError(null);

      hasInitialized.current = false;

      return true;
    }

    return false;
  }, [isSignedIn, getToken, withLoadingAndError]);

  // ============================================
  // Initial Load
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
      setIsInitialLoading(true);
    }
  }, [isSignedIn]);

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
    discovery,
    yourMixData,
    mixTimelineData,
    friendDiscoveryProfile,
    drunkThought,
    friendsDrunkThoughts,

    // Refresh Functions
    refreshUserData,
    refreshUserStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshCalendar,
    refreshWeeklyStats,
    refreshFriends,
    refreshDiscovery,
    refreshYourMixData,
    refreshMixTimelineData,
    refreshDrunkThought,
    refreshFriendsDrunkThoughs,
    refreshAll,

    // Actions
    addDrinking,
    addFriend,
    removeFriend,
    searchUsers,
    updateUserProfile,
    getFriendDiscoveryDisplayProfile,
    deleteUserAccount,
    addDrunkThought,

    // Global State
    isLoading,
    isInitialLoading,
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
