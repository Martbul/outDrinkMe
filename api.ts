import { UserData } from "./types/user";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_CITYSTAT_API_URL || "http://localhost:3000/api";
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

      console.log(`Error response: ${errorText}`);

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

  async fetchUser(token: string, retries = 3): Promise<UserData> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Fetch user attempt ${attempt + 1}/${retries + 1}`);

        return await this.makeRequest<UserData>("/api/user", {
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
    console.log("Creating user with data:", userData);

    return this.makeRequest<UserData>("/api/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async searchUsers(searchQuery: string, token: string): Promise<UserData[]> {
    const response = await this.makeRequest<{ users: UserData[] }>(
      `/api/users/search?username=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response.users || [];
  }
}

export const apiService = new ApiService();
