import {
  Achievement,
  AddDrinkingRequest,
  AlcoholCollectionByType,
  CalendarResponse,
  DailyDrinkingPostResponse,
  DaysStat,
  DrunkThought,
  FriendDiscoveryDisplayProfileResponse,
  Friendship,
  Leaderboard,
  LeaderboardEntry,
  SearchDbAlcoholResult,
  StoreItem,
  UpdateUserProfileReq,
  UserData,
  UserStats,
  VideoPost,
  YourMixPostData,
} from "./types/api.types";

class ApiService {
  private baseUrl: string;

  constructor() {
    // Make sure the env variable exists
    const apiUrl = process.env.EXPO_PUBLIC_OUTDRINKME_API_URL;

    if (!apiUrl) {
      console.warn("EXPO_PUBLIC_OUTDRINKME_API_URL not set, using localhost");
    }

    this.baseUrl = apiUrl || "http://localhost:3000";
    console.log("API initialized with base URL:", this.baseUrl);
  }
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { token?: string }
  ): Promise<T> {
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
      } catch (readError) {
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      console.log(
        `Error response: ${errorText} | failed endpoint: ${endpoint}`
      );

      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }

      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    try {
      const data = await response.json();
      console.log(`Success response:`, data);
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

  async createUser(
    userData: Partial<UserData>,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>("/api/v1/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async updateUserProfile(
    updateReq: UpdateUserProfileReq,
    token: string
  ): Promise<UserData> {
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
    const response = await this.makeRequest<UserData[]>(
      `/api/v1/user/search?q=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response || [];
  }

  async searchDbAlcoholCollection(
    searchQuery: string,
    token: string
  ): Promise<SearchDbAlcoholResult | null> {
    const response = await this.makeRequest<SearchDbAlcoholResult | null>(
      `/api/v1/user/search-db-alcohol?alcohol_name=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response;
  }

  async getUserAlcoholCollection(
    token: string
  ): Promise<AlcoholCollectionByType> {
    const response = await this.makeRequest<AlcoholCollectionByType>(
      `/api/v1/user/alcohol-collection`,
      {
        method: "GET",
        token,
      }
    );

    return response;
  }

  async removeFromAlcoholCollection(
    itemId: string,
    token: string
  ): Promise<any> {
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

  async addDrinking(
    data: AddDrinkingRequest,
    token: string,
    date?: string
  ): Promise<{ message: string }> {
    console.log("devbug for add drinking");
    console.log(data, token);
    const url = date
      ? `/api/v1/user/drink?date=${encodeURIComponent(date)}`
      : `/api/v1/user/drink`;

    return await this.makeRequest(url, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  }

  async removeDrinking(
    token: string,
    date: string
  ): Promise<{ message: string }> {
    console.log("devbug for remove drinking");
    return await this.makeRequest(
      `/api/v1/user/drink?date=${encodeURIComponent(date)}`,
      {
        method: "DELETE",
        token,
      }
    );
  }

  async getFriendsLeaderboard(token: string): Promise<Leaderboard> {
    return this.makeRequest<Leaderboard>("/api/v1/user/leaderboard/friends", {
      method: "GET",
      token,
    });
  }
  async getGlobalLeaderboard(token: string): Promise<Leaderboard> {
    return this.makeRequest<Leaderboard>("/api/v1/user/leaderboard/global", {
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
  async getCalendar(
    year: number,
    month: number,
    token: string
  ): Promise<CalendarResponse> {
    return this.makeRequest<CalendarResponse>(
      `/api/v1/user/calendar?year=${year}&month=${month}`,
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
    const response = await this.makeRequest<UserData[]>(
      "/api/v1/user/friends",
      {
        method: "GET",
        token,
      }
    );

    return response || [];
  }

  async getDiscovery(token: string): Promise<UserData[]> {
    const response = await this.makeRequest<UserData[]>(
      "/api/v1/user/discovery",
      {
        method: "GET",
        token,
      }
    );

    return response || [];
  }

  async getFriendsDrunkThoughts(token: string): Promise<DrunkThought[]> {
    const response = await this.makeRequest<DrunkThought[]>(
      "/api/v1/user/drunk-friend-thoughts",
      {
        method: "GET",
        token,
      }
    );
    return response || [];
  }
  async getYourMixData(token: string): Promise<YourMixPostData[]> {
    try {
      const response = await this.makeRequest<DailyDrinkingPostResponse[]>(
        "/api/v1/user/your-mix",
        {
          method: "GET",
          token,
        }
      );

      console.log(response);

      const transformed = response.map((post) => ({
        id: post.ID,
        userId: post.UserID,
        userImageUrl: post.UserImageURL,
        date: post.Date,
        drankToday: post.DrankToday,
        loggedAt: post.LoggedAt,
        imageUrl: post.ImageURL,
        locationText: post.LocationText,
        mentionedBuddies: post.MentionedBuddies || [],
        sourceType: post.SourceType,
      }));

      return transformed;
    } catch (error) {
      console.error("Failed to fetch Your Mix:", error);
      return [];
    }
  }

  async getMixTimeline(token: string): Promise<YourMixPostData[]> {
    try {
      const response = await this.makeRequest<DailyDrinkingPostResponse[]>(
        "/api/v1/user/mix-timeline",
        {
          method: "GET",
          token,
        }
      );

      const transformed = response.map((post) => ({
        id: post.ID,
        userId: post.UserID,
        userImageUrl: post.UserImageURL,
        date: post.Date,
        drankToday: post.DrankToday,
        loggedAt: post.LoggedAt,
        imageUrl: post.ImageURL,
        locationText: post.LocationText,
        mentionedBuddies: post.MentionedBuddies || [],
        sourceType: post.SourceType,
      }));

      return transformed;
    } catch (error) {
      console.error("Failed to fetch Mix Timeline:", error);
      return [];
    }
  }

  async addMixVideo(
    videoUrl: string,
    caption: string,
    duration: number,
    token: string
  ): Promise<any> {
    const response = await this.makeRequest<any>("/api/v1/user/mix-videos", {
      method: "POST",
      token,
      body: JSON.stringify({
        video_url: videoUrl,
        caption: caption,
        duration: duration,
      }),
    });

    // If response has an error property, throw it
    if (response?.error) {
      throw new Error(response.error);
    }

    return response;
  }

  async getMixVideos(token: string): Promise<VideoPost[]> {
    try {
      const response = await this.makeRequest<any[]>(
        "/api/v1/user/mix-videos",
        {
          method: "GET",
          token,
        }
      );

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
      await this.makeRequest<{ message: string }>(
        "/api/v1/user/mix-video-chips",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            video_id: videoId,
          }),
        }
      );

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
    const url = date
      ? `/api/v1/user/drunk-thought?date=${encodeURIComponent(date)}`
      : `/api/v1/user/drunk-thought`;

    const response = await this.makeRequest<any>(url, {
      method: "GET",
      token,
    });

    return response?.drunk_thought ?? null;
  }

  async addDrunkThought(
    drunkThought: string,
    token: string
  ): Promise<{ message: string; drunk_thought: string }> {
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
  ) {
    return this.makeRequest<FriendDiscoveryDisplayProfileResponse>(
      `/api/v1/user/friend-discovery/display-profile?friendDiscoveryId=${friendDiscoveryId}`,
      {
        method: "GET",
        token,
      }
    );
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

  async getBattleStatus(token: string): Promise<{
    user: LeaderboardEntry;
    leader: LeaderboardEntry;
    difference: number;
  }> {
    const leaderboard = await this.getFriendsLeaderboard(token);

    const user = leaderboard.user_position;
    const leader = leaderboard.entries[0];

    if (!user || !leader) {
      throw new Error("Battle status not available");
    }

    return {
      user,
      leader,
      difference: leader.days_this_week - user.days_this_week,
    };
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
}

export const apiService = new ApiService();
