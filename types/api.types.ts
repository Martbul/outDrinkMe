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
  alcoholism_coefficient: number;
  drinkup_subscription?: DrinkUpSubscription;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  image_url?: string | null;
  alcoholism_coefficient: number;
  rank: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  user_position?: LeaderboardEntry;
  total_users: number;
}

export interface LeaderboardsResponse {
  global: Leaderboard;
  friends: Leaderboard;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: "streak" | "total_days" | "weeks_won" | "friends" | "perfect_week";
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
  image_width?: number;
  image_height?: number;
  location_text?: string;
  location_coords?: {
    latitude: number;
    longitude: number;
  } | null;
  alcohols?: string[];
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
  mix_posts: DailyDrinkingPostResponse[] | [];
  is_friend: boolean;
  inventory: { [itemType: string]: InventoryItem[] };
}

export interface DailyDrinkingPostResponse {
  id: string;
  user_id: string;
  user_image_url: string | null;
  username: string;
  date: string;
  drank_today: boolean;
  logged_at: string;
  image_url: string | null;
  image_width: number;
  image_height: number;
  latitude?: number;
  longitude?: number;
  location_text: string | null;
  alcohol: string[] | null;
  mentioned_buddies: UserData[] | null;
  source_type: string;
  reactions?: CanvasItem[];
}

export interface YourMixPostData {
  id: string;
  userId: string;
  userImageUrl: string | undefined;
  username: string;
  date: string;
  drankToday: boolean;
  loggedAt: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  alcohol: string[];
  mentionedBuddies: UserData[];
  sourceType: string;
  reactions?: CanvasItem[];
}

export interface DrunkThought {
  id: string;
  user_id: string;
  username: string;
  user_image_url: string;
  thought: string;
  created_at: string;
}

export interface AlcoholDbItem {
  id: string;
  name: string;
  type: string;
  image_url: string;
  rarity: string;
  abv: number;
}

export type AlcoholCollectionByType = {
  beer: AlcoholDbItem[];
  whiskey: AlcoholDbItem[];
  wine: AlcoholDbItem[];
  vodka: AlcoholDbItem[];
  gin: AlcoholDbItem[];
  liqueur: AlcoholDbItem[];
  rum: AlcoholDbItem[];
  tequila: AlcoholDbItem[];
  rakiya: AlcoholDbItem[];
};

export interface SearchDbAlcoholResult {
  item: AlcoholDbItem;
  isNewlyAdded: boolean;
}

