import { useEffect } from "react";
// 1. MAKE SURE THIS IMPORT IS CORRECT
import * as Linking from "expo-linking";
import { useDrunkGame } from "@/providers/DrunkGameProvider";

export default function DeepLinkHandler() {
  const { joinViaDeepLink, stage } = useDrunkGame();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      console.log("Raw Deep Link:", url);

      // 2. Parse the URL
      const parsed = Linking.parse(url);

      // 3. Just look for the ID (since we removed the 'game' path to fix the 404)
      const sid = parsed.queryParams?.id;

      if (sid && typeof sid === "string") {
        console.log("Joining session:", sid);

        if (stage === "lobby") {
          joinViaDeepLink(sid);
        }
      }
    };

    Linking.getInitialURL().then((url) => handleUrl(url));

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [joinViaDeepLink, stage]);

  return null;
}
