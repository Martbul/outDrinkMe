import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useDrunkGame, KingsCupState } from "@/providers/DrunkGameProvider";
import RenderMafiaBoard from "@/components/drink_games/mafia";
import RenderBurnBookBoard from "@/components/drink_games/burn_book";
import QRCode from "react-native-qrcode-svg";

const GAMES = [
  {
    id: "mafia",
    label: "Mafia",
    icon: "domino-mask",
    iconType: "MCI",
    description: "Deceive, kill, and survive.",
  },
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
];

const GAME_RULES: Record<string, any> = {
  Mafia: {
    title: "How to Play Mafia",
    steps: [
      "The game is split into Day and Night phases.",
      "NIGHT: The Mafia secretly chooses a victim to kill. The Doctor saves one person. The Sheriff investigates one person.",
      "DAY: Everyone discusses who they think the Mafia is.",
      "VOTE: Players vote to eliminate a suspect. The person with the most votes is removed.",
      "WIN: Civilians win if all Mafia are eliminated. Mafia wins if they outnumber Civilians.",
    ],
  },
  "King's Cup": {
    title: "King's Cup Rules",
    steps: [
      "Players take turns drawing cards.",
      "Each card has a specific rule (e.g., '2 is You', '5 is Guys').",
      "Ace: Everyone drinks.",
      "King: Pour some of your drink into the central cup. The person who draws the 4th King drinks the whole cup!",
      "Don't break the circle of cards, or you drink!",
    ],
  },
  "Drinking Game": {
    title: "Burn Book",
    steps: [
      "Everyone submits an anonymous question (e.g., 'Who is most likely to end up covered in puke?').",
      "Questions are shown one by one. Everyone votes for the player that best fits the description.",
      "The victim is revealed and must drink.",
    ],
  },
};

