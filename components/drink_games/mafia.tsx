import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useApp } from "@/providers/AppProvider";

const ROLE_CONFIG: Record<
  string,
  { color: string; icon: any; actionName: string }
> = {
  MAFIA: { color: "#ef4444", icon: "domino-mask", actionName: "KILL" },
  DOCTOR: { color: "#22c55e", icon: "medical-bag", actionName: "HEAL" },
  POLICE: { color: "#3b82f6", icon: "police-badge", actionName: "CHECK" },
  SPY: { color: "#a855f7", icon: "eye-plus", actionName: "SPY" },
  WHORE: { color: "#ec4899", icon: "lipstick", actionName: "BLOCK" },
  CIVILIAN: { color: "#9ca3af", icon: "account", actionName: "" },
  UNKNOWN: { color: "#666", icon: "help", actionName: "" },
};

export default function RenderMafiaBoard() {
  const { isHost, gameState, sendGameAction, messages } = useDrunkGame();
  const { userData } = useApp();

  const [persistedRole, setPersistedRole] = useState("UNKNOWN");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // 1. NEW STATE: Track if action is locked in
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const state = gameState as any;
  const phase = state?.phase || "LOBBY";

  const myRole =
    state?.myRole && state.myRole !== "UNKNOWN" ? state.myRole : persistedRole;
  const privatePrompt = state?.actionPrompt || "";
  const message = state?.message || "";
  const alivePlayers = state?.alivePlayers || [];
  const deadPlayers = state?.deadPlayers || [];
  const currentVotes = state?.votes || {};

  useEffect(() => {
    if (state?.myRole && state.myRole !== "UNKNOWN") {
      setPersistedRole(state.myRole);
    }
  }, [state?.myRole]);

  // 2. RESET ON PHASE CHANGE: Unlock controls when phase changes
  useEffect(() => {
    setSelectedTarget(null);
    setHasSubmitted(false);
  }, [phase]);

  const amIDead = deadPlayers.some((p: any) => p.id === userData?.clerkId);
  const roleConfig = ROLE_CONFIG[myRole] || ROLE_CONFIG.UNKNOWN;
  const isNight = phase === "NIGHT";
  const isDay = phase === "DAY" || phase === "VOTING";

  const canAct =
    !amIDead &&
    ((isNight && myRole !== "CIVILIAN" && myRole !== "UNKNOWN") || isDay);

  const handleAction = (targetId: string) => {
    // 3. CHECK LOCK: If already submitted, stop here
    if (!canAct || hasSubmitted) return;

    if (targetId === userData?.clerkId && myRole !== "DOCTOR") return;

    setSelectedTarget(targetId);
    setHasSubmitted(true); // 4. LOCK THE UI

    if (isNight) {
      sendGameAction("night_action", { targetId });
    } else if (isDay) {
      sendGameAction("vote", { targetId });
    }
  };

  return (
    <View className="flex-1 bg-black w-full h-full">
      {/* HEADER */}
      <View className="flex-row justify-between items-center mb-6 px-4 pt-4 border-b border-white/10 pb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="px-4 py-2 rounded-xl flex-row items-center gap-2 border"
            style={{
              backgroundColor: `${roleConfig.color}20`,
              borderColor: `${roleConfig.color}50`,
            }}
          >
            <MaterialCommunityIcons
              name={roleConfig.icon}
              size={18}
              color={roleConfig.color}
            />
            <Text
              className="font-black uppercase text-xs tracking-widest"
              style={{ color: roleConfig.color }}
            >
              {myRole}
            </Text>
          </View>
          {amIDead && (
            <View className="bg-red-900/40 px-3 py-2 rounded-full border border-red-500/30 flex-row items-center gap-1">
              <MaterialCommunityIcons name="skull" size={14} color="#ef4444" />
              <Text className="text-red-400 text-[10px] font-bold">DEAD</Text>
            </View>
          )}
        </View>
        <View className="items-end">
          <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            Phase
          </Text>
          <Text
            className={`font-black text-lg ${isNight ? "text-[#ff8c00]" : "text-[#ff8c00]"}`}
          >
            {phase}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* STATUS MESSAGES */}
        <View className="items-center mb-8 px-2">
          <MaterialCommunityIcons
            name={isNight ? "weather-night" : "white-balance-sunny"}
            size={32}
            color={isNight ? "#818cf8" : "#fbbf24"}
            style={{ marginBottom: 10 }}
          />

          <Text className="text-white font-bold text-xl text-center leading-7 mb-2">
            {message}
          </Text>

          {/* Action Prompts */}
          {hasSubmitted ? (
            <View className="mt-2 flex-row items-center bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
              <MaterialCommunityIcons name="lock" size={14} color="#ff8c00" />
              <Text className="text-[#ff8c00] text-sm font-bold ml-2 uppercase tracking-wide">
                Locked
              </Text>
            </View>
          ) : privatePrompt ? (
            <View className="bg-white/10 px-4 py-2 rounded-lg mt-2 border border-white/20">
              <Text className="text-amber-300 font-bold text-sm text-center">
                {privatePrompt}
              </Text>
            </View>
          ) : (
            canAct && (
              <Text className="text-white/60 text-sm mt-2 font-medium bg-white/5 px-3 py-1 rounded-lg">
                {isNight ? "Waiting for your action..." : "Cast your vote."}
              </Text>
            )
          )}
        </View>

        {/* LOBBY VIEW */}
        {phase === "LOBBY" && (
          <View className="items-center justify-center py-10 bg-white/[0.03] rounded-3xl border border-white/[0.08] mx-2">
            {isHost ? (
              <TouchableOpacity
                onPress={() => sendGameAction("start_game")}
                className="bg-white w-[80%] py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-black font-black tracking-widest text-sm">
                  START GAME
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-white/30 text-xs font-bold uppercase">
                Waiting for Host
              </Text>
            )}
          </View>
        )}

        {/* PLAYER GRID */}
        {(isNight || isDay) && (
          <View className="flex-row flex-wrap gap-3 justify-center">
            {alivePlayers.map((p: any) => {
              const isMe = p.id === userData?.clerkId;
              const isSelected = selectedTarget === p.id;
              const voteCount = Object.values(currentVotes).filter(
                (v) => v === p.id
              ).length;

              // 5. INTERACTION LOGIC:
              // - Must be able to act generaly
              // - Must not be me (unless doc)
              // - Must NOT have submitted yet
              const isInteractable =
                canAct && (!isMe || myRole === "DOCTOR") && !hasSubmitted;

              // 6. STYLING LOGIC:
              // - If I have submitted and this is NOT the selected one -> Dim it out heavily
              const isDimmed = hasSubmitted && !isSelected;

              return (
                <TouchableOpacity
                  key={p.id}
                  disabled={!isInteractable}
                  onPress={() => handleAction(p.id)}
                  className={`w-[30%] aspect-[0.9] rounded-2xl items-center justify-center border relative overflow-hidden
                    ${isSelected ? `bg-${roleConfig.actionName === "KILL" ? "red" : "blue"}-500/20 border-${roleConfig.color}` : "bg-white/[0.05] border-white/[0.05]"}
                    ${!isInteractable && !isSelected ? "opacity-30" : "opacity-100"} 
                    ${isInteractable ? "active:bg-white/10" : ""}
                  `}
                  style={{
                    borderColor: isSelected
                      ? roleConfig.color
                      : "rgba(255,255,255,0.1)",
                    opacity: isDimmed
                      ? 0.3
                      : isInteractable || isSelected
                        ? 1
                        : 0.5,
                  }}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-black/30">
                    <Text className="text-white font-black text-lg">
                      {p.username?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    className="text-white font-bold text-[10px] text-center px-1"
                    numberOfLines={1}
                  >
                    {p.username}
                  </Text>

                  {isDay && voteCount > 0 && (
                    <View className="absolute top-1 right-1 bg-amber-500 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-black text-[10px] font-bold">
                        {voteCount}
                      </Text>
                    </View>
                  )}

                  {/* Selected Indicator Icon */}
                  {isSelected && (
                    <View className="absolute inset-0 items-center justify-center bg-black/40">
                      <MaterialCommunityIcons
                        name={roleConfig.icon}
                        size={24}
                        color={roleConfig.color}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* CIVILIAN SLEEP SCREEN */}
            {isNight && myRole === "CIVILIAN" && !amIDead && (
              <View className="w-full mt-6 bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/20 items-center">
                <MaterialCommunityIcons
                  name="sleep"
                  size={32}
                  color="#818cf8"
                />
                <Text className="text-indigo-200 mt-2 font-bold">
                  You are sleeping...
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
