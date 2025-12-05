import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal } from "react-native";
import { useApp } from "@/providers/AppProvider";

const ROLE_CONFIG: Record<
  string,
  { color: string; icon: any; actionName: string; description: string }
> = {
  MAFIA: {
    color: "#ef4444",
    icon: "domino-mask",
    actionName: "KILL",
    description:
      "Your goal is to eliminate all civilians. At night, choose a victim to kill. During the day, try to blend in and frame others",
  },
  DOCTOR: {
    color: "#ffffffff",
    icon: "medical-bag",
    actionName: "HEAL",
    description:
      "You are the savior. At night, choose one player to heal. If the Mafia targets them, they survive. You can heal yourself, but be careful",
  },
  POLICE: {
    color: "#3b82f6",
    icon: "police-badge",
    actionName: "CHECK",
    description:
      "You are the sheriff. At night, select a player to reveal their true identity. Use this knowledge to guide the town during voting without revealing yourself too early",
  },
  SPY: {
    color: "#a855f7",
    icon: "eye-plus",
    actionName: "SPY",
    description:
      "You are on the Mafia's side, but they don't know who you are. You see who the Mafia is. The Police cannot detect you. Your goal is to confuse the town during the day",
  },
  WHORE: {
    color: "#ec4899",
    icon: "lipstick",
    actionName: "BLOCK",
    description:
      "You are the role blocker. At night, fuck a player to distract them. If they try to perform an action (like killing or investigating), it will fail",
  },
  CIVILIAN: {
    color: "#9ca3af",
    icon: "account",
    actionName: "",
    description:
      "You are an innocent town member. Sleep at night and try to survive. During the day, discuss with others and vote to execute the Mafia",
  },
  UNKNOWN: {
    color: "#666",
    icon: "help-circle-outline",
    actionName: "",
    description: "Role is loading...",
  },
};

