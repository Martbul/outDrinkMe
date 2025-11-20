import { usePathname, useSegments } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect } from "react";

export const PostHogScreenTracker = () => {
  const posthog = usePostHog();
  const pathname = usePathname();
  // Segments gives you the parts of the URL, e.g. ["(tabs)", "home"]
  // This is useful if you want to filter out certain internal grouping folders
  const segments = useSegments();

  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname);
    }
  }, [posthog, pathname]);

  return null;
};
