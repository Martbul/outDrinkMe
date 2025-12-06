// // import { useEffect } from "react";
// // // 1. MAKE SURE THIS IMPORT IS CORRECT
// // import * as Linking from "expo-linking";
// // import { useDrunkGame } from "@/providers/DrunkGameProvider";

// // export default function DeepLinkHandler() {
// //   const { joinViaDeepLink, stage } = useDrunkGame();

// //   useEffect(() => {
// //     const handleUrl = (url: string | null) => {
// //       if (!url) return;
// //       console.log("Raw Deep Link:", url);

// //       // 2. Parse the URL
// //       const parsed = Linking.parse(url);

// //       // 3. Just look for the ID (since we removed the 'game' path to fix the 404)
// //       const sid = parsed.queryParams?.id;

// //       if (sid && typeof sid === "string") {
// //         console.log("Joining session:", sid);

// //         if (stage === "lobby") {
// //           joinViaDeepLink(sid);
// //         }
// //       }
// //     };

// //     Linking.getInitialURL().then((url) => handleUrl(url));

// //     const subscription = Linking.addEventListener("url", (event) => {
// //       handleUrl(event.url);
// //     });

// //     return () => {
// //       subscription.remove();
// //     };
// //   }, [joinViaDeepLink, stage]);

// //   return null;
// // }

// import { useEffect, useRef } from "react";
// import { useRouter, useGlobalSearchParams } from "expo-router";
// import { useDrunkGame } from "@/providers/DrunkGameProvider";

// export default function DeepLinkHandler() {
//   const router = useRouter();
//   const params = useGlobalSearchParams();
//   const { joinViaDeepLink, stage } = useDrunkGame();

//   // Keep track of the last processed ID to prevent loops
//   const lastJoinedId = useRef<string>("");

//   useEffect(() => {
//     // 1. Get the ID from the URL params (handled automatically by Expo Router)
//     const idParam = params.id;
//     const sid = Array.isArray(idParam) ? idParam[0] : idParam;

//     if (sid && typeof sid === "string") {
//       console.log("🔍 Deep Link Detected for Session:", sid);

//       if (stage === "waiting" && sid !== lastJoinedId.current) {
//         console.log("🚀 Joining Game & Navigating...");

//         // A. Mark this ID as handled
//         lastJoinedId.current = sid;

//         // B. Join the game logic (Provider)
//         joinViaDeepLink(sid);

//         // C. NAVIGATE TO THE GAME SCREEN
//         // This is the missing piece that forces the UI to change
//         router.push("/(screens)/drinkingGames");
//       }
//     }
//   }, [params, stage, joinViaDeepLink, router]);

//   return null;
// }

import { useEffect, useRef } from "react";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useDrunkGame } from "@/providers/DrunkGameProvider";

export default function DeepLinkHandler() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { joinViaDeepLink, sessionId } = useDrunkGame();

  // Keep track of the last processed ID to prevent loops
  const lastJoinedId = useRef<string>("");

  useEffect(() => {
    // 1. Get the ID from the URL params
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