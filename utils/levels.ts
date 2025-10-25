/**
 * Level System with Exponential XP Growth
 * Each day of drinking gives 100 XP
 * XP required grows exponentially with each level
 */

import { UserStats } from "@/types/api.types";

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercentage: number;
}

/**
 * Calculate XP required for a specific level using exponential growth
 * Formula: baseXP * (growthFactor ^ (level - 1))
 *
 * @param level - The level to calculate XP for
 * @returns XP required to reach that level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;

  const baseXP = 200; // XP required for level 2
  const growthFactor = 1.15; // 15% increase per level

  return Math.floor(baseXP * Math.pow(growthFactor, level - 2));
}

/**
 * Calculate total XP required to reach a specific level
 * (sum of all previous level requirements)
 *
 * @param level - The target level
 * @returns Total XP needed from level 1 to reach target level
 */
export function getTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getXPForLevel(i);
  }
  return totalXP;
}

/**
 * Get level information based on total XP
 *
 * @param totalXP - Total XP earned (days_drank * 100)
 * @returns Detailed level information
 */
export function getLevelInfo(totalXP: number | undefined): LevelInfo {
  // Default to 0 if undefined
  const safeTotalXP = typeof totalXP === "number" && totalXP >= 0 ? totalXP : 0;

  let currentLevel = 1;

  // Find current level safely
  while (getTotalXPForLevel(currentLevel + 1) <= safeTotalXP) {
    currentLevel++;
  }

  // Calculate XP thresholds
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const xpForNextLevel = getTotalXPForLevel(currentLevel + 1);

  // Calculate progress in current level
  const xpProgress = safeTotalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage =
    xpNeededForLevel > 0 ? (xpProgress / xpNeededForLevel) * 100 : 0;

  return {
    level: currentLevel,
    currentXP: safeTotalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    progressPercentage: Math.min(Math.max(progressPercentage, 0), 100),
  };
}

/**
 * Get XP from total days drank
 *
 * @param daysDrank - Total days the user has logged drinking
 * @returns Total XP (100 per day)
 */
export function getXPFromDays(daysDrank: number): number {
  return daysDrank * 100;
}

/**
 * Get formatted level display string
 *
 * @param level - Current level
 * @returns Formatted string like "Lv. 5" or "Level 5"
 */
export function formatLevel(level: number, short: boolean = true): string {
  return short ? `Lv. ${level}` : `Level ${level}`;
}

/**
 * Get days needed to reach next level
 *
 * @param currentXP - Current total XP
 * @returns Number of days needed to level up
 */
export function getDaysToNextLevel(currentXP: number): number {
  const levelInfo = getLevelInfo(currentXP);
  const xpNeeded = levelInfo.xpForNextLevel - currentXP;
  return Math.ceil(xpNeeded / 100);
}

// Example usage and level table
export function getExampleLevelTable(maxLevel: number = 20): void {
  console.log("Level | Total XP | XP Required | Days Total");
  console.log("------|----------|-------------|------------");

  for (let level = 1; level <= maxLevel; level++) {
    const totalXP = getTotalXPForLevel(level);
    const xpRequired = getXPForLevel(level);
    const daysTotal = Math.ceil(totalXP / 100);

    console.log(
      `${level.toString().padStart(5)} | ${totalXP.toString().padStart(8)} | ${xpRequired.toString().padStart(11)} | ${daysTotal.toString().padStart(10)}`
    );
  }
}

export const getCoefInfo = (
  userStats: UserStats | null
): { title: string; coef: number } => {
  if (!userStats) return { title: "NEWBIE", coef: 0.0 };

  const coefTitleCalc = Math.min(
    Math.floor(userStats.alcoholism_coefficient * 0.75) + 1,
    10
  );

  const titles = [
    "THE SOBER SOUL",
    "THE FIRST SIP",
    "THE TEMPTED",
    "THE INTOXICATED",
    "THE UNHINGED",
    "THE FALLEN",
    "THE DROWNED IN SPIRITS",
    "THE WHISPERER OF WINE",
    "THE LIQUOR SHADE",
    "THE VOID DRINKER",
  ];

  return {
    title: titles[coefTitleCalc - 1] || "NEWBIE",
    coef: userStats.alcoholism_coefficient,
  };
};
