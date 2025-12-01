import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function RenderMafiaBoard() {
  const { isHost, hostName, players,gameState, leaveGame, sendGameAction } =
      useDrunkGame();
   
   

  const state = gameState as any; 
  const phase = state?.phase || "LOBBY";
  const myRole = state?.myRole || "UNKNOWN"; 
  const message = state?.message || "";
  const timeLeft = state?.timeLeft || 0;
  const alivePlayers = state?.alivePlayers || [];
  const deadPlayers = state?.deadPlayers || [];

  // Determine if I am alive
  const myId = players.find(
    (p) => p.username === players.find((x) => x.isHost === isHost)?.username
  )?.id;
  // ^ Note: In a real app, use the actual user ID from auth, assuming 'players' has the current user.
  // For now, we rely on the server handling validation, we just need to know for UI visuals.
  const amIDead = deadPlayers.some((p: any) => p.username === hostName); // Simplified check, better to use ID

  // Timer Logic
  const [localTime, setLocalTime] = useState(timeLeft);
  useEffect(() => {
    setLocalTime(timeLeft);
    if (timeLeft <= 0) return;
    const interval = setInterval(
      () => setLocalTime((t:number) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [timeLeft, phase]);

  // Role Reveal Color
  const roleColor = myRole === "MAFIA" ? "#ef4444" : "#3b82f6";

  // --- ACTIONS ---
  const handleAction = (targetId: string) => {
    if (phase === "NIGHT" && myRole === "MAFIA") {
      sendGameAction("kill", { targetId });
    } else if (phase === "VOTING") {
      sendGameAction("vote", { targetId });
    }
  };

  return (
    <View className="flex-1 bg-black p-4">
      {/* TOP BAR: Role & Timer */}
      <View className="flex-row justify-between items-center mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
        <View className="flex-row items-center gap-2">
          <View
            className="px-3 py-1 rounded text-xs font-bold"
            style={{ backgroundColor: roleColor }}
          >
            <Text className="text-white font-black uppercase text-[10px]">
              {myRole}
            </Text>
          </View>
          {amIDead && (
            <View className="bg-gray-600 px-2 py-1 rounded">
              <Text className="text-white text-[10px]">GHOST</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={localTime < 10 ? "#ef4444" : "#fbbf24"}
          />
          <Text
            className={`font-mono font-bold ${localTime < 10 ? "text-red-500" : "text-amber-400"}`}
          >
            00:{localTime < 10 ? `0${localTime}` : localTime}
          </Text>
        </View>
      </View>

      {/* PHASE HEADER */}
      <View className="items-center mb-8">
        <Text className="text-white/30 text-xs font-bold tracking-[4px] uppercase mb-2">
          {phase}
        </Text>
        <Text className="text-white font-black text-2xl text-center leading-8 px-4">
          {message}
        </Text>
      </View>

      {/* INTERACTIVE AREA */}
      <ScrollView className="flex-1">
        {phase === "LOBBY" && (
          <View className="items-center justify-center py-10">
            <MaterialCommunityIcons name="domino-mask" size={80} color="#333" />
            <Text className="text-white/30 mt-4 text-center">
              Waiting for host to assign roles...
            </Text>
            {isHost && (
              <TouchableOpacity
                onPress={() => sendGameAction("start_game")}
                className="mt-6 bg-orange-600 px-8 py-3 rounded-full"
              >
                <Text className="text-white font-bold">
                  Assign Roles & Start
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(phase === "NIGHT" || phase === "VOTING" || phase === "DAY") && (
          <View className="flex-row flex-wrap gap-3 justify-center">
            {alivePlayers.map((p: any) => {
              const isMe = p.username === hostName; // Replace with ID check in production

              // Interaction Logic
              let canInteract = false;
              let actionLabel = "";

              if (phase === "NIGHT" && myRole === "MAFIA" && !isMe) {
                canInteract = true;
                actionLabel = "KILL";
              } else if (phase === "VOTING" && !isMe) {
                canInteract = true;
                actionLabel = "VOTE";
              }

              return (
                <TouchableOpacity
                  key={p.id}
                  disabled={!canInteract}
                  onPress={() => handleAction(p.id)}
                  className={`w-[30%] aspect-square rounded-xl items-center justify-center border ${
                    canInteract
                      ? "bg-white/10 border-white/20 active:bg-red-500/20 active:border-red-500"
                      : "bg-white/5 border-transparent opacity-80"
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center mb-2">
                    <Text className="text-white font-bold">
                      {p.username?.[0]}
                    </Text>
                  </View>
                  <Text
                    className="text-white/80 text-xs font-medium"
                    numberOfLines={1}
                  >
                    {p.username}
                  </Text>

                  {canInteract && (
                    <View className="absolute top-1 right-1 bg-red-500/20 px-1.5 py-0.5 rounded">
                      <Text className="text-red-500 text-[8px] font-bold">
                        {actionLabel}
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
          <View className="mt-8 border-t border-white/10 pt-4">
            <Text className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3 text-center">
              Graveyard
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {deadPlayers.map((p: any) => (
                <View
                  key={p.id}
                  className="bg-black border border-white/10 px-3 py-1 rounded-full flex-row items-center opacity-50"
                >
                  <MaterialCommunityIcons
                    name="skull"
                    size={12}
                    color="#666"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-white/50 text-xs line-through">
                    {p.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* GAME OVER SCREEN */}
      {phase === "GAME_OVER" && (
        <View className="absolute inset-0 bg-black/90 z-50 justify-center items-center p-6">
          <MaterialCommunityIcons name="trophy" size={60} color="#fbbf24" />
          <Text className="text-white font-black text-3xl mt-4 text-center uppercase tracking-widest text-amber-400">
            {message.includes("MAFIA") ? "Mafia Wins" : "Civilians Win"}
          </Text>
          <Text className="text-white/60 text-center mt-2 mb-8">{message}</Text>
          <TouchableOpacity
            onPress={leaveGame}
            className="bg-white/10 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Exit Lobby</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
