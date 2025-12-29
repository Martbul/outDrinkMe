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
  UserStories,
  UploadJob,
  StoryUploadJob,
  StorySegment,
} from "../types/api.types";
import { apiService } from "@/api";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerPushNotification";
import { Alert, Platform } from "react-native";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system/legacy";

interface AppContextType {
  // Data
  userData: UserData | null;
  userStats: UserStats | null;
  userInventory: InventoryItems | null;
  userStories: StorySegment[];
  storeItems: StoreItems | null;
  leaderboard: LeaderboardsResponse | null;
  achievements: Achievement[] | null;
  calendar: CalendarResponse | null;
  weeklyStats: DaysStat | null;
  friends: UserData[] | [];
  discovery: UserData[] | [];
  stories: UserStories[];

  // --- Pagination Data ---
  yourMixData: YourMixPostData[] | [];
  yourMixHasMore: boolean;
  globalMixData: YourMixPostData[] | [];
  globalMixHasMore: boolean;

  mixTimelineData: YourMixPostData[] | [];
  friendDiscoveryProfile: FriendDiscoveryDisplayProfileResponse | null;
  drunkThought: string | null;
  friendsDrunkThoughts: DrunkThought[] | [];
  alcoholCollection: AlcoholCollectionByType | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  sideQuestBoards: SideQuestBoard | null;
  mapFriendPosts: YourMixPostData[] | [];
  storyUploadQueue: StoryUploadJob[];
  // Refresh Functions (Page 1)
  refreshUserData: () => Promise<void>;
  refreshUserStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshCalendar: (year?: number, month?: number) => Promise<void>;
  refreshWeeklyStats: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshDiscovery: () => Promise<void>;
  refreshStories: () => Promise<void>;
  refreshYourMixData: () => Promise<void>;
  refreshGlobalMixData: () => Promise<void>;
  refreshMixTimelineData: () => Promise<void>;
  refreshDrunkThought: () => Promise<void>;
  refreshFriendsDrunkThoughs: () => Promise<void>;
  refreshUserAlcoholCollection: () => Promise<void>;
  refreshUserInventory: () => Promise<void>;
  refreshStore: () => Promise<void>;
  refreshNotifications: (page?: number) => Promise<void>;
  refreshSideQuestBoard: () => Promise<void>;
  refreshUserStories: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // --- Pagination Actions (Load Next Page) ---
  loadMoreYourMixData: () => Promise<void>;
  loadMoreGlobalMixData: () => Promise<void>;

  // Actions
  addDrinking: (
    drinkToday: boolean,
    imageUri?: string | null,
    locationText?: string,
    locationCoords?: {
      latitude: number;
      longitude: number;
    } | null,
    alcohols?: string[] | [],
    mentionedBuddies?: UserData[] | [],
    imageWidth?: number,
    imageHeight?: number
  ) => Promise<void>;

  createStory: (data: {
    videoUrl: string;
    width: number;
    height: number;
    duration: number;
    taggedBuddies: string[];
  }) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  markStoryAsSeen: (storyId: string) => Promise<void>;

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
  const [userStories, setUserStories] = useState<StorySegment[]>([]);

  const [storeItems, setStoreItems] = useState<StoreItems | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardsResponse | null>(
    null
  );
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DaysStat | null>(null);
  const [friends, setFriends] = useState<UserData[] | []>([]);
  const [discovery, setDiscovery] = useState<UserData[] | []>([]);
  const [stories, setStories] = useState<UserStories[]>([]);

  const [yourMixData, setYourMixData] = useState<YourMixPostData[] | []>([]);
  const [yourMixPage, setYourMixPage] = useState(1);
  const [yourMixHasMore, setYourMixHasMore] = useState(true);

  // --- GLOBAL MIX PAGINATION STATE ---
  const [globalMixData, setGlobalMixData] = useState<YourMixPostData[] | []>(
    []
  );
  const [globalMixPage, setGlobalMixPage] = useState(1);
  const [globalMixHasMore, setGlobalMixHasMore] = useState(true);

  const [mapFriendPosts, setMapFriendPosts] = useState<YourMixPostData[] | []>(
    []
  );
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
  const [storyUploadQueue, setStoryUploadQueue] = useState<StoryUploadJob[]>(
    []
  );

  const hasInitialized = useRef(false);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const hasStoryUploadNotified = useRef(false);
  const isStoryProcessing = useRef(false);

