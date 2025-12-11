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
import type {
  UserStats,
  LeaderboardsResponse,
  Achievement,
  CalendarResponse,
  DaysStat,
  UserData,
  UpdateUserProfileReq,
  FriendDiscoveryDisplayProfileResponse,
  YourMixPostData,
  DrunkThought,
  AlcoholCollectionByType,
  StoreItems,
  InventoryItems,
  NotificationItem,
  SideQuestBoard,
  MinVersionResponse,
} from "../types/api.types";
import { apiService } from "@/api";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerPushNotification";
import { Alert, Platform } from "react-native";
import * as Application from "expo-application"; // Correctly imported

interface AppContextType {
  // Data
  userData: UserData | null;
  userStats: UserStats | null;
  userInventory: InventoryItems | null;
  storeItems: StoreItems | null;
  leaderboard: LeaderboardsResponse | null;
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
  alcoholCollection: AlcoholCollectionByType | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  sideQuestBoards: SideQuestBoard | null;

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
  refreshUserInventory: () => Promise<void>;
  refreshStore: () => Promise<void>;
  refreshNotifications: (page?: number) => Promise<void>;
  refreshSideQuestBoard: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Actions
  addDrinking: (
    drinkToday: boolean,
    imageUri?: string | null,
    locationText?: string,
    alcohols?: string[] | [],
    mentionedBuddies?: UserData[] | []
  ) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  searchUsers: (searchQuery: string) => Promise<UserData[]>;
  updateUserProfile: (updateReq: UpdateUserProfileReq) => Promise<any>;
  getFriendDiscoveryDisplayProfile: (friendDiscoveryId: string) => Promise<any>;
  deleteUserAccount: () => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<void>;
  addDrunkThought: (drunkThought: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  registerPushDevice: (token: string) => Promise<void>;

  // Versioning
  showMandatoryUpdateModal: boolean;
  updateMessage: string;

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
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const posthog = usePostHog();


  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userInventory, setUserInventory] = useState<InventoryItems | null>(
    null
  );
  const [storeItems, setStoreItems] = useState<StoreItems | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardsResponse | null>(
    null
  );
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DaysStat | null>(null);
  const [friends, setFriends] = useState<UserData[] | []>([]);
  const [discovery, setDiscovery] = useState<UserData[] | []>([]);
  const [yourMixData, setYourMixData] = useState<YourMixPostData[] | []>([]);
  // ============================================
  const [mixTimelineData, setMixTimelineData] = useState<
    YourMixPostData[] | []
  >([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [drunkThought, setDrunkThought] = useState<string | null>(null);
  const [friendsDrunkThoughts, setFriendsDrunkThoughts] = useState<
    DrunkThought[] | []
  >([]);
  const [alcoholCollection, setAlcoholCollection] =
    useState<AlcoholCollectionByType | null>(null);
  const [friendDiscoveryProfile, setFriendDiscoveryProfile] =
    useState<FriendDiscoveryDisplayProfileResponse | null>(null);
  const [sideQuestBoards, setSideQuestBoards] = useState<SideQuestBoard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showMandatoryUpdateModal, setShowMandatoryUpdateModal] =
    useState(false);
  const [updateMessage, setUpdateMessage] = useState(
    "A new version of the app is available. Please update to continue."
  );

  const hasInitialized = useRef(false);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);


  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void,
      actionName: string = "unknown_action",
      // Added a flag to skip setting global loading for specific calls
      skipGlobalLoading: boolean = false // <--- KEEP THIS IF YOU WANT TO AVOID LOADING SPINNER FOR UPDATE CHECK
    ): Promise<T | null> => {
      try {
        if (!skipGlobalLoading) setIsLoading(true); // Conditional loading
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
        console.error("API Error:", actionName, err); // Log action name

        posthog?.capture("api_error", {
          action: actionName,
          error_message: errorMessage,
        });

        return null;
      } finally {
        if (!skipGlobalLoading) setIsLoading(false); // Conditional loading
      }
    },
    [posthog]
  );


  const registerPushDevice = useCallback(
    async (deviceToken: string) => {
      if (!isSignedIn) return;

      const token = await getToken();
      if (token) {
        apiService
          .registerDevice(token, {
            token: deviceToken,
            platform: Platform.OS === "android" ? "android" : "ios", // <--- CORRECTED PLATFORM
          })
          .catch((err) => console.error("Failed to register device:", err));
      }
    },
    [isSignedIn, getToken]
  );

  const refreshNotifications = useCallback(
    async (page = 1) => {
      if (!isSignedIn) return;

      await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          // Fetch list and count in parallel
          const [listRes, countRes] = await Promise.all([
            apiService.getAllNotifications(token, page, 50), // Fetch first 50
            apiService.getUnreadNotificationsCount(token),
          ]);

          return { list: listRes, count: countRes };
        },
        (data) => {
          setNotifications(data.list.notifications || []);
          setUnreadNotificationCount(data.count.unread_count);
        },
        "refresh_notifications"
      );
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  useEffect(() => {
    if (isSignedIn) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) registerPushDevice(token);
      });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          const recipientId = data?.recipient_user_id;
          const postId = data?.post_id;

          if (userData && recipientId && recipientId !== userData.id) {
            Alert.alert(
              "Switch Account",
              `This notification is for another account. Please switch accounts to view it.`,
              [{ text: "OK" }]
            );
            return;
          }

          if (data) {
            if (postId) {
              router.push({
                pathname: "/(tabs)/mix",
                params: { openPostId: postId as any },
              });
            } else {
              router.push("/(tabs)/mix");
            }
          }

          refreshNotifications();
        });
    }

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isSignedIn, userData, refreshNotifications, registerPushDevice]);

  // ============================================
  // IN-APP UPDATE LOGIC (Defined after its state setters)
  // ============================================
  const checkForMandatoryUpdate = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) {
      console.warn("User not signed in, skipping mandatory update check.");
      return false;
    }

    try {
      // Use withLoadingAndError but skip global loading as this check
      // might happen very early and we might show a different UI (the modal).
      const minVersionResponse: MinVersionResponse | null =
        await withLoadingAndError(
          async () => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return await apiService.getMinRequiredAppVersion(token);
          },
          undefined,
          "get_min_required_version",
          true // Skip global loading for this call
        );

      if (!minVersionResponse) {
        console.warn(
          "Failed to retrieve minimum version response from server."
        );
        return false;
      }

      const currentAppVersionCode = Application.nativeBuildVersion
        ? parseInt(Application.nativeBuildVersion, 10)
        : 0;

      if (currentAppVersionCode === 0) {
        console.warn("Could not determine current app version code.");
        return false;
      }

      let minRequiredVersion = 0;

      if (Platform.OS === "android") {
        minRequiredVersion = minVersionResponse.min_android_version_code;
      } else if (Platform.OS === "ios") {
        minRequiredVersion = minVersionResponse.min_ios_version_code;
      } else {
        console.warn("Unsupported platform for in-app updates.");
        return false;
      }

      if (currentAppVersionCode < minRequiredVersion) {
        console.log(
          `Current version (${currentAppVersionCode}) is older than minimum required (${minRequiredVersion}).`
        );
        setUpdateMessage(
          minVersionResponse.update_message ||
            "A new version of the app is available. Please update to continue."
        );
        setShowMandatoryUpdateModal(true);
        posthog?.capture("mandatory_update_prompted", {
          current_version: currentAppVersionCode,
          min_required_version: minRequiredVersion,
          platform: Platform.OS,
        });
        return true; // An update is mandatory
      } else {
        setShowMandatoryUpdateModal(false);
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error during update check";
      console.error("Error checking for mandatory update:", errorMessage);
      posthog?.capture("mandatory_update_check_failed", {
        error_message: errorMessage,
        platform: Platform.OS,
      });
      return false;
    }
  }, [
    isSignedIn,
    getToken,
    posthog,
    setUpdateMessage,
    setShowMandatoryUpdateModal,
    withLoadingAndError,
  ]);

  const refreshUserData = useCallback(async () => {
    if (!isSignedIn) return;
    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.fetchUser(token);
      },
      (data) => {
        setUserData(data);
        posthog?.identify(data.id, {
          username: data.username,
          email: data.email,
          gems: data.gems,
          xp: data.xp,
          allDaysDrinkingCount: data.allDaysDrinkingCount,
        });
      },
      "refresh_user_data"
    );
  }, [isSignedIn, getToken, withLoadingAndError, posthog]);

  const refreshUserStats = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUserStats(token);
      },
      (data) => setUserStats(data),
      "refresh_user_stats"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshLeaderboard = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getLeaderboards(token);
      },
      (data) => setLeaderboard(data),
      "refresh_leaderboard"
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
      (data) => setAchievements(data),
      "refresh_achievements"
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
        (data) => setCalendar(data),
        "refresh_calendar"
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
      (data) => setWeeklyStats(data),
      "refresh_weekly_stats"
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
      (data) => setFriends(data),
      "refresh_friends"
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
      (data) => setDiscovery(data),
      "refresh_discovery"
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
      (data) => setYourMixData(data),
      "refresh_your_mix_data"
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
      (data) => setMixTimelineData(data),
      "refresh_mix_timeline_data"
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
      (data) => setDrunkThought(data || null),
      "refresh_drunk_thought"
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
      (data) => setFriendsDrunkThoughts(data),
      "refresh_friends_drunk_thoughts"
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
      (data) => setAlcoholCollection(data),
      "refresh_user_alcohol_collection"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshUserInventory = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUserInventory(token);
      },
      (data) => setUserInventory(data),
      "refresh_user_inventory"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshStore = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getStore(token);
      },
      (data) => setStoreItems(data),
      "refresh_store"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshSideQuestBoard = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getBoardQuests(token);
      },
      (data) => setSideQuestBoards(data),
      "refresh_sidequest_board"
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

      // Before fetching any user data, check for mandatory updates
      const updateRequired = await checkForMandatoryUpdate();
      if (updateRequired) {
        // If an update is required, we stop all other data fetching
        // The modal will be shown, prompting the user to update.
        setIsInitialLoading(false);
        setIsLoading(false);
        return;
      }

      const results = await Promise.allSettled([
        apiService.fetchUser(token),
        apiService.getUserStats(token),
        apiService.getLeaderboards(token),
        apiService.getAchievements(token),
        apiService.getCurrentMonthCalendar(token),
        apiService.getFriends(token),
        apiService.getDiscovery(token),
        apiService.getYourMixData(token),
        apiService.getMixTimeline(token),
        apiService.getWeeklyStats(token),
        apiService.getDrunkThought(token),
        apiService.getFriendsDrunkThoughts(token),
        apiService.getUserAlcoholCollection(token),
        apiService.getUserInventory(token),
        apiService.getStore(token),
        apiService.getAllNotifications(token, 1, 50),
        apiService.getUnreadNotificationsCount(token),
        apiService.getBoardQuests(token),
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
        userAlcoholCollectionResult,
        inventoryResult,
        storeResult,
        notifListResult,
        notifCountResult,
        SideQuestBoardResult,
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
        setLeaderboard({
          global: { entries: [], total_users: 0 },
          friends: { entries: [], total_users: 0 },
        });
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

      if (userAlcoholCollectionResult.status === "fulfilled") {
        setAlcoholCollection(userAlcoholCollectionResult.value);
      } else {
        setAlcoholCollection(null);
        console.error(
          "Failed to fetchuser alcohol collection:",
          userAlcoholCollectionResult.reason
        );
      }

      if (inventoryResult.status === "fulfilled") {
        setUserInventory(inventoryResult.value);
      } else {
        setUserInventory(null);
        console.error(
          "Failed to fetch user inventory:",
          inventoryResult.reason
        );
      }

      if (storeResult.status === "fulfilled") {
        setStoreItems(storeResult.value);
      } else {
        setStoreItems(null);
        console.error("Failed to fetch store:", storeResult.reason);
      }
      if (notifListResult.status === "fulfilled") {
        setNotifications(notifListResult.value.notifications || []);
      }
      if (notifCountResult.status === "fulfilled") {
        setUnreadNotificationCount(notifCountResult.value.unread_count);
      }

      if (SideQuestBoardResult.status === "fulfilled") {
        setSideQuestBoards(SideQuestBoardResult.value);
      } else {
        setSideQuestBoards(null);
        console.error(
          "Failed to fetch sidequest board:",
          SideQuestBoardResult.reason
        );
      }
      // Collect any errors
      const failedCalls = results.filter((r) => r.status === "rejected");
      if (failedCalls.length > 0) {
        posthog?.capture("bulk_refresh_partial_failure", {
          fail_count: failedCalls.length,
        });
        setError(
          `${failedCalls.length} API call(s) failed. Some data may be incomplete.`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      posthog?.capture("bulk_refresh_fatal_error", {
        error: errorMessage,
      });

      setError(errorMessage);
      console.error("RefreshAll Error:", err);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [isSignedIn, getToken, checkForMandatoryUpdate, posthog]); // Added checkForMandatoryUpdate to dependencies

  // ============================================
  // Actions
  // ============================================
  const addDrinking = useCallback(
    async (
      drinkToday: boolean,
      imageUri?: string | null,
      locationText?: string,
      alcohols? : string[] | [],
      mentionedBuddies?: UserData[] | []
    ) => {
      if (!isSignedIn) throw new Error("Must be signed in");

      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          await apiService.addDrinking(
            {
              drank_today: drinkToday,
              image_url: imageUri,
              location_text: locationText,
              alcohols: alcohols,
              mentioned_buddies: mentionedBuddies,
            },
            token
          );

          // Data refreshes...
          const [userData, stats, board, cal, weekly] = await Promise.all([
            apiService.fetchUser(token),
            apiService.getUserStats(token),
            apiService.getLeaderboards(token),
            apiService.getCurrentMonthCalendar(token),
            apiService.getWeeklyStats(token),
          ]);
          return { userData, stats, board, cal, weekly };
        },
        undefined,
        "add_drinking"
      ); // pass action name

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

      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          const newDrunkThought = await apiService.addDrunkThought(
            drunkThought,
            token
          );

          return newDrunkThought;
        },
        undefined,
        "add_drunk_thought"
      );

      if (result) {
        setDrunkThought(result.drunk_thought);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );
  const addFriend = useCallback(
    async (friendId: string) => {
      if (!isSignedIn) throw new Error("Must be signed in");

      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          await apiService.addFriend(friendId, token);

          // 7. Track Social Graph Change
          posthog?.capture("friend_added", { friend_id: friendId });

          const [friends, discovery] = await Promise.all([
            apiService.getFriends(token),
            apiService.getDiscovery(token),
          ]);
          return { friends, discovery };
        },
        undefined,
        "add_friend"
      );

      if (result) {
        setFriends(result.friends);
        setDiscovery(result.discovery);
      }
    },
    [isSignedIn, getToken, withLoadingAndError, posthog]
  );
  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!isSignedIn) throw new Error("Must be signed in");

      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          await apiService.removeFriend(friendId, token);

          // 8. Track Churn signal
          posthog?.capture("friend_removed", { friend_id: friendId });

          const [friends, discovery] = await Promise.all([
            apiService.getFriends(token),
            apiService.getDiscovery(token),
          ]);
          return { friends, discovery };
        },
        undefined,
        "remove_friend"
      );

      if (result) {
        setFriends(result.friends);
        setDiscovery(result.discovery);
      }
    },
    [isSignedIn, getToken, withLoadingAndError, posthog]
  );
  const searchUsers = useCallback(
    async (searchQuery: string): Promise<UserData[]> => {
      if (!searchQuery.trim()) return [];
      if (!isSignedIn) throw new Error("Must be signed in");

      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          // 9. Track Search Engagement
          posthog?.capture("user_search_performed", {
            query_length: searchQuery.length,
          });

          return await apiService.searchUsers(searchQuery, token);
        },
        undefined,
        "search_users"
      );

      return result || [];
    },
    [isSignedIn, getToken, withLoadingAndError, posthog]
  );

  const updateUserProfile = useCallback(
    async (updateReq: UpdateUserProfileReq): Promise<any> => {
      if (!isSignedIn) {
        throw new Error("Must be signed in to search friends");
      }

      let result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          await apiService.updateUserProfile(updateReq, token);

          const [user] = await Promise.all([apiService.fetchUser(token)]);

          return { user };
        },
        undefined,
        "update_user_uprofe"
      );
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

      let result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");

          const friendDiscover =
            await apiService.getFriendDiscoveryDisplayProfile(
              friendDiscoveryId,
              token
            );

          return friendDiscover;
        },
        undefined,
        "chech_discovry"
      );
      if (result) {
        setFriendDiscoveryProfile(result);
      }
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const deleteUserAccount = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) throw new Error("Must be signed in");

    const result = await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        posthog?.capture("account_deleted_initiated");

        return await apiService.deleteUserAccount(token);
      },
      undefined,
      "delete_account"
    );

    if (result === true) {
      posthog?.reset();
      setUserData(null);
      setFriends([]);
      setDiscovery([]);
      setError(null);
      hasInitialized.current = false;
      return true;
    }
    return false;
  }, [isSignedIn, getToken, withLoadingAndError, posthog]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!isSignedIn) return;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));

      const token = await getToken();
      if (token) {
        apiService.markNotificationAsRead(token, id).catch((err) => {
          console.error("Failed to mark read:", err);
        });
      }
    },
    [isSignedIn, getToken]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!isSignedIn) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
    setUnreadNotificationCount(0);

    const token = await getToken();
    if (token) {
      apiService.markAllNotificationsAsRead(token).catch(console.error);
    }
  }, [isSignedIn, getToken]);


  useEffect(() => {
    const initApp = async () => {
      if (isSignedIn && !hasInitialized.current) {
        hasInitialized.current = true;
        refreshAll();
      }

      if (!isSignedIn) {
        hasInitialized.current = false;
        setUserData(null);
        setUserStats(null);
        setLeaderboard(null);
        setAchievements(null);
        setCalendar(null);
        setWeeklyStats(null);
        setIsInitialLoading(true);
        setShowMandatoryUpdateModal(false);
        setUpdateMessage(
          "A new version of the app is available. Please update to continue."
        );
      }
    };

    initApp();
  }, [isSignedIn, refreshAll]);


  const value: AppContextType = {
    // Data
    userData,
    userStats,
    userInventory,
    storeItems,
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
    alcoholCollection,
    notifications,
    unreadNotificationCount,
    sideQuestBoards,

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
    refreshUserAlcoholCollection,
    refreshUserInventory,
    refreshStore,
    refreshNotifications,
    refreshSideQuestBoard,
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
    markNotificationRead,
    markAllNotificationsRead,
    registerPushDevice,

    showMandatoryUpdateModal, 
    updateMessage,

    // Global State
    isLoading,
    isInitialLoading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
