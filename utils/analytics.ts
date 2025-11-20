// utils/analytics.ts
import { usePostHog } from "posthog-react-native";

export const useAnalytics = () => {
  const posthog = usePostHog();

  return {
    // ============================================
    // SCREEN TRACKING
    // ============================================
    trackScreen: (screenName: string, properties?: Record<string, any>) => {
      posthog?.screen(screenName, properties);
    },

    // ============================================
    // USER IDENTIFICATION
    // ============================================
    identifyUser: (userId: string, properties?: Record<string, any>) => {
      posthog?.identify(userId, properties);
    },

    setUserProperties: (properties: Record<string, any>) => {
      posthog?.capture("$set", { $set: properties });
    },

    // ============================================
    // CORE DRINKING EVENTS
    // ============================================
    trackDrinkingLogged: (data: {
      hasImage: boolean;
      hasLocation: boolean;
      buddyCount: number;
      currentStreak: number;
      isFirstTimeToday: boolean;
    }) => {
      posthog?.capture("drinking_logged", {
        has_image: data.hasImage,
        has_location: data.hasLocation,
        buddy_count: data.buddyCount,
        current_streak: data.currentStreak,
        is_first_time_today: data.isFirstTimeToday,
        timestamp: new Date().toISOString(),
      });
    },

    trackDrinkingRemoved: (date: string, streak: number) => {
      posthog?.capture("drinking_removed", {
        date,
        streak_before: streak,
        timestamp: new Date().toISOString(),
      });
    },

    trackDrunkThoughtShared: (
      thoughtLength: number,
      hasThoughtBefore: boolean
    ) => {
      posthog?.capture("drunk_thought_shared", {
        thought_length: thoughtLength,
        had_thought_before: hasThoughtBefore,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // SOCIAL FEATURES
    // ============================================
    trackFriendAdded: (
      friendId: string,
      source: "discovery" | "search" | "profile"
    ) => {
      posthog?.capture("friend_added", {
        friend_id: friendId,
        source,
        timestamp: new Date().toISOString(),
      });
    },

    trackFriendRemoved: (friendId: string) => {
      posthog?.capture("friend_removed", {
        friend_id: friendId,
        timestamp: new Date().toISOString(),
      });
    },

    trackUserSearch: (query: string, resultsCount: number) => {
      posthog?.capture("user_searched", {
        query_length: query.length,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
      });
    },

    trackProfileViewed: (userId: string, viewedFrom: string) => {
      posthog?.capture("profile_viewed", {
        viewed_user_id: userId,
        viewed_from: viewedFrom,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // COLLECTION TRACKING
    // ============================================
    trackAlcoholScanned: (
      success: boolean,
      alcoholName?: string,
      type?: string
    ) => {
      posthog?.capture("alcohol_scanned", {
        success,
        alcohol_name: alcoholName ?? null,
        alcohol_type: type ?? null,
        timestamp: new Date().toISOString(),
      });
    },

    trackAlcoholAdded: (data: {
      name: string;
      type: string;
      rarity: string;
      isNewlyAdded: boolean;
      collectionSize: number;
    }) => {
      posthog?.capture("alcohol_added_to_collection", {
        alcohol_name: data.name,
        alcohol_type: data.type,
        rarity: data.rarity,
        is_newly_added: data.isNewlyAdded,
        collection_size: data.collectionSize,
        timestamp: new Date().toISOString(),
      });
    },

    trackAlcoholRemoved: (alcoholName: string, type: string) => {
      posthog?.capture("alcohol_removed_from_collection", {
        alcohol_name: alcoholName,
        alcohol_type: type,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // NAVIGATION TRACKING
    // ============================================
    trackNavigation: (destination: string, from: string) => {
      posthog?.capture("navigation", {
        destination,
        from,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // ACHIEVEMENT TRACKING
    // ============================================
    trackAchievementViewed: (achievementId: string, isUnlocked: boolean) => {
      posthog?.capture("achievement_viewed", {
        achievement_id: achievementId,
        is_unlocked: isUnlocked,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // MIX TIMELINE TRACKING
    // ============================================
    trackMixCardViewed: (
      cardId: string,
      hasImage: boolean,
      hasBuddies: boolean
    ) => {
      posthog?.capture("mix_card_viewed", {
        card_id: cardId,
        has_image: hasImage,
        has_buddies: hasBuddies,
        timestamp: new Date().toISOString(),
      });
    },

    trackMixCardFlipped: (cardId: string, flipState: number) => {
      posthog?.capture("mix_card_flipped", {
        card_id: cardId,
        flip_state: flipState,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // FEEDBACK & SUPPORT
    // ============================================
    trackFeedbackSubmitted: (category: string, textLength: number) => {
      posthog?.capture("feedback_submitted", {
        category,
        text_length: textLength,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // MONETIZATION TRACKING
    // ============================================
    trackAdViewed: (adType: "rewarded" | "interstitial") => {
      posthog?.capture("ad_viewed", {
        ad_type: adType,
        timestamp: new Date().toISOString(),
      });
    },

    trackAdCompleted: (
      adType: "rewarded" | "interstitial",
      rewardAmount?: number
    ) => {
      posthog?.capture("ad_completed", {
        ad_type: adType,
        reward_amount: rewardAmount ?? null,
        timestamp: new Date().toISOString(),
      });
    },

    trackGemsEarned: (
      amount: number,
      source: "ad" | "achievement" | "reward"
    ) => {
      posthog?.capture("gems_earned", {
        amount,
        source,
        timestamp: new Date().toISOString(),
      });
    },

    trackStoreItemViewed: (itemName: string, price: number) => {
      posthog?.capture("store_item_viewed", {
        item_name: itemName,
        price,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // ENGAGEMENT METRICS
    // ============================================
    trackPullToRefresh: (screen: string) => {
      posthog?.capture("pull_to_refresh", {
        screen,
        timestamp: new Date().toISOString(),
      });
    },

    trackTooltipViewed: (tooltipType: string) => {
      posthog?.capture("tooltip_viewed", {
        tooltip_type: tooltipType,
        timestamp: new Date().toISOString(),
      });
    },

    trackModalOpened: (modalType: string, from: string) => {
      posthog?.capture("modal_opened", {
        modal_type: modalType,
        from,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // USER STATISTICS TRACKING
    // ============================================
    trackStatisticsViewed: (
      period: "week" | "month" | "year" | "all_time",
      data: {
        daysCount: number;
        currentStreak: number;
        collectionSize: number;
      }
    ) => {
      posthog?.capture("statistics_viewed", {
        period,
        days_count: data.daysCount,
        current_streak: data.currentStreak,
        collection_size: data.collectionSize,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // CALENDAR TRACKING
    // ============================================
    trackCalendarDayViewed: (date: string, hasDrinking: boolean) => {
      posthog?.capture("calendar_day_viewed", {
        date,
        has_drinking: hasDrinking,
        timestamp: new Date().toISOString(),
      });
    },

    trackCalendarMonthChanged: (year: number, month: number) => {
      posthog?.capture("calendar_month_changed", {
        year,
        month,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // ERROR TRACKING
    // ============================================
    trackError: (errorType: string, errorMessage: string, stack?: string) => {
      posthog?.capture("app_error", {
        error_type: errorType,
        error_message: errorMessage,
        error_stack: stack ?? null,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // SESSION TRACKING
    // ============================================
    trackSessionStart: () => {
      posthog?.capture("session_start", {
        timestamp: new Date().toISOString(),
      });
    },

    trackSessionEnd: (duration: number) => {
      posthog?.capture("session_end", {
        duration_seconds: duration,
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // ACCOUNT MANAGEMENT
    // ============================================
    trackProfileUpdated: (fields: string[]) => {
      posthog?.capture("profile_updated", {
        updated_fields: fields,
        timestamp: new Date().toISOString(),
      });
    },

    trackAccountDeleted: (reason?: string) => {
      posthog?.capture("account_deleted", {
        reason: reason ?? "Unknown",
        timestamp: new Date().toISOString(),
      });
    },

    trackLogout: () => {
      posthog?.capture("user_logged_out", {
        timestamp: new Date().toISOString(),
      });
    },

    // ============================================
    // GENERIC EVENT TRACKING
    // ============================================
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      posthog?.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    },
  };
};
