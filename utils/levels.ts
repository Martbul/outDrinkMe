/**
 * Level System with Exponential XP Growth
 * Each day of drinking gives 100 XP
 * XP required grows exponentially with each level
 */

import { UserStats } from "@/types/api.types";

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelStartXp: number; // XP where current level started (was: xpForCurrentLevel)
  nextLevelStartXp: number; // XP needed to reach next level (was: xpForNextLevel)
  currentLevelProgress: number; // XP progress within current level (was: xpProgress)
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
  const currentLevelStartXp = getTotalXPForLevel(currentLevel);
  const nextLevelStartXp = getTotalXPForLevel(currentLevel + 1);

  // Calculate progress in current level
  const currentLevelProgress = safeTotalXP - currentLevelStartXp;
  const xpNeededForLevel = nextLevelStartXp - currentLevelStartXp;
  const progressPercentage =
    xpNeededForLevel > 0 ? (currentLevelProgress / xpNeededForLevel) * 100 : 0;

  return {
    level: currentLevel,
    totalXp: safeTotalXP,
    currentLevelStartXp,
    nextLevelStartXp,
    currentLevelProgress,
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
  const xpNeeded = levelInfo.nextLevelStartXp - currentXP;
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
  normalizedCoeff: number | undefined
): { title: string; coef: number } => {
    if (!normalizedCoeff) return { title: "NEWBIE", coef: 0 };

  const titleIndex = Math.min(Math.floor(normalizedCoeff / 10), 9);

  const titles = [
    "SOBER SOUL", // 0-9 score (weak drinkers)
    "FIRST SIP", // 10-19 score
    "TEMPTED", // 20-29 score
    "INTOXICATED", // 30-39 score
    "UNHINGED", // 40-49 score
    "FALLEN", // 50-59 score
    "DROWNED IN SPIRITS", // 60-69 score
    "WHISPERER OF WINE", // 70-79 score
    "LIQUOR SHADE", // 80-89 score
    "VOID DRINKER", // 90-100 score
  ];

  return {
    title: titles[titleIndex] || "NEWBIE",
    coef: normalizedCoeff,
  };
};