export interface VideoPost {
  id: string;
  videoUrl: string;
  userId: string;
  username: string;
  userImageUrl?: string;
  caption?: string;
  chips: number;
  duration: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface VideoUploadData {
  uri: string;
  caption: string;
  duration: number;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  duration: number;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreItem {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  item_type: string;
  image_url?: string;
  base_price: number;
  is_active: boolean;
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface ItemWithDeal extends StoreItem {
  has_deal: boolean;
  discount_percentage?: number;
  discounted_price?: number;
  deal_end_date?: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  quantity: number;
  is_equipped: boolean;
  acquired_at: string;
  expires_at?: string;
}

export interface EquippedItem {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  equipped_at: string;
}

export interface PurchaseRequest {
  item_id: string;
}

export interface EquipItemRequest {
  item_id: string;
}

export interface PurchaseResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export type StoreItems = {
  [itemType: string]: StoreItem[];
};

export type InventoryItems = {
  [itemType: string]: InventoryItem[];
};

export interface Deal {
  id: number;
  title: string;
  type: string;
  discount: string;
  originalPrice: number;
  price: number;
  multiplier?: string;
  image: any;
  isDark?: boolean;
  featured?: boolean;
}

export interface ProDeal {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice: number;
  price: number;
  image: any;
}

export interface Flag {
  id: number;
  title: string;
  price: number;
  image: any;
}

export interface Smoking {
  id: number;
  title: string;
  price: number;
  image: any;
}

export interface EnergyDrink {
  id: number;
  title: string;
  price: number;
  image: any;
}


export interface Bottle {
  id: number;
  title: string;
  price: number;
  image: any;
}

export interface Special {
  id: number;
  title: string;
  price: number;
  image: any;
}
export interface ColorTheme {
  id: number;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  price: number;
}

export interface GemPack {
  id: number;
  amount: number;
  price: string;
  image: any;
  bonus?: number;
}

export type NotificationType =
  | "streak_milestone"
  | "streak_at_risk"
  | "friend_overtook_you"
  | "mentioned_in_post"
  | "video_chips_milestone"
  | "challenge_invite"
  | "challenge_result"
  | "weekly_recap"
  | "drunk_thought_reaction";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationStatus = "pending" | "sent" | "failed" | "read";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  body: string;
  data: Record<string, any>;
  actor_id?: string | null;
  scheduled_for?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
  retry_count: number;
  action_url?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[] | null;
  unread_count: number;
  total_count: number;
  page: number;
  page_size: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface DeviceToken {
  token: string;
  platform: "ios" | "android" | "web";
  added_at: string;
  last_used: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  enabled_types: Record<string, boolean>;
  max_notifications_per_hour: number;
  max_notifications_per_day: number;
  device_tokens: DeviceToken[];
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: string;
  status: "pending" | "sent" | "failed" | "read";
  title: string;
  body: string;
  data: Record<string, any>;
  actor_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string | null;
  created_at: string;
  action_url?: string;
}

export interface CreateGameResponse {
  sessionId: string;
  wsUrl: string;
}

export interface GameSessionDetails {
  exists: boolean;
  hostUsername: string;
  gameType: string;
  playerCount: number;
}

export interface PublicGame {
  sessionId: string;
  gameType: string;
  host: string;
  players: number;
}

export interface GameSettings {
  max_players: number;
  rounds: number;
}

export interface CreateGameReq {
  gameType: string;
  settings: GameSettings;
}

export interface PlayerRoundInfo {
  userId: string;
  votes: number;
}

export interface RoundResult {
  winnerId: string;
  results: PlayerRoundInfo[];
}

export interface ActionRequest {
  action: string;
  content: string;
}

export interface MinVersionResponse {
  min_android_version_code: number;
  min_ios_version_code: number;
  update_message?: string;
}

export interface CanvasItem {
  id: string;
  daily_drinking_id: string;
  added_by_user_id: string;
  item_type: "image" | "sticker" | "text" | "drawing" | "reaction";
  content: string;
  pos_x: number;
  pos_y: number;
  rotation: number;
  scale: number;
  width: number;
  height: number;
  z_index: number;
  created_at: string;
  author_avatar_url?: string;
  author_name?: string;
  extra_data?: {
    color?: string;
    [key: string]: any;
  };
}

export interface FuncSessionResponse {
  sessionID: string;
  qrToken: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export interface FuncMember {
  username: string;
  imageUrl: string;
}

export interface FuncMetadata {
  inviteCode: string;
  qrToken: string;
  qrCodeBase64: string;
  expiresAt: string;
  sessionID: string;
  hostUsername: string;
  hostImageUrl: string;
}

export interface FuncDataResponse {
  isPartOfActiveFunc: boolean;
  funcMembers: FuncMember[];
  funcImageIds: string[];
  funcMetadata: FuncMetadata;
}

export interface UploadJob {
  id: string;
  uri: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
}

export interface StoryUploadJob {
  id: string;
  uri: string;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  meta: {
    width: number;
    height: number;
    duration: number;
    taggedBuddies: string[];
  };
}

export interface StorySegment {
  id: string;
  video_url: string;
  video_width: number;
  video_height: number;
  video_duration: number;
  relate_count: number;
  has_related: boolean;
  is_seen: boolean;
  created_at: string;
}

export interface UserStories {
  user_id: string;
  username: string;
  user_image_url: string;
  all_seen: boolean;
  items: StorySegment[];
}

export type DrinkUpSubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "paused";

export interface DrinkUpSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: DrinkUpSubscriptionStatus;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeRequest {
  priceId: string;
}

export interface SubscribeResponse {
  checkoutUrl: string;
}
 export type VenueCategory = 
  | "Club" 
  | "Bar" 
  | "Chalga Club" 
  | "Piano Bar" 
  | "Beach Bar" 
  | "Rooftop" 
  | "Pub" 
  | "Lounge";

export interface VenueSpecial {
  id: string;
  venue_id: string;      
  name: string;
  price: string;
  description: string;
  image_url: string;     
}

export interface Venue {
  id: string;
  name: string;
  venue_type: VenueCategory;

  image_url: string;
  image_width: number;
  image_height: number;

  location: string;
  distance_km: number;
  distance_str: string;

  rating: number;
  review_count: number;
  difficulty: "Cheap" | "Moderate" | "Expensive";

  event_time: string;
  description: string;

  latitude: number;
  longitude: number;

  tags: string[];
  discount_percentage: number;
  created_at?: string;

  gallery: string[]; // e.g. ["https://...", "https://..."]
  features: string[]; // e.g. ["Live DJ", "Rooftop"]
  phone?: string;
  website?: string;
  directions?: string; // URL

  specials: VenueSpecial[];
  employees: string[];
}

export interface PaddlePrice {
  id: string; 
  productId: string; 
  description: string; 
  amount: string; 
  currency: string; 
  interval: string; 
}

export interface PaddleTransactionResponse {
  transactionId: string; 
  checkoutUrl: string; 
}

export interface Premium {
  id: number;
  userId: string;
  username: string;
  userImageUrl: string;
  venuesVisited: number;
  validUntil: string;
  isActive: boolean;
  transactionId: string;
  customerId: string;
  amount: string;
  currency: string; 
  createdAt: string;
  updatedAt: string;
}