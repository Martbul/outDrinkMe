export interface UserData {
  id: string;
  clerk_id: string;
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
}

export interface UpdateUserProfileReq {
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

