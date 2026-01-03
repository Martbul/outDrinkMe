import {
  Achievement,
  AddDrinkingRequest,
  AlcoholCollectionByType,
  CalendarResponse,
  CanvasItem,
  DailyDrinkingPostResponse,
  DaysStat,
  DrinkUpSubscription,
  DrunkThought,
  FriendDiscoveryDisplayProfileResponse,
  Friendship,
  FuncDataResponse,
  FuncSessionResponse,
  LeaderboardsResponse,
  MinVersionResponse,
  NotificationListResponse,
  SearchDbAlcoholResult,
  StorySegment,
  UnreadCountResponse,
  UpdateUserProfileReq,
  UserData,
  UserStats,
  UserStories,
  Venue,
  VideoPost,
} from "./types/api.types";

class ApiService {
  private baseUrl: string;

  constructor() {
    const apiUrl = process.env.EXPO_PUBLIC_OUTDRINKME_API_URL;

    if (!apiUrl) {
      console.warn("EXPO_PUBLIC_OUTDRINKME_API_URL not set, using localhost");
    }

    this.baseUrl = apiUrl || "http://localhost:3000";
    console.log("API initialized with base URL:", this.baseUrl);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit & { token?: string }): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (error) {
        console.log(error);
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      console.log(`Error response: ${errorText} | failed endpoint: ${endpoint}`);

      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }

      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    try {
      const data = await response.json();
      // console.log(`Success response:`, data);
      return data;
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      throw new Error("Invalid JSON response from server");
    }
  }

  async fetchUser(token: string, retries = 5): Promise<UserData> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Fetch user attempt ${attempt + 1}/${retries + 1}`);

        return await this.makeRequest<UserData>("/api/v1/user", {
          method: "GET",
          token,
        });
      } catch (err) {
        const isLastAttempt = attempt === retries;

        console.warn(`Attempt ${attempt + 1} failed:`, err);

        if (isLastAttempt) {
          throw err;
        }

        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw new Error("Unexpected fetch failure");
  }

  async createUser(userData: Partial<UserData>, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/v1/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async updateUserProfile(updateReq: UpdateUserProfileReq, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/v1/user/update-profile", {
      method: "PUT",
      token,
      body: JSON.stringify(updateReq),
    });
  }

  async deleteUser(token: string): Promise<void> {
    return this.makeRequest<void>("/api/v1/user", {
      method: "DELETE",
      token,
    });
  }

  async searchUsers(searchQuery: string, token: string): Promise<UserData[]> {
    const response = await this.makeRequest<UserData[]>(`/api/v1/user/search?q=${encodeURIComponent(searchQuery)}`, {
      method: "GET",
      token,
    });

    return response || [];
  }

  async searchDbAlcoholCollection(searchQuery: string, token: string): Promise<SearchDbAlcoholResult | null> {
    const response = await this.makeRequest<SearchDbAlcoholResult | null>(
      `/api/v1/user/search-db-alcohol?alcohol_name=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response;
  }

  async getUserAlcoholCollection(token: string): Promise<AlcoholCollectionByType> {
    const response = await this.makeRequest<AlcoholCollectionByType>(`/api/v1/user/alcohol-collection`, {
      method: "GET",
      token,
    });

    return response;
  }

  async removeFromAlcoholCollection(itemId: string, token: string): Promise<any> {
    const response = await this.makeRequest<any>(
      `/api/v1/user/alcohol-collection?itemId=${encodeURIComponent(itemId)}`,
      {
        method: "DELETE",
        token,
      }
    );

    return response;
  }

  async getUserStats(token: string): Promise<UserStats> {
    return this.makeRequest<UserStats>("/api/v1/user/stats", {
      method: "GET",
      token,
    });
  }

  async addDrinking(data: AddDrinkingRequest, token: string, date?: string): Promise<{ message: string }> {
    const url = date ? `/api/v1/user/drink?date=${encodeURIComponent(date)}` : `/api/v1/user/drink`;

    return await this.makeRequest(url, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async removeDrinking(token: string, date: string): Promise<{ message: string }> {
    console.log("devbug for remove drinking");
    return await this.makeRequest(`/api/v1/user/drink?date=${encodeURIComponent(date)}`, {
      method: "DELETE",
      token,
    });
  }

  async getLeaderboards(token: string): Promise<LeaderboardsResponse> {
    return this.makeRequest<LeaderboardsResponse>("/api/v1/user/leaderboards", {
      method: "GET",
      token,
    });
  }

  async getAchievements(token: string): Promise<Achievement[]> {
    return this.makeRequest<Achievement[]>("/api/v1/user/achievements", {
      method: "GET",
      token,
    });
  }

  async getWeeklyStats(token: string): Promise<DaysStat> {
    return this.makeRequest<DaysStat>("/api/v1/user/stats/weekly", {
      method: "GET",
      token,
    });
  }

  async getMonthlyStats(token: string): Promise<DaysStat> {
    return this.makeRequest<DaysStat>("/api/v1/user/stats/monthly", {
      method: "GET",
      token,
    });
  }

  async getYearlyStats(token: string): Promise<DaysStat> {
    return this.makeRequest<DaysStat>("/api/v1/user/stats/yearly", {
      method: "GET",
      token,
    });
  }

  async getAllTimeStats(token: string): Promise<DaysStat> {
    return this.makeRequest<DaysStat>("/api/v1/user/stats/all-time", {
      method: "GET",
      token,
    });
  }

  async getCalendar(year: number, month: number, token: string, displyUserId?: string): Promise<CalendarResponse> {
    const userIdParam = displyUserId || "";

    return this.makeRequest<CalendarResponse>(
      `/api/v1/user/calendar?year=${year}&month=${month}&displyUserId=${userIdParam}`,
      {
        method: "GET",
        token,
      }
    );
  }

  async getCurrentMonthCalendar(token: string): Promise<CalendarResponse> {
    const now = new Date();
    return this.getCalendar(now.getFullYear(), now.getMonth() + 1, token);
  }

  async getFriends(token: string): Promise<UserData[]> {
    const response = await this.makeRequest<UserData[]>("/api/v1/user/friends", {
      method: "GET",
      token,
    });

    return response || [];
  }

  async getDiscovery(token: string): Promise<UserData[]> {
    const response = await this.makeRequest<UserData[]>("/api/v1/user/discovery", {
      method: "GET",
      token,
    });

    return response || [];
  }

  async getFriendsDrunkThoughts(token: string): Promise<DrunkThought[]> {
    const response = await this.makeRequest<DrunkThought[]>("/api/v1/user/drunk-friend-thoughts", {
      method: "GET",
      token,
    });
    return response || [];
  }

  // private transformMixPosts(
  //   posts: DailyDrinkingPostResponse[]
  // ): YourMixPostData[] {
  //   return posts.map((post) => ({
  //     id: post.id,
  //     userId: post.user_id,
  //     userImageUrl: post.user_image_url,
  //     username: post.username,
  //     date: post.date,
  //     drankToday: post.drank_today,
  //     loggedAt: post.logged_at,
  //     imageUrl: post.image_url,
  //     imageWidth: post.image_width,
  //     imageHeight: post.image_height,
  //     locationText: post.location_text,
  //     alcohol: post.alcohol,
  //     mentionedBuddies: post.mentioned_buddies || [],
  //     sourceType: post.source_type,
  //     reactions: post.reactions || [],
  //   }));
  // }

  async getYourMixData(token: string, page: number = 1, limit: number = 20): Promise<DailyDrinkingPostResponse[]> {
    return this.makeRequest<DailyDrinkingPostResponse[]>(`/api/v1/user/your-mix?page=${page}&limit=${limit}`, {
      method: "GET",
      token,
    });
  }

  // async getYourMixData(
  //   token: string,
  //   page: number = 1,
  //   limit: number = 20
  // ): Promise<YourMixPostData[]> {
  //   try {
  //     const response = await this.makeRequest<DailyDrinkingPostResponse[]>(
  //       `/api/v1/user/your-mix?page=${page}&limit=${limit}`,
  //       {
  //         method: "GET",
  //         token,
  //       }
  //     );

  //     return this.transformMixPosts(response);
  //   } catch (error) {
  //     console.error("Failed to fetch Your Mix:", error);
  //     return [];
  //   }
  // }

  async getGlobalMixData(token: string, page: number = 1, limit: number = 20): Promise<DailyDrinkingPostResponse[]> {
    return this.makeRequest<DailyDrinkingPostResponse[]>(`/api/v1/user/global-mix?page=${page}&limit=${limit}`, {
      method: "GET",
      token,
    });
  }

  //  async getGlobalMixData(
  //   token: string,
  //   page: number = 1,
  //   limit: number = 20
  // ): Promise<YourMixPostData[]> {
  //   try {
  //     const response = await this.makeRequest<DailyDrinkingPostResponse[]>(
  //       `/api/v1/user/global-mix?page=${page}&limit=${limit}`,
  //       {
  //         method: "GET",
  //         token,
  //       }
  //     );

  //     return this.transformMixPosts(response);
  //   } catch (error) {
  //     console.error("Failed to fetch Global Mix:", error);
  //     return [];
  //   }
  // }
  async getMixTimeline(token: string): Promise<DailyDrinkingPostResponse[]> {
    return this.makeRequest<DailyDrinkingPostResponse[]>("/api/v1/user/mix-timeline", {
      method: "GET",
      token,
    });
  }

  async addMixVideo(videoUrl: string, caption: string, duration: number, token: string): Promise<any> {
    const response = await this.makeRequest<any>("/api/v1/user/mix-videos", {
      method: "POST",
      token,
      body: JSON.stringify({
        video_url: videoUrl,
        caption: caption,
        duration: duration,
      }),
    });

    if (response?.error) {
      throw new Error(response.error);
    }
    return response;
  }

  async getMixVideos(token: string): Promise<VideoPost[]> {
    try {
      const response = await this.makeRequest<any[]>("/api/v1/user/mix-videos", {
        method: "GET",
        token,
      });

      const transformed = response.map((video) => ({
        id: video.id,
        videoUrl: video.video_url,
        userId: video.user_id,
        username: video.username,
        userImageUrl: video.user_image_url,
        caption: video.caption || "",
        chips: video.chips || 0,
        duration: video.duration,
        createdAt: video.created_at,
      }));

      console.log("Transformed videos:", transformed); // Debug log

      return transformed;
    } catch (error) {
      console.error("Failed to fetch mix videos:", error);
      return [];
    }
  }

  async addChipsToVideo(token: string, videoId: string): Promise<boolean> {
    try {
      await this.makeRequest<{ message: string }>("/api/v1/user/mix-video-chips", {
        method: "POST",
        token,
        body: JSON.stringify({
          video_id: videoId,
        }),
      });

      return true;
    } catch (error) {
      console.error("Failed to add chips to video:", error);
      return false;
    }
  }

  async addFriend(friendId: string, token: string): Promise<Friendship> {
    return this.makeRequest<Friendship>("/api/v1/user/friends", {
      method: "POST",
      token,
      body: JSON.stringify({ friendId: friendId }),
    });
  }

  async getDrunkThought(token: string, date?: string): Promise<any> {
    const url = date ? `/api/v1/user/drunk-thought?date=${encodeURIComponent(date)}` : `/api/v1/user/drunk-thought`;

    const response = await this.makeRequest<any>(url, {
      method: "GET",
      token,
    });

    return response?.drunk_thought ?? null;
  }

  async addDrunkThought(drunkThought: string, token: string): Promise<{ message: string; drunk_thought: string }> {
    return this.makeRequest("/api/v1/user/drunk-thought", {
      method: "POST",
      token,
      body: JSON.stringify({ drunk_thought: drunkThought }),
    });
  }

  async removeFriend(friendId: string, token: string): Promise<void> {
    return this.makeRequest<void>(`/api/v1/user/friends?friendId=${friendId}`, {
      method: "DELETE",
      token,
    });
  }

  async updateUserGems(gems: number, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/v1/user/gems-reward", {
      method: "PUT",
      token,
      body: JSON.stringify({ gems }),
    });
  }
  async getFriendDiscoveryDisplayProfile(
    friendDiscoveryId: string,
    token: string
  ): Promise<
    Omit<FriendDiscoveryDisplayProfileResponse, "mix_posts"> & {
      mix_posts: DailyDrinkingPostResponse[];
    }
  > {
    try {
      const response = await this.makeRequest<FriendDiscoveryDisplayProfileResponse>(
        `/api/v1/user/friend-discovery/display-profile?friendDiscoveryId=${friendDiscoveryId}`,
        {
          method: "GET",
          token,
        }
      );

      return {
        ...response,
        mix_posts: response.mix_posts,
        inventory: response.inventory || {},
      };
    } catch (error) {
      console.error(`Failed to fetch friend discovery profile for ${friendDiscoveryId}:`, error);
      return {
        user: {} as UserData,
        stats: {
          current_streak: 0,
          total_weeks_won: 0,
          friends_count: 0,
        } as UserStats,
        achievements: [],
        mix_posts: [],
        is_friend: false,
        inventory: {}, // Return empty inventory on error
      };
    }
  }

  async deleteUserAccount(token: string) {
    return this.makeRequest<any>(`/api/v1/user/delete-account`, {
      method: "DELETE",
      token,
    });
  }

  async getStreak(token: string): Promise<{
    current_streak: number;
    longest_streak: number;
  }> {
    const stats = await this.getUserStats(token);
    return {
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
    };
  }

  async submitFeedback(category: string, feedbackText: string, token: string) {
    return this.makeRequest(`/api/v1/user/feedback`, {
      method: "POST",
      token,
      body: JSON.stringify({ category, feedback_text: feedbackText }),
    });
  }

  async getUserInventory(token: string): Promise<any> {
    return this.makeRequest<any>("/api/v1/user/inventory", {
      method: "GET",
      token,
    });
  }

  async getStore(token: string): Promise<any> {
    return this.makeRequest<any>("/api/v1/store", {
      method: "GET",
      token,
    });
  }

  async purchaseStoreItem(itemId: string, token: string): Promise<any> {
    return this.makeRequest<any>("/api/v1/store/purchase/item", {
      method: "POST",
      token,
      body: JSON.stringify({ item_id: itemId }),
    });
  }
  async getAllNotifications(
    token: string,
    page: number = 1,
    pageSize: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationListResponse> {
    const query = `?page=${page}&page_size=${pageSize}&unread_only=${unreadOnly}`;

    return this.makeRequest<NotificationListResponse>(`/api/v1/notifications${query}`, {
      method: "GET",
      token,
    });
  }

  async getUnreadNotificationsCount(token: string): Promise<UnreadCountResponse> {
    return this.makeRequest<UnreadCountResponse>("/api/v1/notifications/unread-count", {
      method: "GET",
      token,
    });
  }

  async markNotificationAsRead(token: string, id: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/v1/notifications/${id}/read`, {
      method: "PUT",
      token,
    });
  }

  async markAllNotificationsAsRead(token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/v1/notifications/read-all`, {
      method: "PUT",
      token,
    });
  }

  async getNotificationPreferences(token: string): Promise<any> {
    return this.makeRequest<any>("/api/v1/notifications/preferences", {
      method: "GET",
      token,
    });
  }

  async editNotificationPreferences(token: string): Promise<any> {
    return this.makeRequest<any>("/api/v1/notifications/preferences", {
      method: "PUT",
      token,
    });
  }

  async registerDevice(token: string, data: { token: string; platform: "android" | "ios" | "web" }): Promise<any> {
    return this.makeRequest<any>("/api/v1/notifications/register-device", {
      method: "POST",
      token,
      body: JSON.stringify(data), // You must send the body
    });
  }

  //!create is basicly creating and joingin
  async createDrinkingGame(gameType: string, token: string): Promise<{ sessionId: string; wsUrl: string }> {
    return this.makeRequest<{ sessionId: string; wsUrl: string }>(`/api/v1/drinking-games/create`, {
      method: "POST",
      token,
      body: JSON.stringify({
        game_type: gameType,
      }),
    });
  }

  /**
   * Checks if a session exists and returns metadata (Host name, Game Type).
   * Used when a user types a code to join manually.
   * Backend Route: GET /api/v1/games/{sessionId}
   */
  async getGameSessionDetails(
    sessionId: string,
    token: string
  ): Promise<{
    exists: boolean;
    hostUsername?: string;
    gameType?: string;
    playerCount?: number;
  }> {
    return this.makeRequest<any>(`/api/v1/drinking-games/${sessionId}`, {
      method: "GET",
      token,
    });
  }

  /**
   * Fetches a list of currently active public games.
   * Backend Route: GET /api/v1/games/public
   */
  async getPublicGames(token: string): Promise<
    {
      sessionId: string;
      gameType: string;
      hostId: string;
      hostUsername: string;
      players: number;
    }[]
  > {
    return this.makeRequest<any>("/api/v1/drinking-games/public", {
      method: "GET",
      token,
    });
  }

  async getMinRequiredAppVersion(token: string): Promise<MinVersionResponse> {
    return this.makeRequest<any>("/api/v1/min-version", {
      method: "GET",
      token,
    });
  }

  async getAlcoholismChart(token: string, period: string): Promise<any> {
    return this.makeRequest<any>(`/api/v1/user/alcoholisum_chart?period=${period}`, {
      method: "GET",
      token,
    });
  }

  async getMapFriendsPosts(token: string): Promise<DailyDrinkingPostResponse[]> {
    return this.makeRequest<DailyDrinkingPostResponse[]>("/api/v1/user/map-friend-posts", {
      method: "GET",
      token,
    });
  }

  async getMemoryWall(postId: string, token: string): Promise<CanvasItem[]> {
    return this.makeRequest<CanvasItem[]>(`/api/v1/user/memory-wall/${postId}`, {
      method: "GET",
      token,
    });
  }

  async saveMemoryWall(
    postId: string,
    items: CanvasItem[],
    reactions: CanvasItem[],
    token: string
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/api/v1/user/memory-wall", {
      method: "POST",
      token,
      body: JSON.stringify({
        post_id: postId,
        wall_items: items,
        reactions: reactions,
      }),
    });
  }

  async createFunction(token: string): Promise<FuncSessionResponse> {
    return this.makeRequest<FuncSessionResponse>("/api/v1/func/create", {
      method: "GET",
      token,
    });
  }

  async joinFunction(token: string, qrToken: string) {
    return this.makeRequest<{ funcId: string }>("/api/v1/func/join", {
      method: "POST",
      token,
      body: JSON.stringify({
        qr_token: qrToken,
      }),
    });
  }

  async getFuncData(token: string, funcId: string): Promise<FuncDataResponse> {
    return this.makeRequest<FuncDataResponse>(`/api/v1/func/data/${funcId}`, {
      method: "GET",
      token,
    });
  }

  async uploadImages(token: string, funcId: string, imageUrls: string[]) {
    return this.makeRequest("/api/v1/func/upload", {
      method: "POST",
      token,
      body: JSON.stringify({
        funcId: funcId,
        imageUrls: imageUrls,
      }),
    });
  }

  async getActiveSession(token: string): Promise<FuncDataResponse> {
    return this.makeRequest<FuncDataResponse>("/api/v1/func/active", {
      method: "GET",
      token,
    });
  }

  async leaveFunction(token: string, funcId: string): Promise<void> {
    return this.makeRequest("/api/v1/func/leave", {
      method: "POST",
      token,
      body: JSON.stringify({
        funcId: funcId,
      }),
    });
  }

  async deleteImages(token: string, imageUrls: string[], funcId: string): Promise<void> {
    return this.makeRequest("/api/v1/func/delete", {
      method: "DELETE",
      token,
      body: JSON.stringify({
        image_urls: imageUrls,
        func_id: funcId,
      }),
    });
  }

  async getStories(token: string): Promise<UserStories[]> {
    return this.makeRequest("/api/v1/user/stories", {
      method: "GET",
      token,
    });
  }

  async getUserStories(token: string): Promise<StorySegment[]> {
    return this.makeRequest("/api/v1/user/user-stories", {
      method: "GET",
      token,
    });
  }

  async createStory(
    token: string,
    data: {
      videoUrl: string;
      width: number;
      height: number;
      duration: number;
      taggedBuddies: string[];
    }
  ): Promise<void> {
    return this.makeRequest("/api/v1/user/stories", {
      method: "POST",
      token,
      body: JSON.stringify({
        video_url: data.videoUrl,
        width: data.width,
        height: data.height,
        duration: data.duration,
        tagged_buddies: data.taggedBuddies,
      }),
    });
  }

  async deleteStory(token: string, storyId: string): Promise<void> {
    const story_id = storyId;
    return this.makeRequest(`/api/v1/user/stories/${story_id}`, {
      method: "DELETE",
      token,
    });
  }

  async relateStory(token: string, storyId: string, action: "like"): Promise<void> {
    return this.makeRequest("/api/v1/user/stories/relate", {
      method: "POST",
      token,
      body: JSON.stringify({ story_id: storyId, action }),
    });
  }

  async markStoryAsSeen(token: string, storyId: string): Promise<void> {
    return this.makeRequest("/api/v1/user/stories/seen", {
      method: "POST",
      token,
      body: JSON.stringify({ story_id: storyId }),
    });
  }

  async getDrinkUpSubscriptionDetails(token: string): Promise<DrinkUpSubscription> {
    return this.makeRequest("/api/v1/user/subscription", {
      method: "GET",
      token,
    });
  }

  async makeDrinkUpSubscription(token: string): Promise<void> {
    return this.makeRequest("/api/v1/user/subscription", {
      method: "POST",
      token,
    });
  }

  async getAllVenues(token: string): Promise<Venue[]> {
    return this.makeRequest("/api/v1/venues", {
      method: "GET",
      token,
    });
  }

  getWebSocketUrl(sessionId: string): string {
    const rawHost = this.baseUrl.replace(/^https?:\/\//, "");
    const protocol = this.baseUrl.startsWith("https") ? "wss" : "ws";
    return `${protocol}://${rawHost}/api/v1/drinking-games/ws/${sessionId}`;
  }
}

export const apiService = new ApiService();
