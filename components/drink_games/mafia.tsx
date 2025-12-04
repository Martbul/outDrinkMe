import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "@/providers/AppProvider";

const ROLE_CONFIG: Record<
  string,
  { color: string; icon: any; actionName: string }
> = {
  MAFIA: { color: "#ef4444", icon: "domino-mask", actionName: "KILL" },
  DOCTOR: { color: "#ffffffff", icon: "medical-bag", actionName: "HEAL" },
  POLICE: { color: "#3b82f6", icon: "police-badge", actionName: "CHECK" },
  SPY: { color: "#a855f7", icon: "eye-plus", actionName: "SPY" },
  WHORE: { color: "#ec4899", icon: "lipstick", actionName: "BLOCK" },
  CIVILIAN: { color: "#9ca3af", icon: "account", actionName: "" },
  UNKNOWN: { color: "#666", icon: "help-circle-outline", actionName: "" },
};

export default function RenderMafiaBoard() {
  const { isHost, gameState, sendGameAction, startGame } = useDrunkGame();
  const { userData } = useApp();

  const [persistedRole, setPersistedRole] = useState("UNKNOWN");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const state = gameState as any;
  const phase = state?.phase || "UNKNOWN";

  const revealedRoles = state?.revealedRoles || {};
  const isGameOver = phase === "GAME_OVER";

  const myRole =
    state?.myRole && state.myRole !== "UNKNOWN" ? state.myRole : persistedRole;

  const rawPrompt = state?.actionPrompt || "";
  const privatePrompt =
    phase === "NIGHT" && myRole !== "CIVILIAN" ? rawPrompt : "";
  const message = state?.message || "";

  const alivePlayers = state?.alivePlayers || [];
  const deadPlayers = state?.deadPlayers || [];
  const currentVotes = state?.votes || {};

  const displayPlayers = isGameOver
    ? [...alivePlayers, ...deadPlayers]
    : alivePlayers;

  useEffect(() => {
    if (state?.myRole && state.myRole !== "UNKNOWN") {
      setPersistedRole(state.myRole);
    }
  }, [state?.myRole]);

  useEffect(() => {
    setSelectedTarget(null);
    setHasSubmitted(false);
  }, [phase]);

  const amIDead = deadPlayers.some((p: any) => p.id === userData?.clerkId);
  const roleConfig = ROLE_CONFIG[myRole] || ROLE_CONFIG.UNKNOWN;

  const isNight = phase === "NIGHT";
  const isResults = phase === "RESULTS";

  // Treat RESULTS like DAY so the grid stays visible
  const isDay = phase === "DAY" || phase === "VOTING" || isResults;

  const canAct =
    !amIDead &&
    !isResults &&
    !isGameOver && // No acting if game over
    ((isNight && myRole !== "CIVILIAN" && myRole !== "UNKNOWN") || isDay);

  const handleAction = (targetId: string) => {
    if (!canAct || hasSubmitted) return;
    if (targetId === userData?.clerkId && myRole !== "DOCTOR") return;

    setSelectedTarget(targetId);
    setHasSubmitted(true);

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
              {myRole === "UNKNOWN" ? "LOADING..." : myRole}
            </Text>
          </View>
          {amIDead && !isGameOver && (
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
          <Text className={`font-black text-xl text-orange-600`}>
            {isGameOver ? "FINISHED" : phase}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="items-center mb-8 px-2">
          <MaterialCommunityIcons
            name={
              isNight
                ? "weather-night"
                : isGameOver
                  ? "trophy"
                  : "white-balance-sunny"
            }
            size={48}
            color={isNight ? "#818cf8" : isGameOver ? "#EA580C" : "#fbbf24"}
            style={{ marginBottom: 10 }}
          />

          <Text
            className={`font-bold text-xl text-center leading-7 mb-2 ${isGameOver ? "text-orange-600 text-2xl uppercase tracking-widest" : "text-white"}`}
          >
            {message}
          </Text>

          {/* Prompt Logic */}
          {privatePrompt ? (
            <View className="bg-white/10 px-4 py-2 rounded-lg mt-2 border border-white/20">
              <Text className="text-orange-600 font-bold text-sm text-center">
                {privatePrompt}
              </Text>
            </View>
          ) : myRole === "UNKNOWN" && !amIDead && !isGameOver ? (
            <Text className="text-white/30 text-sm mt-2 font-medium italic">
              Assigning roles...
            </Text>
          ) : canAct ? (
            <Text className="text-white/60 text-sm mt-2 font-medium bg-white/5 px-3 py-1 rounded-lg">
              {isNight
                ? "Tap a player to perform your action"
                : "Tap a player to be executed"}
            </Text>
          ) : null}
        </View>

        {/* PLAYER GRID */}
        <View className="flex-row flex-wrap gap-3 justify-center">
          {displayPlayers.map((p: any) => {
            const isMe = p.id === userData?.clerkId;
            const isSelected = selectedTarget === p.id;
            const voteCount = Object.values(currentVotes).filter(
              (v) => v === p.id
            ).length;

            // 3. GET REVEALED ROLE
            const finalRole = isGameOver ? revealedRoles[p.id] : null;
            const finalRoleConfig = finalRole ? ROLE_CONFIG[finalRole] : null;

            // Interaction rules
            const isInteractable =
              canAct && (!isMe || myRole === "DOCTOR") && !hasSubmitted;

            const isDimmed =
              (hasSubmitted && !isSelected) || (!isInteractable && !isSelected);

            // Special Style for Game Over (Highlight Mafia)
            const isMafiaReveal = isGameOver && finalRole === "MAFIA";

            return (
              <TouchableOpacity
                key={p.id}
                disabled={!isInteractable}
                onPress={() => handleAction(p.id)}
                className={`w-[30%] aspect-[0.9] rounded-2xl items-center justify-center border relative overflow-hidden
                  ${isSelected ? `bg-${roleConfig.color === "#ef4444" ? "red" : "blue"}-500/20` : "bg-white/[0.05]"}
                `}
                style={{
                  // In Game Over, highlight Mafia with Red Border
                  borderColor: isMafiaReveal
                    ? "#ef4444"
                    : isSelected
                      ? roleConfig.color
                      : "rgba(255,255,255,0.05)",
                  borderWidth: isMafiaReveal ? 2 : 1,
                  opacity: isDimmed && !isGameOver ? 0.3 : 1, // Don't dim in game over
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

                {isDay && voteCount > 0 && !isGameOver && (
                  <View className="absolute top-1 right-1 bg-amber-500 rounded-full w-5 h-5 items-center justify-center shadow-sm">
                    <Text className="text-black text-[10px] font-bold">
                      {voteCount}
                    </Text>
                  </View>
                )}

                {/* Selected Action Overlay */}
                {isSelected && (
                  <View className="absolute inset-0 items-center justify-center bg-black/40">
                    <MaterialCommunityIcons
                      name={roleConfig.icon}
                      size={24}
                      color={roleConfig.color}
                    />
                  </View>
                )}

                {/* 4. REVEAL ROLE OVERLAY (GAME OVER) */}
                {isGameOver && finalRoleConfig && (
                  <View className="absolute bottom-0 w-full bg-black/80 py-1 items-center flex-row justify-center gap-1">
                    <MaterialCommunityIcons
                      name={finalRoleConfig.icon}
                      size={10}
                      color={finalRoleConfig.color}
                    />
                    <Text
                      style={{ color: finalRoleConfig.color }}
                      className="text-[8px] font-bold"
                    >
                      {finalRole}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Special State: Sleeping Civilian */}
        {isNight && myRole === "CIVILIAN" && !amIDead && (
          <View className="w-full mt-6 bg-white/5 p-6 rounded-2xl border border-white/10 items-center">
            <MaterialCommunityIcons name="sleep" size={32} color="#666" />
            <Text className="text-white/30 mt-2 font-bold text-xs uppercase tracking-widest">
              You are sleeping
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 5. PLAY AGAIN BUTTON */}
      {isGameOver && isHost && (
        <View className="absolute bottom-10 w-full items-center z-50">
          <TouchableOpacity
            // 2. CHANGE THIS: Use startGame instead of sendGameAction
            onPress={startGame}
            className="bg-white px-8 py-4 rounded-full shadow-lg"
          >
            <Text className="text-black font-black tracking-widest">
              PLAY AGAIN
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
