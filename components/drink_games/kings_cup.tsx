import { useApp } from "@/providers/AppProvider";
import { KingsCupState, useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const THEME_ORANGE = "#ff8c00";

export default function RenderKingsCupBoard() {
  const { gameState, sendGameAction } = useDrunkGame();
  const { userData } = useApp();

  // Modals
  const [buddyModalVisible, setBuddyModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState("");

  // Logic to prevent double-modal opening
  const [handledCardSignature, setHandledCardSignature] = useState<
    string | null
  >(null);

  const state = gameState as KingsCupState;
  const isMyTurn = userData?.clerkId === state?.currentPlayerTurnID;
  const currentCard = state?.currentCard;
  const cardsRemaining = state?.cardsRemaining ?? 52;
  const gameOver = state?.gameOver ?? false;
  const gameStarted = state?.gameStarted ?? false;
  const kingCupDrinker = state?.kingCupDrinker;
  const kingsInCup = state?.kingsInCup ?? 0;
  const gamePlayers = state?.players || [];

  const currentPlayerInGame = gamePlayers.find(
    (p) => p.id === state?.currentPlayerTurnID
  );

  const currentCardSignature = currentCard
    ? `${currentCard.value}-${currentCard.suit}`
    : null;

  useEffect(() => {
    if (currentCardSignature !== handledCardSignature && currentCard === null) {
      setHandledCardSignature(null);
    }
  }, [currentCardSignature, handledCardSignature, currentCard]);

  useEffect(() => {
    if (!gameStarted || !isMyTurn || !currentCard) return;
    if (handledCardSignature === currentCardSignature) return;

    if (currentCard.value === "8" && !buddyModalVisible) {
      setBuddyModalVisible(true);
    } else if (currentCard.value === "K" && !ruleModalVisible) {
      setRuleModalVisible(true);
    }
  }, [
    gameStarted,
    isMyTurn,
    currentCard?.value,
    currentCardSignature,
    handledCardSignature,
  ]);

  const currentTurnPlayer = gamePlayers.find(
    (p) => p.id === state?.currentPlayerTurnID
  );
  const isMyTurnForGame = userData?.clerkId === state?.currentPlayerTurnID;

  // Functions for buddy/rule actions
  const chooseBuddy = (buddyId: string) => {
    setHandledCardSignature(currentCardSignature);
    sendGameAction("choose_buddy", { chosen_buddie_id: buddyId });
    setBuddyModalVisible(false);
  };

  const setRule = () => {
    if (newRuleInput.trim() === "") {
      Alert.alert("Rule Empty", "Please enter a rule for the King's Cup!");
      return;
    }
    setHandledCardSignature(currentCardSignature);
    sendGameAction("set_rule", { new_rule: newRuleInput });
    setRuleModalVisible(false);
    setNewRuleInput("");
  };

  // --- RENDER LOGIC ---

  if (!gameStarted && !gameOver) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <MaterialCommunityIcons name="timer-sand" size={80} color="#666" />
        <Text className="text-white font-black text-2xl mt-4">
          GAME NOT STARTED
        </Text>
        <Text className="text-white/50 text-center mt-2">
          Waiting for the host to start the game.
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
          The deck is empty!
        </Text>
        {kingCupDrinker && (
          <Text className="text-orange-500 font-black text-xl mt-4 text-center">
            {kingCupDrinker.username} drinks the King's Cup!
          </Text>
        )}
      </View>
    );
  }

  // Modal for Buddy Selection
  const renderBuddySelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={buddyModalVisible}
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-6 h-[60%]">
          <Text className="text-white font-black text-2xl mb-4 text-center">
            Choose Your Mate!
          </Text>
          <Text className="text-white/70 text-base text-center mb-6">
            When you drink, your buddy drinks. When they drink, you drink!
          </Text>
          <ScrollView className="flex-1">
            <View className="flex-row flex-wrap justify-center gap-4 pb-10">
              {gamePlayers
                .filter((p) => p.id !== userData?.clerkId)
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => chooseBuddy(player.id)}
                    className="w-[45%] bg-white/[0.05] rounded-2xl p-4 items-center border border-white/10 active:bg-white/10"
                  >
                    <View className="w-16 h-16 rounded-full items-center justify-center mb-2 bg-orange-600/20 border-2 border-orange-600/30">
                      <Text className="text-orange-500 font-black text-2xl">
                        {player.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      className="text-white font-bold text-lg text-center"
                      numberOfLines={1}
                    >
                      {player.username}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Modal for Rule Setting
  const renderRuleSettingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={ruleModalVisible}
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-6 h-[60%]">
            <Text className="text-white font-black text-2xl mb-2 text-center">
              Set a New Rule!
            </Text>
            <Text className="text-white/70 text-sm text-center mb-6">
              Pour into the King's Cup! ({kingsInCup}/4 Kings)
            </Text>
            <TextInput
              className="bg-white/10 rounded-xl p-4 text-white text-base mb-6 border border-white/20 min-h-[100px]"
              placeholder="E.g., 'No pointing', 'Drink twice'"
              placeholderTextColor="#999"
              value={newRuleInput}
              onChangeText={setNewRuleInput}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={setRule}
              className="bg-orange-600 py-4 rounded-2xl items-center flex-row justify-center gap-2"
            >
              <Text className="text-black text-lg font-black tracking-widest">
                SET RULE
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // --- GAME BOARD RENDER ---
  return (
    <View className="flex-1 flex-col items-center justify-between py-4 w-full">
      {renderBuddySelectionModal()}
      {renderRuleSettingModal()}

      {/* 1. Turn Indicator (Flex item, top of stack) */}
      {currentTurnPlayer && (
        <View className="bg-white/10 px-6 py-2 rounded-full border border-white/20 mb-2">
          <Text className="text-white font-bold text-base">
            <Text className="text-orange-500">
              {currentTurnPlayer.username}
            </Text>
            's Turn
          </Text>
        </View>
      )}

      {/* 2. Card Display (Middle, responsive) */}
      <View className="flex-1 w-full items-center justify-center max-h-[55%]">
        {!currentCard ? (
          <TouchableOpacity
            disabled={!isMyTurnForGame}
            onPress={() => sendGameAction("draw_card")}
            className={`w-[75%] aspect-[2.5/3.5] bg-orange-600 rounded-2xl border-4 border-white/10 items-center justify-center shadow-xl ${
              isMyTurnForGame ? "active:bg-orange-700" : "opacity-50"
            }`}
          >
            <MaterialCommunityIcons
              name="cards-playing-outline"
              size={width * 0.2}
              color="white"
            />
            <Text className="text-white font-black text-2xl mt-4 tracking-widest">
              DECK
            </Text>
            {isMyTurnForGame ? (
              <Text className="text-white/70 text-sm mt-2">Tap to Draw</Text>
            ) : (
              <Text className="text-white/70 text-xs mt-2 text-center px-2">
                Waiting for {currentTurnPlayer?.username}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="w-[75%] aspect-[2.5/3.5] relative shadow-lg shadow-black">
            <Image
              source={{ uri: currentCard?.imageUrl }}
              className="w-full h-full rounded-2xl"
              resizeMode="contain"
            />
            {currentCard.value === "K" && (
              <View className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-lg border border-white/30">
                <Text className="text-white text-xs font-bold">
                  {kingsInCup}/4 Kings
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 3. Controls & Active Effects (Bottom) */}
      <View className="w-full px-4 flex-col justify-end min-h-[30%]">
        {/* Rule Text Display */}
        {currentCard ? (
          <View className="items-center mb-4 min-h-[60px] justify-center">
            <Text className="text-orange-500 font-black tracking-widest uppercase text-xs mb-1">
              RULE
            </Text>
            <Text className="text-white font-black text-lg text-center leading-6 px-2">
              {currentCard?.rule || "Drink!"}
            </Text>
          </View>
        ) : (
          <View className="min-h-[60px]" />
        )}

        {/* Horizontal Scroll for Buddies & Custom Rules */}
        {(Object.keys(state?.buddies || {}).length > 0 ||
          Object.keys(state?.customRules || {}).length > 0) && (
          <View className="mb-4">
            <Text className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-2 pl-2">
              Rules
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            >
              {/* Render Buddies */}
              {Object.entries(state.buddies || {}).map(
                ([playerID, buddies]) => {
                  const p = gamePlayers.find((pl) => pl.id === playerID);
                  if (!p || !buddies.length) return null;
                  // Use THEME_ORANGE (#ff8c00) for buddies
                  return (
                    <View
                      key={`buddy-${playerID}`}
                      className="flex-row items-center bg-[#ff8c00]/10 border border-[#ff8c00] rounded-xl px-4 py-3 h-14"
                    >
                      <View className="items-center">
                        <Text className="text-[#ff8c00] font-bold text-xs">
                          {p.username}
                        </Text>
                      </View>
                      <View className="mx-2">
                        <MaterialCommunityIcons
                          name="link-variant"
                          size={16}
                          color={THEME_ORANGE}
                        />
                      </View>
                      <View className="items-center">
                        <Text className="text-[#ff8c00] font-bold text-xs">
                          {buddies[0].username}
                        </Text>
                      </View>
                    </View>
                  );
                }
              )}

              {Object.entries(state.customRules || {}).map(
                ([playerID, rules]) => {
                  const p = gamePlayers.find((pl) => pl.id === playerID);

                  return rules.map((rule, index) => (
                    <View
                      key={`rule-${playerID}-${index}`}
                      className="bg-white/[0.07] border border-white/20 rounded-xl px-4 py-2 h-14 justify-center min-w-[120px] max-w-[200px]"
                    >
                      <View className="flex-row items-center mb-0.5">
                        <Text
                          className="text-white/50 text-[10px] font-bold uppercase"
                          numberOfLines={1}
                        >
                          {p?.username}
                        </Text>
                      </View>
                      <Text
                        className="text-white text-xs font-semibold leading-4"
                        numberOfLines={2}
                      >
                        "{rule}"
                      </Text>
                    </View>
                  ));
                }
              )}
            </ScrollView>
          </View>
        )}

        {/* Draw Next Button / Status */}
        {currentCard &&
        !buddyModalVisible &&
        !ruleModalVisible &&
        isMyTurnForGame ? (
          <TouchableOpacity
            onPress={() => sendGameAction("draw_card")}
            className="w-full bg-white/10 border border-white/20 h-12 rounded-full flex-row items-center justify-center active:bg-white/20 mb-2"
          >
            <Text className="text-white font-bold mr-2">Draw Next Card</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              color="white"
              size={16}
            />
          </TouchableOpacity>
        ) : currentCard ? (
          <View className="w-full bg-white/[0.05] border border-white/10 h-12 rounded-full flex-row items-center justify-center opacity-60 mb-2">
            <ActivityIndicator
              size="small"
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white/70 font-semibold text-xs">
              Waiting for {currentPlayerInGame?.username}
            </Text>
          </View>
        ) : null}

        <Text className="text-white/30 font-bold text-center uppercase tracking-widest text-[10px]">
          {cardsRemaining} Cards Remaining
        </Text>
      </View>
    </View>
  );
}
