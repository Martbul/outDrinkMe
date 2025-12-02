import React, { useEffect } from "react";
import * as Linking from "expo-linking";
import { useDrunkGame } from "@/providers/DrunkGameProvider";

export default function DeepLinkHandler() {
  const { joinViaDeepLink, stage } = useDrunkGame();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;

      // Parse the URL: outdrinkme://game?id=XYZ
      const parsed = Linking.parse(url);

      // Check if we have the ID parameter
      if (parsed.path === "game" && parsed.queryParams?.id) {
        const sid = parsed.queryParams.id as string;

        console.log("Deep Link Detected for Session:", sid);

        // Only join if we aren't already in a game
        if (stage === "lobby") {
          joinViaDeepLink(sid);
        }
      }
    };

    // 1. Handle "Cold Start" (App launched from dead state via link)
    Linking.getInitialURL().then((url) => handleUrl(url));

    // 2. Handle "Warm Start" (App was in background/multitasking)
    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [joinViaDeepLink, stage]);

  return null; // This component renders nothing
}
