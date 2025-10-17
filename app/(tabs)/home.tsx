import { Header } from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("for-you");
  const {
    userData,
    userStats,
    weeklyStats,
    leaderboard,
    addDrinking,
    isLoading,
  } = useApp();

  // Get rank badge info based on achievements
  const getRankInfo = () => {
    if (!userStats) return { level: 0, title: "NEWBIE", maxLevel: 10 };

    // Calculate level based on total days drank (every 20 days = 1 level)
    const level = Math.min(Math.floor(userStats.total_days_drank / 20) + 1, 10);

    const titles = [
      "NEWBIE",
      "ROOKIE",
      "CONTENDER",
      "CHALLENGER",
      "WARRIOR",
      "CHAMPION",
      "MASTER",
      "LEGEND",
      "TITAN",
      "IMMORTAL",
    ];

    return {
      level,
      title: titles[level - 1] || "NEWBIE",
      maxLevel: 10,
    };
  };

  const rankInfo = getRankInfo();

  // Calculate week progress
  const weekProgress = weeklyStats
    ? (weeklyStats.days_drank / weeklyStats.total_days) * 100
    : 0;

  // Get days of week status (assuming week starts Monday)
  const getWeekDays = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const daysLogged = weeklyStats?.days_drank || 0;

    return days.map((day, index) => ({
      day,
      active: index < daysLogged,
    }));
  };

  const weekDays = getWeekDays();

  const handleLogToday = async () => {
    if (userStats?.today_status) {
      Alert.alert(
        "Already Logged",
        "You've already logged your drinking for today!",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Log Today", "Did you drink today?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "No",
        onPress: async () => {
          try {
            await addDrinking(false);
            Alert.alert("Success", "Logged as not drinking today");
          } catch (error) {
            Alert.alert("Error", "Failed to log. Please try again.");
          }
        },
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await addDrinking(true);
            Alert.alert("Success", "Great job! Keep the streak going! 🔥");
          } catch (error) {
            Alert.alert("Error", "Failed to log. Please try again.");
          }
        },
      },
    ]);
  };

  if (isLoading && !userStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Rank Badge */}
        <View style={styles.rankSection}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>{rankInfo.level}</Text>
          </View>
          <Text style={styles.rankTitle}>{rankInfo.title}</Text>
          <Text style={styles.rankSubtitle}>
            RANK {rankInfo.level}/{rankInfo.maxLevel}
          </Text>
        </View>

        {/* Current Streak */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>CURRENT STREAK</Text>
              <Text style={styles.streakText}>
                {userStats?.current_streak || 0} Days 🔥
              </Text>
            </View>
            {userStats && userStats.current_streak > 0 && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ACTIVE</Text>
              </View>
            )}
          </View>
        </View>

        {/* This Week Stats */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>THIS WEEK</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressValue}>
                {weeklyStats?.days_drank || 0}/{weeklyStats?.total_days || 7}
              </Text>
              <Text style={styles.progressLabel}>Days Logged</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${weekProgress}%` }]}
              />
            </View>
          </View>

          {/* Week Grid */}
          <View style={styles.weekGrid}>
            {weekDays.map((item, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayBox,
                    item.active ? styles.dayBoxActive : styles.dayBoxInactive,
                  ]}
                >
                  {item.active && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>RANK</Text>
            <Text style={styles.statValue}>#{userStats?.rank || 0}</Text>
            <Text style={styles.statSubtext}>
              of {leaderboard?.total_users || 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL</Text>
            <Text style={styles.statValue}>
              {userStats?.total_days_drank || 0}
            </Text>
            <Text style={styles.statSubtext}>days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>WINS</Text>
            <Text style={styles.statValue}>
              {userStats?.total_weeks_won || 0}
            </Text>
            <Text style={styles.statSubtext}>weeks</Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR STATS</Text>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>This Month</Text>
            <Text style={styles.statRowValue}>
              {userStats?.days_this_month || 0} days
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>This Year</Text>
            <Text style={styles.statRowValue}>
              {userStats?.days_this_year || 0} days
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Longest Streak</Text>
            <Text style={styles.statRowValue}>
              {userStats?.longest_streak || 0} days
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Achievements</Text>
            <Text style={styles.statRowValue}>
              {userStats?.achievements_count || 0}
            </Text>
          </View>

          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statRowLabel}>Friends</Text>
            <Text style={styles.statRowValue}>
              {userStats?.friends_count || 0}
            </Text>
          </View>
        </View>

        {/* Log Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            userStats?.today_status && styles.logButtonDisabled,
          ]}
          onPress={handleLogToday}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.logButtonText}>
              {userStats?.today_status ? "✓ LOGGED TODAY" : "LOG TODAY"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  rankSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  rankBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(234, 88, 12, 0.15)",
    borderWidth: 4,
    borderColor: "#EA580C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  rankNumber: {
    color: "#EA580C",
    fontSize: 48,
    fontWeight: "900",
  },
  rankTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  rankSubtitle: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 4,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  statusBadge: {
    backgroundColor: "rgba(234, 88, 12, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  progressLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    fontWeight: "600",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#EA580C",
    borderRadius: 4,
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayBoxActive: {
    backgroundColor: "#EA580C",
  },
  dayBoxInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  checkmark: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
  dayLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  statSubtext: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  statRowLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    fontWeight: "600",
  },
  statRowValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  logButton: {
    backgroundColor: "#EA580C",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logButtonDisabled: {
    backgroundColor: "rgba(234, 88, 12, 0.5)",
  },
  logButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  bottomSpacer: {
    height: 100,
  },
});
