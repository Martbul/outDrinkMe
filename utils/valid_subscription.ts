import { DrinkUpSubscriptionStatus, UserData } from "@/types/api.types";

export const isDrinkUpActive = (user: UserData | null | undefined): boolean => {
  if (!user || !user.drinkup_subscription) return false;

  const { status, currentPeriodEnd } = user.drinkup_subscription;

  // 1. Check valid status
  const validStatuses: DrinkUpSubscriptionStatus[] = ["active", "trialing"];
  if (!validStatuses.includes(status)) {
    return false;
  }

  // 2. Check expiration date
  const now = new Date();
  const expiresAt = new Date(currentPeriodEnd);

  return expiresAt > now;
};