export default function GameLobbyScreen() {
  const insets = useSafeAreaInsets();

  const {
    stage,
    loading,
    sessionId,
    isHost,
    hostName,
    gameType,
    gameLabel,
    players,
    publicGames,
    gameState,
    createGame,
    joinGame,
    leaveGame,
    startGame,
    sendGameAction,
    refreshPublicGames,
  } = useDrunkGame();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPublicGames();
    setRefreshing(false);
  };

  const scheme = "outdrinkme";
  const inviteLink = `${scheme}://game?id=${sessionId}`;

  const getGameIcon = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    return game
      ? { icon: game.icon, type: game.iconType }
      : { icon: "gamepad-variant", type: "MCI" };
  };

  const renderLobby = () => (
    <View style={{ paddingBottom: insets.bottom + 20 }}>
      <NestedScreenHeader
        heading="Drinking Lobby"
        secondaryHeading="MULTIPLAYER"
      />

      <View className="px-4 mb-8 pt-5">
        <Text className="text-white/50 text-[12px] font-bold tracking-widest mb-3 ml-1">
          START A NEW GAME
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => createGame(game.id, game.label)}
              disabled={loading}
              className="w-40 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-4 flex-col justify-between active:bg-white/[0.08] min-h-[160px]"
            >
              <View className="items-start">
                <View className="w-14 h-14 rounded-2xl bg-orange-600/10 border border-orange-600/20 items-center justify-center mb-3">
                  {game.iconType === "MCI" ? (
                    <MaterialCommunityIcons
                      name={game.icon as any}
                      size={32}
                      color="#EA580C"
                    />
                  ) : (
                    <FontAwesome5
                      name={game.icon as any}
                      size={24}
                      color="#EA580C"
                    />
                  )}
                </View>
              </View>

              <View>
                <Text className="text-white text-lg font-black leading-tight mb-1">
                  {game.label.replace(" ", "\n")}
                </Text>
                <Text
                  className="text-white/40 text-[10px] font-medium leading-4"
                  numberOfLines={2}
                >
                  {game.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-4">
        <View className="flex-row items-center justify-between mb-3 ml-1">
          <Text className="text-white/50 text-[12px] font-bold tracking-widest">
            JOIN PUBLIC GAME
          </Text>
          <TouchableOpacity onPress={() => refreshPublicGames()}>
            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
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
          <ScrollView
            showsHorizontalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ff8c00"
                colors={["#ff8c00"]}
              />
            }
          >
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
                  <View className="w-10 h-10 rounded-full bg-orange-600/20 items-center justify-center mr-3 border border-[#ff8c00]">
                    {type === "MCI" ? (
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={20}
                        color="#ff8c00"
                      />
                    ) : (
                      <FontAwesome5
                        name={icon as any}
                        size={16}
                        color="#ff8c00"
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
          </ScrollView>
        )}
      </View>
    </View>
  );

  const GAME_RULES: Record<string, any> = {
    "Mafia": {
      title: "How to Play Mafia",
      steps: [
        "The game is split into Day and Night",
        "NIGHT: The Mafia secretly chooses a victim to kill. The Doctor saves one person. The Sheriff investigates one person",
        "DAY: Everyone discusses who they think the Mafia is",
        "VOTE: Players vote to eliminate a suspect. The person with the most votes is removed",
        "WIN: Civilians win if all Mafia are eliminated. Mafia wins if they outnumber the Civilians",
      ],
    },
    "King's Cup": {
      title: "King's Cup Rules",
      steps: [
        "Players take turns drawing cards.",
        "Each card has a specific rule (e.g., '2 is You', '5 is Guys').",
        "Ace: Everyone drinks.",
        "King: Pour some of your drink into the central cup. The person who draws the 4th King drinks the whole cup!",
        "Don't break the circle of cards, or you drink!",
      ],
    },

    "Burn Book": {
      title: "Drinking Game",
      steps: [
        "Everyone submits an anonymous question (e.g., 'Who is most likely to end up covered in puke?').",
        "Questions are shown one by one. Everyone votes for the player that best fits the description.",
        "The victim is revealed and must drink.",
      ],
    },
  };

  const [showRules, setShowRules] = useState(false);

  const renderWaitingRoom = () => {
    // Get rules based on label, fallback to generic if missing
    const activeRules = GAME_RULES[gameLabel] || {
      title: "Game Rules",
      steps: [
        "Follow the host's instructions!",
        "Have fun and drink responsibly.",
      ],
    };

    return (
      <View className="flex-1">
        {/* HEADER (Existing) */}
        <View className="relative px-4 py-3 border-b border-white/[0.08] flex-row justify-between items-center bg-white/[0.02]">
          <View className="absolute left-0 right-0 items-center justify-center">
            <Text className="text-orange-600 text-[18px] font-black tracking-widest uppercase">
              {gameLabel || "Lobby"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={leaveGame}
            className="flex-row items-center p-2 rounded-lg active:bg-white/10 z-10"
          >
            <Ionicons name="close" size={28} color="#ef4444" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2 z-10">
            <View className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <Text className="text-yellow-500 text-xs font-bold text-left">
              {`WAITING FOR\nPLAYERS`}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="px-4 pt-6">
            {/* QR CODE CARD (Existing) */}
            <View className="bg-white/[0.05] rounded-2xl p-6 items-center border border-white/[0.1] mb-6 relative overflow-hidden">
              {gameLabel === "Mafia" && (
                <MaterialCommunityIcons
                  name="domino-mask"
                  size={130}
                  color="white"
                  style={{
                    position: "absolute",
                    opacity: 0.05,
                    right: -20,
                    bottom: -20,
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
              )}
              {gameLabel === "King's Cup" && (
                <MaterialCommunityIcons
                  name="cards-playing"
                  size={130}
                  color="white"
                  style={{
                    position: "absolute",
                    opacity: 0.05,
                    right: -20,
                    bottom: -20,
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
              )}
              {gameLabel === "Burn Book" && (
                <MaterialIcons
                  name="menu-book"
                  size={130}
                  color="white"
                  style={{
                    position: "absolute",
                    opacity: 0.05,
                    right: -10,
                    bottom: -10,
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
              )}

              <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Scan to Join
              </Text>
              <View className="bg-white mt-2 p-2 rounded-xl mb-2 shadow-lg shadow-black/50">
                <QRCode
                  value={inviteLink}
                  size={140}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-white font-bold text-lg">
                Players{" "}
                <Text className="text-white/40 text-sm">
                  ({players.length})
                </Text>
              </Text>

              <TouchableOpacity
                onPress={() => setShowRules(true)}
                className="flex-row items-center justify-center bg-white/[0.05] "
              >
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={24}
                  color="#EA580C" 
                />
              </TouchableOpacity>

              {isHost && (
                <Text className="text-orange-500 text-xs font-bold">
                  YOU ARE HOST
                </Text>
              )}
            </View>

            {/* Player Grid (Existing) */}
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {players.map((player) => (
                <View
                  key={player.id || player.username}
                  className="w-[31%] aspect-[0.85] bg-white/[0.05] rounded-2xl items-center justify-center border border-white/10 relative overflow-hidden shadow-sm"
                >
                  {player.isHost && (
                    <View className="absolute top-0 right-0 bg-yellow-500/20 pl-2 pb-2 pt-1 pr-1 rounded-bl-2xl border-l border-b border-yellow-500/30">
                      <MaterialCommunityIcons
                        name="crown"
                        size={12}
                        color="#fbbf24"
                      />
                    </View>
                  )}

                  <View className="w-14 h-14 rounded-full items-center justify-center mb-3 shadow-lg shadow-black/40 border-2 border-white/10">
                    <Text className="text-white font-black text-xl shadow-sm">
                      {player.username
                        ? player.username.charAt(0).toUpperCase()
                        : "?"}
                    </Text>
                  </View>

                  <Text
                    className="text-white font-bold text-[13px] text-center px-2 leading-4"
                    numberOfLines={1}
                  >
                    {player.username}
                  </Text>

                  <Text className="text-white/30 text-[10px] font-medium mt-1">
                    {player.isHost ? "HOST" : "PLAYER"}
                  </Text>
                </View>
              ))}

              {[...Array(Math.max(0, 3 - players.length))].map((_, i) => (
                <View
                  key={`empty-${i}`}
                  className="w-[31%] aspect-[0.85] rounded-2xl border-2 border-dashed border-white/[0.1] items-center justify-center bg-white/[0.01]"
                >
                  <View className="w-10 h-10 rounded-full bg-white/[0.05] items-center justify-center mb-2">
                    <Ionicons name="add" size={20} color="#666" />
                  </View>
                  <Text className="text-white/30 text-[10px] font-bold tracking-widest uppercase">
                    Invite
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer (Existing) */}
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={showRules}
          onRequestClose={() => setShowRules(false)}
        >
          <View className="flex-1 bg-black/80 justify-end">
            {/* Modal Content */}
            <View className="bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 h-[70%]">
              {/* Modal Header */}
              <View className="p-4 border-b border-white/10 flex-row justify-between items-center bg-white/5 rounded-t-3xl">
                <Text className="text-white font-black text-xl tracking-wide ml-2">
                  HOW TO PLAY
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRules(false)}
                  className="bg-white/10 p-2 rounded-full"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView
                className="flex-1 p-6"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <Text className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-2">
                  {gameLabel?.toUpperCase()}
                </Text>
                <Text className="text-white font-black text-3xl mb-6 leading-8">
                  {activeRules.title}
                </Text>

                {activeRules.steps.map((step: string, index: number) => (
                  <View key={index} className="flex-row mb-6">
                    <View className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-600/40 items-center justify-center mr-4 mt-1">
                      <Text className="text-orange-500 font-bold text-sm">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="text-white/80 text-base flex-1 leading-6 font-medium">
                      {step}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => setShowRules(false)}
                  className="mt-4 bg-white py-4 rounded-xl items-center"
                >
                  <Text className="text-black font-bold text-base">
                    Got it, let's play!
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderKingsCupBoard = () => {
    const state = gameState as KingsCupState;
    const currentCard = state?.currentCard;
    const cardsRemaining = state?.cardsRemaining ?? 52;
    const gameOver = state?.gameOver ?? false;

    if (!currentCard && !gameOver) {
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
        <View className="rounded-2xl">
          <Image
            source={{ uri: currentCard?.imageUrl }}
            className="w-64 h-96 rounded-2xl"
            resizeMode="contain"
          />
        </View>
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

  const renderGame = () => (
    <View className="flex-1">
      <View className="relative px-4 py-3 border-b border-white/[0.08] flex-row justify-between items-center bg-white/[0.02]">
        <View className="absolute left-0 right-0 items-center justify-center">
          <Text className="text-orange-600 text-[18px] font-black tracking-widest uppercase">
            {gameLabel || "Game Session"}
          </Text>
        </View>

        <TouchableOpacity
          onPressIn={() => leaveGame()}
          className="flex-row items-center bg-white/[0.05] py-2 px-3 rounded-lg z-10"
        >
          <Ionicons name="arrow-back" size={16} color="white" />
          <Text className="text-white font-bold ml-2 text-xs">EXIT</Text>
        </TouchableOpacity>

        <View className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30 z-10">
          <Text className="text-orange-500 text-[10px] font-black tracking-widest">
            LIVE
          </Text>
        </View>
      </View>

      <View className="flex-[1.5] bg-white/[0.02] border-b border-white/[0.08]">
        {gameType === "kings-cup" && renderKingsCupBoard()}
        {gameType === "burn-book" && <RenderBurnBookBoard />}
        {gameType === "mafia" && <RenderMafiaBoard />}
        {!["kings-cup", "burn-book", "mafia"].includes(gameType) && (
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
