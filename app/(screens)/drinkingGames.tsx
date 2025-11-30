import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Share,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useDrunkGame, KingsCupState, BurnBookState } from "@/providers/DrunkGameProvider";

// --- CONSTANTS ---
const GAMES = [
  {
    id: "kings-cup",
    label: "King's Cup",
    icon: "cards-playing-outline",
    iconType: "MCI",
    description: "The classic card drinking game.",
  },
  {
    id: "burn-book",
    label: "Burn Book",
    icon: "book-open-variant",
    iconType: "MCI",
    description: "Roast your friends anonymously.",
  },
  {
    id: "this-or-that",
    label: "This Or That",
    icon: "yin-yang",
    iconType: "FA5",
    description: "Choose between two difficult options.",
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function GameLobbyScreen() {
  const insets = useSafeAreaInsets();

  // --- STATE & HOOKS ---
  const {
    stage,
    loading,
    sessionId,
    isHost,
    hostName,
    gameType, 
    gameLabel, 
    players,
    messages,
    publicGames,
    gameState,
    createGame,
    joinGame,
    leaveGame,
    startGame,
    sendGameAction,
    sendMessage,
    refreshPublicGames,
  } = useDrunkGame();

  const [inputMsg, setInputMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);

    const [burnBookuestionText, setBurnBookuestionText] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPublicGames();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my drinking game on OutDrinkMe! Game: ${gameLabel}\nCode: ${sessionId}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getGameIcon = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    return game
      ? { icon: game.icon, type: game.iconType }
      : { icon: "gamepad-variant", type: "MCI" };
  };

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg("");
  };

  const renderLobby = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#EA580C"
        />
      }
    >
      <NestedScreenHeader
        heading="Drinking Lobby"
        secondaryHeading="MULTIPLAYER"
      />

      {/* Start New Game */}
      <View className="px-4 mb-8 pt-5">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3 ml-1">
          START A NEW GAME
        </Text>
        <View className="gap-3">
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => createGame(game.id, game.label)}
              disabled={loading}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex-row items-center active:bg-white/[0.08]"
            >
              <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mr-4">
                {game.iconType === "MCI" ? (
                  <MaterialCommunityIcons
                    name={game.icon as any}
                    size={24}
                    color="#EA580C"
                  />
                ) : (
                  <FontAwesome5
                    name={game.icon as any}
                    size={20}
                    color="#EA580C"
                  />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-black">
                  {game.label}
                </Text>
                <Text className="text-white/40 text-xs font-medium">
                  {game.description}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#555"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Public Games */}
      <View className="px-4">
        <View className="flex-row items-center justify-between mb-3 ml-1">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest">
            JOIN PUBLIC GAME
          </Text>
          <TouchableOpacity onPress={() => refreshPublicGames()}>
            <MaterialCommunityIcons name="refresh" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {publicGames.length === 0 ? (
          <View className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 items-center justify-center">
            <MaterialCommunityIcons name="ghost" size={40} color="#333" />
            <Text className="text-white/30 font-bold mt-2">
              No active games found
            </Text>
            <Text className="text-white/20 text-xs text-center mt-1">
              Be the first to create one!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {publicGames.map((game) => {
              const { icon, type } = getGameIcon(game.gameType);
              return (
                <TouchableOpacity
                  key={game.sessionId}
                  onPress={() =>
                    joinGame(game.sessionId, game.gameType, game.host)
                  }
                  className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex-row items-center active:bg-white/[0.08]"
                >
                  <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3 border border-blue-500/30">
                    {type === "MCI" ? (
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={20}
                        color="#3b82f6"
                      />
                    ) : (
                      <FontAwesome5
                        name={icon as any}
                        size={16}
                        color="#3b82f6"
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base capitalize">
                      {game.gameType.replace("-", " ")}
                    </Text>
                    <Text className="text-white/40 text-xs">
                      Host: {game.host}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.05]">
                    <Ionicons
                      name="people"
                      size={14}
                      color="#888"
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-white/70 font-bold text-xs">
                      {game.players}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderWaitingRoom = () => (
    <View className="flex-1">
      <View className="px-4 py-3 border-b border-white/[0.08] flex-row justify-between items-center bg-white/[0.02]">
        <TouchableOpacity
          onPress={leaveGame}
          className="flex-row items-center p-2 rounded-lg active:bg-white/10"
        >
          <Ionicons name="close" size={24} color="#ef4444" />
        </TouchableOpacity>
        <View className="items-end">
          <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
            {gameLabel || "Lobby"}
          </Text>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <Text className="text-yellow-500 text-xs font-bold">
              WAITING FOR PLAYERS
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 pt-6">
          <View className="bg-white/[0.05] rounded-2xl p-6 items-center border border-white/[0.1] mb-8 relative overflow-hidden">
            <MaterialCommunityIcons
              name="cards-playing"
              size={120}
              color="white"
              style={{
                position: "absolute",
                opacity: 0.03,
                right: -20,
                bottom: -20,
                transform: [{ rotate: "-15deg" }],
              }}
            />

            <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Room Code
            </Text>
            <TouchableOpacity
              onPress={handleShare}
              className="flex-row items-center gap-3 bg-black/20 px-6 py-3 rounded-xl border border-white/10 active:bg-black/40"
            >
              <Text className="text-white text-3xl font-black tracking-[3px]">
                {sessionId.length > 8 ? sessionId.slice(0, 8) : sessionId}
              </Text>
              <View className="bg-orange-600/20 p-2 rounded-lg">
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color="#EA580C"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-white/30 text-[10px] mt-3">
              Tap to share invitation link
            </Text>
          </View>

          {/* Player Grid Header */}
          <View className="flex-row items-baseline justify-between mb-4 px-1">
            <Text className="text-white font-bold text-lg">
              Players{" "}
              <Text className="text-white/40 text-sm">({players.length})</Text>
            </Text>
            {isHost && (
              <Text className="text-orange-500 text-xs font-bold">
                YOU ARE HOST
              </Text>
            )}
          </View>

          {/* Players Grid */}
          <View className="flex-row flex-wrap gap-3">
            {players.map((player) => (
              <View
                key={player.id || player.username}
                className="w-[30%] aspect-square bg-white/[0.03] rounded-xl items-center justify-center border border-white/[0.08] relative"
              >
                <View className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 items-center justify-center mb-2 border border-white/10">
                  <Text className="text-white font-black text-xl">
                    {player.username
                      ? player.username.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>

                <Text
                  className="text-white font-semibold text-xs text-center px-1"
                  numberOfLines={1}
                >
                  {player.username}
                </Text>

                {player.isHost && (
                  <View className="absolute -top-2 -right-2 bg-yellow-500 w-6 h-6 rounded-full items-center justify-center border-2 border-black">
                    <MaterialCommunityIcons
                      name="crown"
                      size={14}
                      color="black"
                    />
                  </View>
                )}
              </View>
            ))}

            {[...Array(Math.max(0, 3 - players.length))].map((_, i) => (
              <View
                key={`empty-${i}`}
                className="w-[30%] aspect-square rounded-xl border-2 border-dashed border-white/[0.05] items-center justify-center bg-transparent"
              >
                <Ionicons name="person" size={20} color="#333" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer / Start Button */}
      <View
        className="p-4 border-t border-white/[0.08] bg-black shadow-lg"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        {isHost ? (
          <TouchableOpacity
            onPress={startGame}
            className="bg-orange-600 py-4 rounded-2xl items-center flex-row justify-center gap-2"
          >
            <Text className="text-black text-lg font-black tracking-widest">
              START GAME
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        ) : (
          <View className="bg-white/[0.05] py-4 rounded-2xl items-center border border-white/10">
            <View className="flex-row items-center gap-3">
              <ActivityIndicator size="small" color="#EA580C" />
              <Text className="text-white/70 text-sm font-semibold">
                Host is setting up...
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // 3. GAME BOARD 1: KING'S CUP
  const renderKingsCupBoard = () => {
    // Cast State to Specific Game Type
    const state = gameState as KingsCupState;
    const currentCard = state?.currentCard;
    const cardsRemaining = state?.cardsRemaining ?? 52;
    const gameOver = state?.gameOver ?? false;

    if (!currentCard && !gameOver) {
      // Game started, but no card drawn yet
      return (
        <View className="flex-1 items-center justify-center p-6">
          <TouchableOpacity
            disabled={!isHost}
            onPress={() => sendGameAction("draw_card")}
            className={`w-48 h-72 bg-orange-600 rounded-2xl border-4 border-white/10 items-center justify-center shadow-xl ${
              isHost ? "active:bg-orange-700" : "opacity-80"
            }`}
          >
            <MaterialCommunityIcons
              name="cards-playing-outline"
              size={64}
              color="white"
            />
            <Text className="text-white font-black text-xl mt-2 tracking-widest">
              DECK
            </Text>
            {isHost && (
              <Text className="text-white/70 text-xs mt-1">Tap to Draw</Text>
            )}
          </TouchableOpacity>
          <Text className="text-white/30 font-bold mt-4 uppercase tracking-widest text-xs">
            {cardsRemaining} Cards Remaining
          </Text>
        </View>
      );
    }

    if (gameOver) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <MaterialCommunityIcons name="trophy" size={80} color="#EA580C" />
          <Text className="text-white font-black text-2xl mt-4">GAME OVER</Text>
          <Text className="text-white/50 text-center mt-2">
            The last king has been drawn!
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center p-4">
        {/* Render the Image with Orange Glow */}
        <View className="rounded-2xl">
          <Image
            source={{ uri: currentCard?.imageUrl }}
            className="w-64 h-96 rounded-2xl"
            resizeMode="contain"
          />
        </View>

        {/* The Rule */}
        <View className="mt-8 items-center w-full px-4">
          <Text className="text-orange-500 font-black tracking-widest uppercase text-sm mb-1">
            RULE
          </Text>
          <Text className="text-white font-black text-2xl text-center leading-8">
            {currentCard?.rule || "Drink!"}
          </Text>
        </View>

        {isHost && (
          <TouchableOpacity
            onPress={() => sendGameAction("draw_card")}
            className="mt-6 bg-white/10 border border-white/20 px-8 py-3 rounded-full flex-row items-center active:bg-white/20"
          >
            <Text className="text-white font-bold mr-2">Draw Next Card</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              color="white"
              size={16}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

 
  const renderBurnBookBoard = () => {
    const state = gameState as any; 
    const phase = state?.phase || "collecting";
    const collectedCount = state?.collectedCount || 0;


    const handleSubmitQuestion = () => {
      if (!burnBookuestionText.trim()) return;

      sendGameAction("submit_question", { payload: burnBookuestionText });

      setInputMsg("");
      setBurnBookuestionText("");
      Alert.alert("Submitted", "Your question has been thrown into the fire.");
    };

    return (
      <View className="flex-1 p-6">
        {phase === "collecting" && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-center"
          >
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-red-500/10 rounded-full items-center justify-center mb-4 border border-red-500/30">
                <MaterialCommunityIcons name="fire" size={40} color="#ef4444" />
              </View>
              <Text className="text-white font-black text-2xl tracking-wider">
                BURN BOOK
              </Text>
              <Text className="text-white/50 text-center mt-2 text-xs px-4">
                Submit an anonymous question about the group. {"\n"}
                We will vote on who fits the description best.
              </Text>
            </View>

            <View className="bg-white/10 rounded-2xl border border-white/10 p-4 mb-4">
              <TextInput
                className="text-white text-lg font-medium min-h-[100px]"
                placeholder="e.g., Who is most likely to get arrested?"
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
                value={burnBookuestionText}
                onChangeText={setBurnBookuestionText}
                maxLength={120}
                returnKeyType="done"
                blurOnSubmit
              />
              <Text className="text-white/20 text-[10px] text-right mt-2">
                {burnBookuestionText.length}/120
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmitQuestion}
              disabled={burnBookuestionText.length === 0}
              className={`py-4 rounded-xl items-center flex-row justify-center space-x-2 ${
                burnBookuestionText.length > 0
                  ? "bg-red-600 active:bg-red-700"
                  : "bg-white/5"
              }`}
            >
              <Text
                className={`font-black tracking-widest ${burnBookuestionText.length > 0 ? "text-white" : "text-white/20"}`}
              >
                SUBMIT TO FIRE
              </Text>
              {burnBookuestionText.length > 0 && (
                <MaterialCommunityIcons
                  name="send"
                  color="white"
                  size={16}
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>

            <View className="mt-8 items-center">
              <Text className="text-white/40 font-bold text-xs uppercase tracking-widest mb-1">
                Pool Status
              </Text>
              <Text className="text-white font-black text-3xl">
                {collectedCount}
              </Text>
              <Text className="text-white/20 text-[10px]">
                Questions Collected
              </Text>
            </View>

            {isHost && (
              <View className="mt-auto border-t border-white/10 pt-6 items-center w-full">
                <TouchableOpacity
                  onPress={() => sendGameAction("begin_voting")}
                  className="bg-white/10 border border-white/20 w-full py-4 rounded-xl flex-row items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white font-bold mr-2">
                    Begin Voting Phase
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    color="white"
                    size={16}
                  />
                </TouchableOpacity>
                <Text className="text-white/20 text-[10px] mt-2">
                  Only click this when everyone has submitted.
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>
        )}

        {phase === "voting" && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Voting Phase UI...</Text>
          </View>
        )}

        {phase === "results" && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Results UI...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGame = () => (
    <View className="flex-1">
      {/* Game Header */}
      <View className="px-4 pb-4 border-b border-white/[0.08] pt-2 bg-white/[0.02]">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Leave Game?", "Are you sure you want to exit?", [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", onPress: leaveGame, style: "destructive" },
              ]);
            }}
            className="flex-row items-center bg-white/[0.05] py-2 px-3 rounded-lg"
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text className="text-white font-bold ml-2 text-xs">EXIT</Text>
          </TouchableOpacity>
          <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <Text className="text-green-500 text-[10px] font-black tracking-widest">
              LIVE
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row justify-between items-end">
          <View>
            <Text className="text-orange-600 text-sm font-black tracking-wider uppercase">
              {gameLabel || "Game Session"}
            </Text>
            <Text className="text-white/30 text-xs mt-1">Host: {hostName}</Text>
          </View>
          <Text className="text-white/20 text-[10px] font-mono">
            {sessionId.slice(0, 6)}
          </Text>
        </View>
      </View>

      <View className="flex-[1.5] bg-white/[0.02] border-b border-white/[0.08]">
        {gameType === "kings-cup" && renderKingsCupBoard()}
        {gameType === "burn-book" && renderBurnBookBoard()}
        {!["kings-cup", "burn-book"].includes(gameType) && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Game Not Supported Yet</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {loading && stage === "lobby" && (
        <View className="absolute inset-0 bg-black/80 z-50 justify-center items-center">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      )}

      {stage === "lobby" && renderLobby()}
      {stage === "waiting" && renderWaitingRoom()}
      {stage === "game" && renderGame()}
    </View>
  );
}
