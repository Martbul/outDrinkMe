import { useEffect, useRef } from "react";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useDrunkGame } from "@/providers/DrunkGameProvider";

export default function DeepLinkHandler() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { joinViaDeepLink, sessionId } = useDrunkGame();

  const lastJoinedId = useRef<string>("");

  useEffect(() => {
    const idParam = params.id;
    const sid = Array.isArray(idParam) ? idParam[0] : idParam;

    // 2. Check if valid SID and NOT the session we are already in
    if (sid && typeof sid === "string") {
      
      // Prevent re-joining the same session or looping
      if (sid === lastJoinedId.current || sid === sessionId) {
        return;
      }

      console.log("🔍 Deep Link Detected for Session:", sid);
      console.log("🚀 Joining Game & Navigating...");

      // A. Mark this ID as handled
      lastJoinedId.current = sid;

      // B. Join the game logic (Provider)
      joinViaDeepLink(sid);

      // C. Force Navigation to the game screen
      // use 'replace' to prevent going back to the empty lobby
      router.replace("/(screens)/drinkingGames");
    }
  }, [params, sessionId, joinViaDeepLink, router]);

  return null;
}