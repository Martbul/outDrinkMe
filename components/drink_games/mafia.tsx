import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { useApp } from "@/providers/AppProvider";

export default function RenderMafiaBoard() {
  const { isHost, gameState, leaveGame, sendGameAction } =
    useDrunkGame();
  const { userData } = useApp();

  const state = gameState as any;
  const phase = state?.phase || "LOBBY";
  const myRole = state?.myRole || "UNKNOWN";
  const message = state?.message || "";
  const timeLeft = state?.timeLeft || 0;
  const alivePlayers = state?.alivePlayers || [];
  const deadPlayers = state?.deadPlayers || [];

  // Determine if I am alive
  const amIDead = deadPlayers.some((p: any) => p.id === userData?.clerkId);

  // Timer Logic
  const [localTime, setLocalTime] = useState(timeLeft);
  useEffect(() => {
    setLocalTime(timeLeft);
    if (timeLeft <= 0) return;
    const interval = setInterval(
      () => setLocalTime((t: number) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [timeLeft, phase]);

  // Role Reveal Color
  const roleColor = myRole === "MAFIA" ? "#ef4444" : "#ccc";

  // --- ACTIONS ---
  const handleAction = (targetId: string) => {
    if (phase === "NIGHT" && myRole === "MAFIA") {
      sendGameAction("kill", { targetId });
    } else if (phase === "VOTING") {
      sendGameAction("vote", { targetId });
    }
  };

  const THEME_ORANGE = "#ff8c00";

  return (
    <View className="flex-1 bg-black w-full h-full">
      <View className="flex-row justify-between items-center mb-6 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <View
            className={`px-4 py-1.5 rounded-full border border-white/10 flex-row items-center gap-2`}
            style={{
              backgroundColor: `${roleColor}20`,
              borderColor: `${roleColor}40`,
            }}
          >
            <MaterialCommunityIcons
              name={myRole === "MAFIA" ? "domino-mask" : "account"}
              size={14}
              color={roleColor}
            />
            <Text
              className="font-black uppercase text-[10px] tracking-widest"
              style={{ color: roleColor }}
            >
              {myRole}
            </Text>
          </View>

          {amIDead && (
            <View className="bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700 flex-row items-center gap-1">
              <MaterialCommunityIcons name="ghost" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-[10px] font-bold">DEAD</Text>
            </View>
          )}
        </View>

        {/* Timer */}
        <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={localTime < 10 ? "#ef4444" : "#fbbf24"}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`font-mono font-bold text-xs ${localTime < 10 ? "text-red-500" : "text-amber-400"}`}
          >
            {localTime < 10 ? `0${localTime}` : localTime}
          </Text>
        </View>
      </View>

      {/* PHASE HEADER */}
      <View className="items-center mb-6 px-6">
        <Text className="text-orange-500 font-black tracking-[4px] uppercase text-[14px] mb-2">
         {phase}
        </Text>
        <Text className="text-white font-black text-2xl text-center leading-8">
          {message}
        </Text>
      </View>

      {/* INTERACTIVE AREA */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* LOBBY STATE */}
        {phase === "LOBBY" && (
          <View className="items-center justify-center py-10 bg-white/[0.03] rounded-3xl border border-white/[0.08] mx-2">
            <View className="w-24 h-24 rounded-full bg-white/[0.05] items-center justify-center mb-6 border border-white/10">
              <MaterialCommunityIcons name="incognito" size={48} color="#666" />
            </View>
            <Text className="text-white font-bold text-lg mb-1">
              Secrets & Lies
            </Text>
            <Text className="text-white/40 text-sm text-center px-8 mb-8">
              Waiting for the host to assign roles. Prepare your poker face.
            </Text>

            {isHost ? (
              <TouchableOpacity
                onPress={() => sendGameAction("start_game")}
                className="bg-orange-600 w-[80%] py-4 rounded-2xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-black font-black tracking-widest text-sm">
                  ASSIGN ROLES
                </Text>
                <MaterialCommunityIcons
                  name="cards-playing-outline"
                  size={18}
                  color="black"
                />
              </TouchableOpacity>
            ) : (
              <View className="bg-white/5 px-6 py-3 rounded-full flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#666" />
                <Text className="text-white/30 text-xs font-bold uppercase tracking-wide">
                  Host is starting...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ACTIVE GAME STATE */}
        {(phase === "NIGHT" || phase === "VOTING" || phase === "DAY") && (
          <View className="flex-row flex-wrap gap-3 justify-center">
            {alivePlayers.map((p: any) => {
              const isMe = p.id === userData?.clerkId;

              // Interaction Logic
              let canInteract = false;
              let actionLabel = "";
              let actionColor = ""; // Tailwind class prefix essentially

              if (phase === "NIGHT" && myRole === "MAFIA" && !isMe) {
                canInteract = true;
                actionLabel = "KILL";
                actionColor = "red";
              } else if (phase === "VOTING" && !isMe) {
                canInteract = true;
                actionLabel = "VOTE";
                actionColor = "orange";
              }

              return (
                <TouchableOpacity
                  key={p.id}
                  disabled={!canInteract}
                  onPress={() => handleAction(p.id)}
                  className={`w-[30%] aspect-[0.85] rounded-2xl items-center justify-center border relative overflow-hidden ${
                    canInteract
                      ? `bg-white/[0.08] border-white/20 active:bg-${actionColor}-500/20 active:border-${actionColor}-500`
                      : "bg-white/[0.03] border-white/[0.05] opacity-60"
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mb-2 bg-${canInteract ? "white/10" : "black/20"}`}
                  >
                    <Text className="text-white font-black text-lg">
                      {p.username?.[0]?.toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    className="text-white font-bold text-[11px] text-center px-1"
                    numberOfLines={1}
                  >
                    {p.username}
                  </Text>

                  {canInteract && (
                    <View
                      className={`absolute top-0 right-0 rounded-bl-xl px-2 py-1 bg-${actionColor}-500/20 border-l border-b border-${actionColor}-500/30`}
                    >
                      <MaterialCommunityIcons
                        name={actionLabel === "KILL" ? "knife" : "vote"}
                        size={12}
                        color={actionLabel === "KILL" ? "#ef4444" : "#f97316"}
                      />
                    </View>
                  )}

                  {isMe && (
                    <View className="absolute bottom-1 bg-white/10 px-2 py-0.5 rounded-full">
                      <Text className="text-[8px] text-white/50 font-bold uppercase">
                        YOU
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* GRAVEYARD */}
        {deadPlayers.length > 0 && (
          <View className="mt-10 border-t border-white/10 pt-6">
            <View className="flex-row items-center justify-center mb-4 opacity-50">
              <View className="h-[1px] bg-white/20 w-8 mr-2" />
              <Text className="text-white/40 text-[10px] font-bold uppercase tracking-[3px]">
                THE FALLEN
              </Text>
              <View className="h-[1px] bg-white/20 w-8 ml-2" />
            </View>

            <View className="flex-row flex-wrap justify-center gap-2">
              {deadPlayers.map((p: any) => (
                <View
                  key={p.id}
                  className="bg-[#1a1a1a] border border-white/5 pl-2 pr-3 py-1.5 rounded-lg flex-row items-center"
                >
                  <MaterialCommunityIcons
                    name="skull"
                    size={14}
                    color="#4b5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-gray-500 text-xs font-medium line-through decoration-gray-600">
                    {p.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* GAME OVER MODAL */}
      {phase === "GAME_OVER" && (
        <View className="absolute inset-0 bg-black/95 z-50 justify-center items-center p-6">
          <View className="bg-[#1a1a1a] w-full p-8 rounded-3xl border border-white/10 items-center">
            <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
              <MaterialCommunityIcons
                name="trophy"
                size={40}
                color={message.includes("MAFIA") ? "#ef4444" : "#3b82f6"}
              />
            </View>

            <Text
              className={`font-black text-2xl mb-2 text-center uppercase tracking-widest ${message.includes("MAFIA") ? "text-red-500" : "text-gray-500"}`}
            >
              {message.includes("MAFIA") ? "Mafia Wins" : "Civilians Win"}
            </Text>

            <Text className="text-white/60 text-center text-sm mb-8 leading-5 font-medium px-4">
              {message}
            </Text>

            <TouchableOpacity
              onPress={leaveGame}
              className="bg-white px-8 py-4 rounded-2xl w-full items-center"
            >
              <Text className="text-black font-black tracking-widest text-sm">
                RETURN TO LOBBY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
