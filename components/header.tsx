import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { useRouter } from "expo-router";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header = ({ activeTab = "forYou", onTabChange }: HeaderProps) => {
  const { userData, userStats } = useApp();
  const router = useRouter();

  // Calculate level and progress (every 20 days = 1 level)
  const totalDays = userStats?.total_days_drank || 0;
  const level = Math.floor(totalDays / 20) + 1;
  const progressInLevel = totalDays % 20;
  const progressPercentage = (progressInLevel / 20) * 100;

  // Get user initials
  const getInitials = () => {
    if (!userData) return "??";
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  const handleTabPress = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <View style={styles.container}>
    
      {/* Proile and Stats Bar */}
      <View style={styles.profileBar}>
        {/* Avatar and Level */}
        <View style={styles.avatarSection}>
          {userData?.imageUrl ? (
            <Image source={{ uri: userData.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={styles.levelSection}>
            <Text style={styles.levelText}>Lv.{level}</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {/* Streak */}
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>
              {userStats?.current_streak || 0}
            </Text>
          </View>

          {/* Achievements */}
          <View style={styles.statItem}>
            <View style={styles.gemContainer}>
              <Text style={styles.statIcon}>💎</Text>
              {(userStats?.achievements_count || 0) > 0 && (
                <View style={styles.plusBadge}>
                  <Text style={styles.plusText}>+</Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>
              {userStats?.achievements_count || 0}
            </Text>
          </View>

          {/* Notifications */}
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.statIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("forYou")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "forYou" && styles.activeTabText,
            ]}
          >
            For You
          </Text>
          {activeTab === "forYou" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
          {activeTab === "friends" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("discovery")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "discovery" && styles.activeTabText,
            ]}
          >
            Discovery
          </Text>
          {activeTab === "discovery" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLine: {
    width: 22,
    height: 2,
    backgroundColor: "#FFFFFF",
    marginVertical: 3,
    borderRadius: 1,
  },
  rightSection: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  iconText: {
    fontSize: 18,
  },
  profileBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EA580C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  levelSection: {
    marginLeft: 12,
    flex: 1,
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  progressBarContainer: {
    maxWidth: 140,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EA580C",
    borderRadius: 3,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  gemContainer: {
    position: "relative",
  },
  plusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#EA580C",
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 15,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#EA580C",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#EA580C",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default Header;