export default function RenderMafiaBoard() {
  const { isHost, gameState, sendGameAction, startGame } = useDrunkGame();
  const { userData } = useApp();

  const [persistedRole, setPersistedRole] = useState("UNKNOWN");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 2. NEW STATE FOR MODAL
  const [showRoleModal, setShowRoleModal] = useState(false);

  const state = gameState as any;
  const phase = state?.phase || "UNKNOWN";

  const revealedRoles = state?.revealedRoles || {};
  const isGameOver = phase === "GAME_OVER";
  const intelMessage = state?.intelMessage || "";

  const myRole =
    state?.myRole && state.myRole !== "UNKNOWN" ? state.myRole : persistedRole;

  const roleConfig = ROLE_CONFIG[myRole] || ROLE_CONFIG.UNKNOWN;

  const isNight = phase === "NIGHT";
  const isResults = phase === "RESULTS";
  const isDay = phase === "DAY" || phase === "VOTING" || isResults;

  const rawPrompt = state?.actionPrompt;
  let displayPrompt = "";
  if (
    isNight &&
    myRole !== "CIVILIAN" &&
    myRole !== "SPY" &&
    myRole !== "UNKNOWN"
  ) {
    displayPrompt = rawPrompt || "Waiting for instructions...";
  }

  const message = state?.message || "";
  const alivePlayers = state?.alivePlayers || [];
  const deadPlayers = state?.deadPlayers || [];
  const currentVotes = state?.votes || {};

  const skipCount = Object.values(currentVotes).filter(
    (v) => v === "SKIP"
  ).length;
  const myVote = currentVotes[userData?.clerkId as string];
  const didIVoteSkip = myVote === "SKIP";

  const displayPlayers = useMemo(() => {
    const players = isGameOver
      ? [...alivePlayers, ...deadPlayers]
      : [...alivePlayers];

    return players.sort((a: any, b: any) =>
      (a.username || "").localeCompare(b.username || "")
    );
  }, [alivePlayers, deadPlayers, isGameOver]);

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

  const canAct =
    !amIDead &&
    !isResults &&
    !isGameOver &&
    ((isNight &&
      myRole !== "CIVILIAN" &&
      myRole !== "SPY" &&
      myRole !== "UNKNOWN") ||
      isDay);

  const handleAction = (targetId: string) => {
    if (!canAct || hasSubmitted) return;

    if (
      targetId !== "SKIP" &&
      targetId === userData?.clerkId &&
      myRole !== "DOCTOR"
    )
      return;

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
          {/* 3. CLICKABLE ROLE BADGE */}
          <TouchableOpacity
            onPress={() => setShowRoleModal(true)}
            activeOpacity={0.7}
            className="px-4 py-2 rounded-xl flex-row items-center gap-2 border shadow-sm"
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
            {/* Small hint icon */}
            <MaterialCommunityIcons
              name="information-outline"
              size={12}
              color={roleConfig.color}
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>

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
          <Text
            className={`font-black text-xl ${isGameOver ? "text-green-500" : "text-orange-600"}`}
          >
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
            color={isNight ? "#818cf8" : isGameOver ? "#4ade80" : "#fbbf24"}
            style={{ marginBottom: 10 }}
          />

          <Text
            className={`font-bold text-xl text-center leading-7 mb-2 ${isGameOver ? "text-green-400 text-2xl uppercase tracking-widest" : "text-white"}`}
          >
            {message}
          </Text>

          {intelMessage ? (
            <View className="bg-blue-500/20 px-6 py-3 rounded-xl border border-blue-500/50 mt-2 mb-2 w-full">
              <View className="flex-row items-center justify-center gap-2 mb-1">
                <MaterialCommunityIcons
                  name={myRole === "SPY" ? "incognito" : "eye-check"}
                  size={18}
                  color="#60a5fa"
                />
                <Text className="text-blue-400 font-black text-xs uppercase tracking-widest">
                  {myRole === "SPY" ? "SECRET INTEL" : "INVESTIGATION"}
                </Text>
              </View>
              <Text className="text-white font-bold text-lg text-center">
                {intelMessage}
              </Text>
            </View>
          ) : null}

          {displayPrompt ? (
            <View className="bg-white/10 px-4 py-2 rounded-lg mt-2 border border-white/20">
              <Text className="text-orange-400 font-bold text-sm text-center">
                {displayPrompt}
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

        <View className="flex-row flex-wrap gap-3 justify-between px-2">
          {displayPlayers.map((p: any) => {
            const isMe = p.id === userData?.clerkId;
            const isSelected = selectedTarget === p.id;
            const voteCount = Object.values(currentVotes).filter(
              (v) => v === p.id
            ).length;

            const finalRole = isGameOver ? revealedRoles[p.id] : null;
            const finalRoleConfig = finalRole ? ROLE_CONFIG[finalRole] : null;

            const isInteractable =
              canAct && (!isMe || myRole === "DOCTOR") && !hasSubmitted;

            const isDimmed =
              (hasSubmitted && !isSelected) || (!isInteractable && !isSelected);

            const isMafiaReveal = isGameOver && finalRole === "MAFIA";

            return (
              <TouchableOpacity
                key={p.id}
                disabled={!isInteractable}
                onPress={() => handleAction(p.id)}
                className={`w-[48%] aspect-[0.85] rounded-3xl items-center justify-center border relative overflow-hidden mb-2
                  ${isSelected ? `bg-${roleConfig.color === "#ef4444" ? "red" : "blue"}-500/20` : "bg-white/[0.08]"}
                `}
                style={{
                  borderColor: isMafiaReveal
                    ? "#ef4444"
                    : isSelected
                      ? isNight
                        ? roleConfig.color
                        : "#ffffff"
                      : "rgba(255,255,255,0.08)",
                  borderWidth: isMafiaReveal || isSelected ? 2 : 1,
                  opacity: isDimmed && !isGameOver ? 0.3 : 1,
                }}
              >
                <View className="w-16 h-16 rounded-full items-center justify-center mb-3 bg-black/40 border border-white/10 shadow-lg">
                  <Text className="text-white font-black text-2xl">
                    {p.username?.[0]?.toUpperCase()}
                  </Text>
                </View>

                <Text
                  className="text-white font-bold text-sm text-center px-2 pb-6"
                  numberOfLines={1}
                >
                  {p.username}
                </Text>

                {isDay && voteCount > 0 && !isGameOver && (
                  <View className="absolute top-2 right-2 bg-amber-500 rounded-xl px-2 py-1 items-center justify-center shadow-lg z-20">
                    <Text className="text-black text-xs font-black">
                      {voteCount}
                    </Text>
                  </View>
                )}

                {isSelected && (
                  <View className="absolute inset-0 items-center justify-center bg-black/20 z-10 rounded-3xl">
                    <View className="bg-black/60 p-3 rounded-full">
                      <MaterialCommunityIcons
                        name={isNight ? roleConfig.icon : "vote"}
                        size={32}
                        color={isNight ? roleConfig.color : "white"}
                      />
                    </View>
                  </View>
                )}

                {isGameOver && finalRoleConfig && (
                  <View
                    className="absolute bottom-0 w-full py-2 items-center flex-row justify-center gap-2"
                    style={{ backgroundColor: `${finalRoleConfig.color}30` }}
                  >
                    <MaterialCommunityIcons
                      name={finalRoleConfig.icon}
                      size={14}
                      color={finalRoleConfig.color}
                    />
                    <Text
                      style={{ color: finalRoleConfig.color }}
                      className="text-[10px] font-black uppercase tracking-wider"
                    >
                      {finalRole}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isDay && !isResults && !isGameOver && !amIDead && (
          <View className="mt-4 mb-4 px-2">
            <TouchableOpacity
              disabled={hasSubmitted}
              onPress={() => handleAction("SKIP")}
              className={`w-full py-4 rounded-2xl border flex-row items-center justify-center gap-3
                ${didIVoteSkip ? "bg-stone-700 border-stone-500" : "bg-white/10 border-white/20"}
                ${hasSubmitted && !didIVoteSkip ? "opacity-30" : "opacity-100"}
              `}
            >
              <MaterialCommunityIcons
                name="step-forward-2"
                size={24}
                color={didIVoteSkip ? "#a8a29e" : "white"}
              />
              <Text className="text-white font-bold text-lg tracking-widest">
                SKIP VOTE
              </Text>
              {skipCount > 0 && (
                <View className="bg-stone-500 px-2 py-1 rounded-lg ml-2">
                  <Text className="text-white text-xs font-black">
                    {skipCount}
                  </Text>
                </View>
              )}
              {didIVoteSkip && (
                <View className="absolute right-4">
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#a8a29e"
                  />
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-white/30 text-center text-[10px] mt-2 font-medium uppercase tracking-widest">
              Majority skip = No Execution
            </Text>
          </View>
        )}

        {isNight && myRole === "CIVILIAN" && !amIDead && (
          <View className="w-full mt-6 bg-white/5 p-6 rounded-2xl border border-white/10 items-center">
            <MaterialCommunityIcons name="sleep" size={32} color="#666" />
            <Text className="text-white/30 mt-2 font-bold text-xs uppercase tracking-widest">
              You are sleeping
            </Text>
          </View>
        )}

        {isNight && myRole === "SPY" && !amIDead && (
          <View className="w-full mt-6 bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30 items-center">
            <MaterialCommunityIcons
              name="incognito"
              size={40}
              color="#a855f7"
            />
            <Text className="text-purple-300 mt-3 font-bold text-center">
              You are plotting with the Mafia.
            </Text>
            <Text className="text-purple-400/50 text-xs font-medium text-center mt-1">
              Use the Intel above to protect them tomorrow.
            </Text>
          </View>
        )}
      </ScrollView>

      {isGameOver && isHost && (
        <View className="absolute bottom-10 w-full items-center z-50">
          <TouchableOpacity
            onPress={startGame}
            className="bg-white px-8 py-4 rounded-full shadow-lg"
          >
            <Text className="text-black font-black tracking-widest">
              PLAY AGAIN
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. INFO MODAL */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowRoleModal(false)}
          className="flex-1 bg-black/80 justify-center items-center p-6"
        >
          <View
            className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 w-full max-w-sm items-center shadow-2xl"
            onStartShouldSetResponder={() => true} // Prevent closing when clicking modal content
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-black/50 border-2"
              style={{
                borderColor: roleConfig.color,
                backgroundColor: `${roleConfig.color}20`,
              }}
            >
              <MaterialCommunityIcons
                name={roleConfig.icon}
                size={40}
                color={roleConfig.color}
              />
            </View>

            <Text
              className="font-black text-2xl mb-2 uppercase tracking-widest"
              style={{ color: roleConfig.color }}
            >
              {myRole}
            </Text>

            <View className="h-[1px] w-full bg-white/10 mb-4" />

            <Text className="text-white/80 text-center font-medium leading-6 mb-8 text-base">
              {roleConfig.description}
            </Text>

            <TouchableOpacity
              onPress={() => setShowRoleModal(false)}
              className="bg-white w-full py-4 rounded-xl items-center"
            >
              <Text className="text-black font-bold text-base uppercase tracking-widest">
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