  const updateStoryJobStatus = (
    id: string,
    status: StoryUploadJob["status"],
    progress: number
  ) => {
    setStoryUploadQueue((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status, progress } : job))
    );
  };

  const processStoryUpload = useCallback(
    async (job: StoryUploadJob) => {
      const token = await getToken();
      const CLOUDINARY_CLOUD_NAME =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_STORY_UPLOAD_PRESET;

      // 1. Validation
      if (!token || !CLOUDINARY_CLOUD_NAME || !PRESET) {
        console.error("Missing Config for upload");
        updateStoryJobStatus(job.id, "failed", 0);
        return;
      }

      try {
        updateStoryJobStatus(job.id, "uploading", 0);

        // 2. Cloudinary Upload (VIDEO endpoint)
        // Note: We use 'video/upload' instead of 'image/upload'
        const uploadTask = FileSystem.createUploadTask(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          job.uri,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: "file",
            parameters: {
              upload_preset: PRESET!,
              folder: "outdrinkme_story", // Optional: keep stories organized
              resource_type: "video", // Explicitly tell Cloudinary this is a video
            },
          },
          (p) => {
            if (p.totalBytesExpectedToSend > 0) {
              const progress = p.totalBytesSent / p.totalBytesExpectedToSend;
              // Only update state every ~5% to prevent UI lag
              updateStoryJobStatus(job.id, "uploading", progress);
            }
          }
        );

        const response = await uploadTask.uploadAsync();

        if (!response || response.status !== 200) {
          throw new Error(
            `Cloudinary Error: ${response?.status} - ${response?.body}`
          );
        }

        const cloudinaryData = JSON.parse(response.body);

        // 3. Save to DB (Create Story)
        // We use the secure_url from Cloudinary and the meta data stored in the job
        await apiService.createStory(token, {
          videoUrl: cloudinaryData.secure_url,
          width: job.meta.width,
          height: job.meta.height,
          duration: job.meta.duration,
          taggedBuddies: job.meta.taggedBuddies,
        });

        // 4. Cleanup & Analytics
        updateStoryJobStatus(job.id, "completed", 1);
        posthog?.capture("story_video_uploaded_success");

        // Refresh stories so the user sees it in their feed
        refreshStories();
      } catch (err) {
        console.error("Story Upload Job Failed:", err);
        updateStoryJobStatus(job.id, "failed", 0);
        posthog?.capture("story_video_uploaded_failed", { error: String(err) });
      }
    },
    [getToken, posthog]
  );

  useEffect(() => {
    const processQueue = async () => {
      const pendingJob = storyUploadQueue.find((j) => j.status === "pending");
      const activeJobs = storyUploadQueue.filter(
        (j) => j.status === "pending" || j.status === "uploading"
      );

      // If we have work to do...
      if (activeJobs.length > 0) {
        hasStoryUploadNotified.current = false;

        // If nothing is currently processing, start the next pending job
        if (pendingJob && !isStoryProcessing.current) {
          isStoryProcessing.current = true;
          await processStoryUpload(pendingJob);
          isStoryProcessing.current = false;
        }
      }
      // If queue is empty/finished...
      else if (storyUploadQueue.length > 0 && activeJobs.length === 0) {
        if (!hasStoryUploadNotified.current) {
          hasStoryUploadNotified.current = true;

          const completedCount = storyUploadQueue.filter(
            (j) => j.status === "completed"
          ).length;

          // Notify User
          if (completedCount > 0) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "Stories Uploaded",
                body: `Successfully posted ${completedCount} video stor${
                  completedCount > 1 ? "ies" : "y"
                }.`,
              },
              trigger: null,
            });
          }

          // Clear queue after a delay
          setTimeout(() => {
            setStoryUploadQueue([]);
            hasStoryUploadNotified.current = false;
          }, 5000);
        }
      }
    };

    processQueue();
  }, [storyUploadQueue, processStoryUpload]); // Dependencies

  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void,
      actionName: string = "unknown_action",
      skipGlobalLoading: boolean = false
    ): Promise<T | null> => {
      try {
        if (!skipGlobalLoading) setIsLoading(true);
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
        console.error("API Error:", actionName, err);

        posthog?.capture("api_error", {
          action: actionName,
          error_message: errorMessage,
        });

        return null;
      } finally {
        if (!skipGlobalLoading) setIsLoading(false);
      }
    },
    [posthog]
  );

  // ... (Keep registerPushDevice, refreshNotifications, and useEffect/notifications logic as is) ...
  const registerPushDevice = useCallback(
    async (deviceToken: string) => {
      if (!isSignedIn) return;
      const token = await getToken();
      if (token) {
        apiService
          .registerDevice(token, {
            token: deviceToken,
            platform: Platform.OS === "android" ? "android" : "ios",
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
          const [listRes, countRes] = await Promise.all([
            apiService.getAllNotifications(token, page, 50),
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
  }, [isSignedIn, userData, router, refreshNotifications, registerPushDevice]);

  const checkForMandatoryUpdate = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) return false;
    try {
      const minVersionResponse: MinVersionResponse | null =
        await withLoadingAndError(
          async () => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            return await apiService.getMinRequiredAppVersion(token);
          },
          undefined,
          "get_min_required_version",
          true
        );

      if (!minVersionResponse) return false;

      const currentAppVersionCode = Application.nativeBuildVersion
        ? parseInt(Application.nativeBuildVersion, 10)
        : 0;

      if (currentAppVersionCode === 0) return false;

      let minRequiredVersion = 0;
      if (Platform.OS === "android") {
        minRequiredVersion = minVersionResponse.min_android_version_code;
      } else if (Platform.OS === "ios") {
        minRequiredVersion = minVersionResponse.min_ios_version_code;
      }

      if (currentAppVersionCode < minRequiredVersion) {
        setUpdateMessage(
          minVersionResponse.update_message ||
            "A new version of the app is available. Please update to continue."
        );
        setShowMandatoryUpdateModal(true);
        return true;
      } else {
        setShowMandatoryUpdateModal(false);
        return false;
      }
    } catch (err) {
      return false;
    }
  }, [
    isSignedIn,
    getToken,
    setUpdateMessage,
    setShowMandatoryUpdateModal,
    withLoadingAndError,
  ]);

  // ... (Keep standard refreshes: userData, userStats, leaderboard, achievements, calendar, weeklyStats, friends, discovery) ...
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

  // ============================================
  // PAGINATION LOGIC: YOUR MIX
  // ============================================
  const refreshYourMixData = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        // Reset to page 1
        return await apiService.getYourMixData(token, 1);
      },
      (data) => {
        setYourMixData(data);
        setYourMixPage(1);
        setYourMixHasMore(data.length > 0);
      },
      "refresh_your_mix_data"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const loadMoreYourMixData = useCallback(async () => {
    if (!isSignedIn || !yourMixHasMore) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        const nextPage = yourMixPage + 1;
        return await apiService.getYourMixData(token, nextPage);
      },
      (newData) => {
        if (newData.length === 0) {
          setYourMixHasMore(false);
        } else {
          setYourMixData((prev) => [...prev, ...newData]);
          setYourMixPage((prev) => prev + 1);
        }
      },
      "load_more_your_mix",
      true // Skip global loading
    );
  }, [isSignedIn, getToken, withLoadingAndError, yourMixPage, yourMixHasMore]);

  // ============================================
  // PAGINATION LOGIC: GLOBAL MIX
  // ============================================
  const refreshGlobalMixData = useCallback(async () => {
    if (!isSignedIn) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        // Assuming your apiService has getGlobalMixData (or standard 'all posts' endpoint)
        return await apiService.getGlobalMixData(token, 1);
      },
      (data) => {
        setGlobalMixData(data);
        setGlobalMixPage(1);
        setGlobalMixHasMore(data.length > 0);
      },
      "refresh_global_mix_data"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const loadMoreGlobalMixData = useCallback(async () => {
    if (!isSignedIn || !globalMixHasMore) return;

    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        const nextPage = globalMixPage + 1;
        return await apiService.getGlobalMixData(token, nextPage);
      },
      (newData) => {
        if (newData.length === 0) {
          setGlobalMixHasMore(false);
        } else {
          setGlobalMixData((prev) => [...prev, ...newData]);
          setGlobalMixPage((prev) => prev + 1);
        }
      },
      "load_more_global_mix",
      true // Skip global loading
    );
  }, [
    isSignedIn,
    getToken,
    withLoadingAndError,
    globalMixPage,
    globalMixHasMore,
  ]);

  // ... (Keep other simple refreshes) ...
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

  const refreshUserStories = useCallback(async () => {
    if (!isSignedIn) return;
    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUserStories(token);
      },
      (data) => setUserStories(data),
      "refresh_user_stories"
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

  const refreshMapFriendPosts = useCallback(async () => {
    if (!isSignedIn) return;
    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getMapFriendsPosts(token);
      },
      (data) => setMapFriendPosts(data),
      "refresh_map_friends_posts"
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshStories = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (token) {
        const data = await apiService.getStories(token);
        setStories(data || []);
      }
    } catch (e) {
      console.error("Failed to load stories", e);
    }
  }, [isSignedIn, getToken]);

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
        apiService.getYourMixData(token, 1), // Page 1
        apiService.getGlobalMixData(token, 1), // Page 1 (New)
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
        apiService.getMapFriendsPosts(token),
        apiService.getStories(token),
        apiService.getUserStories(token),
      ]);

      const [
        userResult,
        statsResult,
        boardResult,
        achievResult,
        calResult,
        friendsResult,
        discoveryResult,
        yourMixDataResult,
        globalMixDataResult,
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
        mapFriendsPostsResult,
        storiesRes,
        userStoriesRes,
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

      if (globalMixDataResult.status === "fulfilled") {
        setGlobalMixData(globalMixDataResult.value);
      } else {
        console.error(
          "Failed to mix timeline data:",
          globalMixDataResult.reason
        );
        setGlobalMixData([]);
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

      if (mapFriendsPostsResult.status === "fulfilled") {
        setMapFriendPosts(mapFriendsPostsResult.value);
      } else {
        setMapFriendPosts([]);
        console.error(
          "Failed to fetch friends posts:",
          mapFriendsPostsResult.reason
        );
      }
      if (storiesRes.status === "fulfilled") {
        setStories(storiesRes.value || []);
      } else {
        console.error("Failed to fetch stories:", storiesRes.reason);
        setStories([]);
      }

      if (userStoriesRes.status === "fulfilled") {
        setUserStories(userStoriesRes.value || []);
      } else {
        console.error("Failed to fetch user stories:", userStoriesRes.reason);
        setUserStories([]);
      }
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
  }, [isSignedIn, getToken, checkForMandatoryUpdate, posthog]);

  const addDrinking = useCallback(
    async (
      drinkToday: boolean,
      imageUri?: string | null,
      locationText?: string,
      locationCoords?: { latitude: number; longitude: number } | null,
      alcohols?: string[] | [],
      mentionedBuddies?: UserData[] | [],
      imageWidth?: number,
      imageHeight?: number
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
              image_width: imageWidth,
              image_height: imageHeight,
              location_text: locationText,
              location_coords: locationCoords,
              alcohols: alcohols,
              mentioned_buddies: mentionedBuddies,
            },
            token
          );
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
      );
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

  const createStory = useCallback(
    async (data: {
      videoUrl: string; // This is the local file URI here
      width: number;
      height: number;
      duration: number;
      taggedBuddies: string[];
    }) => {
      // Create a new Job
      const newJob: StoryUploadJob = {
        id: Math.random().toString(36).substring(7),
        uri: data.videoUrl, // Local URI
        progress: 0,
        status: "pending",
        meta: {
          width: data.width,
          height: data.height,
          duration: data.duration,
          taggedBuddies: data.taggedBuddies,
        },
      };

      // Add to state (this triggers the useEffect)
      setStoryUploadQueue((prev) => [...prev, newJob]);

      // Optional: Navigate user away or show a toast saying "Uploading in background"
      posthog?.capture("story_upload_queued");
    },
    [posthog]
  );

  const deleteStory = useCallback(
    async (storyId: string) => {
      if (!isSignedIn) return;
      // Optimistic Update
      setStories((prev) => prev.filter((s) => s.id !== storyId));

      const token = await getToken();
      if (token) {
        apiService.deleteStory(token, storyId).catch(() => {
          refreshStories(); // Revert on failure
        });
      }
    },
    [isSignedIn, getToken, refreshStories]
  );

  // const markStoryAsSeen = useCallback(
  //   async (storyId: string) => {
  //     if (!isSignedIn) return;

  //     // Prevent redundant calls if already seen locally
  //     const story = stories.find((s) => s.id === storyId);
  //     if (story?.isSeen) return;

  //     // Optimistic Update
  //     setStories((prev) =>
  //       prev.map((s) => (s.id === storyId ? { ...s, isSeen: true } : s))
  //     );

  //     const token = await getToken();
  //     if (token) {
  //       // Fire and forget
  //       apiService.markStoryAsSeen(token, storyId, "view");
  //     }
  //   },
  //   [isSignedIn, getToken, stories]
  // );

  const markStoryAsSeen = useCallback(
    async (storyId: string) => {
      if (!isSignedIn) return;

      // 1. Find the story in the nested structure to check if already seen
      // We use flatMap to look through all items of all users
      const story = stories
        .flatMap((u) => u.items)
        .find((s) => s.id === storyId);

      // Use is_seen (to match your interface)
      if (!story || story.is_seen) return;

      // 2. Optimistic Update (Nested)
      setStories((prev) =>
        prev.map((user) => {
          // Check if this user actually contains the story we are updating
          const containsStory = user.items.some((s) => s.id === storyId);
          if (!containsStory) return user;

          // Update the items within this user
          const updatedItems = user.items.map((s) =>
            s.id === storyId ? { ...s, is_seen: true } : s
          );

          // 3. Optional: Automatically update 'all_seen' for the user
          const allSeen = updatedItems.every((s) => s.is_seen);

          return {
            ...user,
            items: updatedItems,
            all_seen: allSeen,
          };
        })
      );

      const token = await getToken();
      if (token) {
        // Fire and forget
        apiService.markStoryAsSeen(token, storyId);
      }
    },
    [isSignedIn, getToken, stories]
  );

  const addDrunkThought = useCallback(
    async (drunkThought: string) => {
      if (!isSignedIn) throw new Error("Must be signed in");
      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");
          return await apiService.addDrunkThought(drunkThought, token);
        },
        undefined,
        "add_drunk_thought"
      );
      if (result) setDrunkThought(result.drunk_thought);
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
      if (!searchQuery.trim() || !isSignedIn) return [];
      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");
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
    async (updateReq: UpdateUserProfileReq) => {
      if (!isSignedIn) throw new Error("Must be signed in");
      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");
          await apiService.updateUserProfile(updateReq, token);
          return { user: await apiService.fetchUser(token) };
        },
        undefined,
        "update_user_uprofe"
      );
      if (result) setUserData(result.user);
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const getFriendDiscoveryDisplayProfile = useCallback(
    async (friendDiscoveryId: string) => {
      if (!isSignedIn) throw new Error("Must be signed in");
      const result = await withLoadingAndError(
        async () => {
          const token = await getToken();
          if (!token) throw new Error("No auth token");
          return await apiService.getFriendDiscoveryDisplayProfile(
            friendDiscoveryId,
            token
          );
        },
        undefined,
        "chech_discovry"
      );
      if (result) setFriendDiscoveryProfile(result);
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const deleteUserAccount = useCallback(async () => {
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
      if (token)
        apiService.markNotificationAsRead(token, id).catch(console.error);
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
    if (token)
      apiService.markAllNotificationsAsRead(token).catch(console.error);
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
      }
    };
    initApp();
  }, [isSignedIn, refreshAll]);

  const value: AppContextType = {
    // Data
    userData,
    userStats,
    userInventory,
    userStories,
    storeItems,
    leaderboard,
    achievements,
    calendar,
    weeklyStats,
    friends,
    discovery,
    stories,

    // Pagination Data
    yourMixData,
    yourMixHasMore,
    globalMixData,
    globalMixHasMore,

    mixTimelineData,
    friendDiscoveryProfile,
    drunkThought,
    friendsDrunkThoughts,
    alcoholCollection,
    notifications,
    unreadNotificationCount,
    sideQuestBoards,
    mapFriendPosts,
    storyUploadQueue,

    // Refresh Functions
    refreshUserData,
    refreshUserStats,
    refreshLeaderboard,
    refreshAchievements,
    refreshCalendar,
    refreshWeeklyStats,
    refreshFriends,
    refreshDiscovery,
    refreshStories,

    refreshYourMixData,
    refreshGlobalMixData,

    refreshMixTimelineData,
    refreshDrunkThought,
    refreshFriendsDrunkThoughs,
    refreshUserAlcoholCollection,
    refreshUserInventory,
    refreshStore,
    refreshNotifications,
    refreshSideQuestBoard,
    refreshUserStories,
    refreshAll,

    // Pagination Actions
    loadMoreYourMixData,
    loadMoreGlobalMixData,

    // Actions
    addDrinking,
    createStory,
    deleteStory,
    markStoryAsSeen,
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
