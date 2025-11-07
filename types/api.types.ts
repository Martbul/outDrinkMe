export interface UserData {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
  gems: number;
  xp: number;
  allDaysDrinkingCount: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  imageUrl?: string;
  days_this_week: number;
  rank: number;
  current_streak: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  user_position?: LeaderboardEntry;
  total_users: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type:
    | "streak"
    | "total_days"
    | "weeks_won"
    | "friends"
    | "perfect_week";
  criteria_value: number;
  created_at: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface DaysStat {
  period: "week" | "month" | "year" | "all_time";
  days_drank: number;
  total_days: number;
}

export interface UserStats {
  today_status: boolean;
  days_this_week: number;
  days_this_month: number;
  days_this_year: number;
  total_days_drank: number;
  current_streak: number;
  longest_streak: number;
  total_weeks_won: number;
  achievements_count: number;
  friends_count: number;
  alcoholism_coefficient: number;
  rank: number;
}

export interface CalendarDay {
  date: string;
  drank_today: boolean;
  is_today: boolean;
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
}

export interface AddDrinkingRequest {
  drank_today: boolean;
  image_url?: string | null;
  location_text?: string;
  mentioned_buddies?: UserData[] | [];
}

export interface UpdateUserProfileReq {
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  gems?: number;
}

export interface FriendDiscoveryDisplayProfileResponse {
  user: UserData;
  stats: UserStats;
  achievements: Achievement[];
  is_friend: boolean;
}

export interface DailyDrinkingPostResponse {
  ID: string;
  UserID: string;
  UserImageURL: string;
  Date: string;
  DrankToday: boolean;
  LoggedAt: string;
  ImageURL: string;
  LocationText: string | null;
  MentionedBuddies: UserData[] | null;
  SourceType: "friend" | "other";
}

export interface YourMixPostData {
  id: string;
  userId: string;
  userImageUrl: string;
  date: string;
  drankToday: boolean;
  loggedAt: string;
  imageUrl: string;
  locationText: string | null;
  mentionedBuddies: UserData[];
  sourceType: "friend" | "other";
}


export interface DrunkThought  {
  id: string;
  user_id: string;
  username: string;
  user_image_url: string;
  thought: string;
  created_at: string; // ISO 8601 date string from JSON
}