import { Achievement, AddDrinkingRequest, CalendarResponse, DaysStat, FriendRequest, Friendship, Leaderboard, LeaderboardEntry, UpdateUserProfileReq, UserData, UserStats } from "./types/api.types";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_OUTDRINKME_API_URL || "http://localhost:3000";
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
    const response = await this.makeRequest<{ users: UserData[] }>(
      `/api/v1/users/search?username=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response.users || [];
  }
  async getUserStats(token: string): Promise<UserStats> {
    return this.makeRequest<UserStats>("/api/v1/user/stats", {
      method: "GET",
      token,
    });
  }

  async addDrinking(
    data: AddDrinkingRequest,
    token: string
  ): Promise<{ message: string }> {
    console.log(data, token);
    return this.makeRequest<{ message: string }>("/api/v1/user/drink", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
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
    console.log("rr", response);

    // return response.friends || [];
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

  async addFriend(friendId: string, token: string): Promise<Friendship> {
    return this.makeRequest<Friendship>("/api/v1/user/friends", {
      method: "POST",
      token,
      body: JSON.stringify({ friendId: friendId }),
    });
  }

  async updateUserGems(gems: number, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/v1/user/gems-reward", {
      method: "PUT",
      token,
      body: JSON.stringify({ gems }),
    });
  }

  // async acceptFriendRequest(
  //   friendshipId: string,
  //   token: string
  // ): Promise<Friendship> {
  //   return this.makeRequest<Friendship>(
  //     `/api/v1/user/friends/request/${friendshipId}/accept`,
  //     {
  //       method: "POST",
  //       token,
  //     }
  //   );
  // }

  // async rejectFriendRequest(
  //   friendshipId: string,
  //   token: string
  // ): Promise<void> {
  //   return this.makeRequest<void>(
  //     `/api/v1/user/friends/request/${friendshipId}/reject`,
  //     {
  //       method: "POST",
  //       token,
  //     }
  //   );
  // }

  async removeFriend(friendId: string, token: string): Promise<void> {
    return this.makeRequest<void>(`/api/v1/user/friends/${friendId}`, {
      method: "DELETE",
      token,
    });
  }

  // async getPendingFriendRequests(token: string): Promise<FriendRequest[]> {
  //   const response = await this.makeRequest<{ requests: FriendRequest[] }>(
  //     "/api/v1/user/friends/requests/pending",
  //     {
  //       method: "GET",
  //       token,
  //     }
  //   );

  //   return response.requests || [];
  // }

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
}

export const apiService = new ApiService();
