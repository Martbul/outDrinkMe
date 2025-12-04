import { useDrunkGame } from "@/providers/DrunkGameProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RenderBurnBookBoard() {
  const { stage, isHost, gameState, sendGameAction, startGame, backToWaiting } =
    useDrunkGame();

  const [inputMsg, setInputMsg] = useState("");
  const [burnBookuestionText, setBurnBookuestionText] = useState("");
  const [burnBookUserSubmissionCount, setBurnBookUserSubmissionCount] =
    useState(0);

  useEffect(() => {
    if (stage === "lobby") {
      setBurnBookuestionText("");
      setBurnBookUserSubmissionCount(0);
    }
  }, [stage]);

  const state = gameState as any;
  const phase = state?.phase || "collecting";

  // Common State
  // FIX: Sort the players so they don't shuffle when the server sends an update
  const rawPlayers = state?.players || [];
  const players = [...rawPlayers].sort((a: any, b: any) => {
    const nameA = a.username || a.name || "";
    const nameB = b.username || b.name || "";
    return nameA.localeCompare(nameB);
  });

  const collectedCount = state?.collectedCount || 0;

  // Voting Specific State
  const currentQuestionText = state?.questionText || null;
  const currentNumber = state?.currentNumber || 1;
  const totalQuestions = state?.totalQuestions || 1;
  const [timeLeft, setTimeLeft] = useState(30);

  // Results Specific State
  const roundResults = state?.roundResults || { winnerId: "", results: [] };

  const MAX_QUESTIONS = 3;

  // 2. Reset timer whenever the server indicates a new question number
  useEffect(() => {
    setTimeLeft(30);
  }, [currentNumber, phase]); // Added phase dependency to reset if we re-enter voting

  // 3. Countdown logic
  useEffect(() => {
    if (phase !== "voting") return;

    // If the server says we are done, stop counting locally
    if (state?.hasVoted && timeLeft > 0) {
      // Optional: You could keep counting or pause.
      // Usually, it's better to keep counting to show how much time
      // OTHER players have left, or just let it run.
    }

    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, phase]);

  const timerColor = timeLeft <= 10 ? "#ef4444" : "#EA580C";

  // --- ACTIONS ---
  const handleSubmitQuestion = () => {
    if (!burnBookuestionText.trim()) return;
    if (burnBookUserSubmissionCount >= MAX_QUESTIONS) return;

    sendGameAction("submit_question", { payload: burnBookuestionText });
    setInputMsg("");
    setBurnBookuestionText("");
    setBurnBookUserSubmissionCount((prev) => prev + 1);
  };

  const handleVote = (targetPlayerId: string) => {
    sendGameAction("vote_player", { targetId: targetPlayerId });
  };

  return (
    <View className="flex-1 p-5">
      {/* --- PHASE 1: COLLECTING --- */}
      {phase === "collecting" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-orange-500/10 rounded-full items-center justify-center mb-4 border border-orange-500/30">
              <MaterialCommunityIcons name="fire" size={40} color="#EA580C" />
            </View>
            <Text className="text-white font-black text-2xl tracking-wider">
              BURN BOOK
            </Text>
            <Text className="text-white/50 text-center mt-2 text-xs px-4">
              Write anonymous questions. Voting happens fast. {"\n"}
              Results are revealed at the end.
            </Text>
          </View>

          {burnBookUserSubmissionCount < MAX_QUESTIONS ? (
            <>
              <View className="bg-white/10 rounded-2xl border border-white/10 p-4 mb-4">
                <TextInput
                  className="text-white text-lg font-medium min-h-[100px]"
                  placeholder="e.g., Who is most likely to join a cult?"
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
                    ? "bg-orange-600 active:bg-orange-700"
                    : "bg-white/5"
                }`}
              >
                <Text
                  className={`font-black tracking-widest ${burnBookuestionText.length > 0 ? "text-black" : "text-white/20"}`}
                >
                  ADD TO BOOK
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="bg-white/5 p-6 rounded-2xl border border-white/10 items-center justify-center min-h-[150px]">
              <MaterialCommunityIcons
                name="check-circle"
                size={40}
                color="#ff8c00"
              />
              <Text className="text-white font-bold text-lg mt-2 text-center">
                Complete
              </Text>
              <Text className="text-white/40 text-center mt-1">
                Waiting for host to start the voting
              </Text>
            </View>
          )}

          <View className="mt-8 items-center bg-white/5 p-4 rounded-xl">
            <Text className="text-white/40 font-bold text-xs uppercase tracking-widest mb-1">
              Total Questions
            </Text>
            <Text className="text-white font-black text-3xl">
              {collectedCount}
            </Text>
          </View>

          {isHost && (
            <View className="mt-auto border-t border-white/10 pt-6 px-4 w-full pb-8">
              <TouchableOpacity
                onPress={() => sendGameAction("start_voting")}
                activeOpacity={0.9}
                className="bg-orange-600 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-600/40 border-t border-white/20"
              >
                <Text className="text-black font-black tracking-widest uppercase text-md ml-2">
                  Start Voting
                </Text>
              </TouchableOpacity>

              <Text className="text-white/30 text-xs mt-3 text-center font-medium">
                Starts a 30s timer per question automatically.
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      {phase === "voting" && (
        <View className="flex-1">
          {/* Phase Header */}
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-white/50 font-bold text-xs tracking-widest">
              QUESTION {currentNumber} OF {totalQuestions}
            </Text>

            {/* Timer View */}
            <View
              className="px-2 py-1 rounded border flex-row items-center"
              style={{
                backgroundColor:
                  timeLeft <= 10
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(249, 115, 22, 0.2)",
                borderColor:
                  timeLeft <= 10
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(249, 115, 22, 0.3)",
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color={timerColor}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{ color: timerColor }}
                className="text-xs font-bold min-w-[20px] text-center"
              >
                {timeLeft}s
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl mb-6 min-h-[140px] justify-center items-center relative overflow-hidden">
              <MaterialCommunityIcons
                name="format-quote-open"
                size={40}
                color="rgba(234, 88, 12, 0.2)"
                style={{ position: "absolute", top: 10, left: 10 }}
              />
              <Text className="text-white font-black text-xl text-center leading-8 shadow-lg">
                {currentQuestionText || "Loading..."}
              </Text>
            </View>

            <Text className="text-white/40 font-bold text-xs text-center uppercase tracking-widest mb-4">
              Vote
            </Text>

            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {players.map((player: any) => {
                const isSelected = state?.myVote === player.id;
                const displayName = player.username || player.name || "Unknown";
                const initial = displayName[0] || "?";

                return (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => handleVote(player.id)}
                    disabled={state?.hasVoted}
                    className={`w-[45%] aspect-square rounded-2xl items-center justify-center mb-2 border-2 ${
                      isSelected
                        ? "bg-orange-600 border-orange-400"
                        : "bg-white/5 border-white/5 active:bg-white/10"
                    } ${state?.hasVoted && !isSelected ? "opacity-30" : "opacity-100"}`}
                  >
                    <View
                      className={`w-12 h-12 rounded-full mb-2 items-center justify-center ${isSelected ? "bg-white/20" : "bg-white/10"}`}
                    >
                      <Text className="text-white font-bold text-lg">
                        {initial}
                      </Text>
                    </View>
                    <Text
                      className="text-white font-bold text-center px-2"
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="py-4 items-center">
            {state?.hasVoted ? (
              <View className="flex-row items-center">
                <ActivityIndicator
                  color="#EA580C"
                  size="small"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white/50 text-sm">
                  Waiting for others to vote...
                </Text>
              </View>
            ) : (
              <Text className="text-orange-500 text-sm font-bold">
                Tap a player quickly!
              </Text>
            )}
          </View>
        </View>
      )}

      {/* --- PHASE 3: RESULTS (UPDATED FOR TIES) --- */}
      {phase === "results" && (
        <View className="flex-1 w-full relative">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 100,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* QUESTION QUOTE CARD */}
            <View className="w-full bg-orange-500/5 border border-orange-500/20 p-8 rounded-3xl mb-8 relative overflow-hidden mt-6">
              <MaterialCommunityIcons
                name="format-quote-open"
                size={80}
                color="#EA580C"
                style={{
                  position: "absolute",
                  top: -15,
                  left: -10,
                  opacity: 0.1,
                  transform: [{ rotate: "10deg" }],
                }}
              />
              <MaterialCommunityIcons
                name="format-quote-close"
                size={80}
                color="#EA580C"
                style={{
                  position: "absolute",
                  bottom: -15,
                  right: -10,
                  opacity: 0.1,
                  transform: [{ rotate: "10deg" }],
                }}
              />
              <Text className="text-white font-black text-2xl text-center leading-9 italic tracking-wide">
                "{currentQuestionText}"
              </Text>
            </View>

            {(() => {
              // 1. Extract Data
              const resultList = roundResults.results || [];

              // 2. Determine Max Votes
              const maxVotes = resultList.length > 0 ? resultList[0].votes : 0;

              // 3. Find ALL winners (handle ties)
              const tiedWinners = resultList.filter(
                (r: any) => r.votes === maxVotes && r.votes > 0
              );

              // If nobody voted (maxVotes 0), handle gracefully
              const hasVotes = maxVotes > 0;

              // Map winners to player data
              const winningPlayers = tiedWinners.map((w: any) => {
                const p = players.find((player: any) => player.id === w.userId);
                return {
                  id: w.userId,
                  votes: w.votes,
                  name: p?.username || p?.name || "Unknown",
                  initial: (p?.username || p?.name || "?")[0]?.toUpperCase(),
                };
              });

              // Create display string (e.g. "Alice & Bob")
              const winnerNamesString = winningPlayers
                .map((w: any) => w.name)
                .join(" & ");

              return (
                <View className="w-full items-center">
                  <Text className="text-orange-500 font-black tracking-[0.2em] text-xs mb-6 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    THE GROUP VOTED
                  </Text>

                  {/* --- WINNER HERO SECTION (Handles Single or Multiple) --- */}
                  <View className="flex-row flex-wrap justify-center gap-4 mb-2">
                    {hasVotes ? (
                      winningPlayers.map((winner: any) => (
                        <View key={winner.id} className="items-center relative">
                          <View className="w-28 h-28 rounded-full bg-gradient-to-b from-orange-500 to-red-600 items-center justify-center border-4 border-white/10 shadow-[0_0_40px_rgba(234,88,12,0.6)]">
                            <Text className="text-white font-black text-5xl">
                              {winner.initial}
                            </Text>
                          </View>
                          {/* Badge for each winner */}
                          <View className="absolute -bottom-3 bg-white px-3 py-1 rounded-full shadow-lg z-10">
                            <Text className="text-black font-black text-[10px] tracking-widest">
                              VICTIM
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className="w-28 h-28 rounded-full bg-gray-700 items-center justify-center border-4 border-white/10">
                        <MaterialCommunityIcons
                          name="ghost"
                          size={40}
                          color="white"
                        />
                      </View>
                    )}
                  </View>

                  <Text className="text-white font-black text-3xl mt-6 text-center px-4 leading-tight">
                    {hasVotes ? winnerNamesString : "Nobody"}
                  </Text>

                  <Text className="text-white/50 text-sm mb-8 mt-1">
                    {hasVotes
                      ? `received ${maxVotes} vote${maxVotes !== 1 ? "s" : ""}`
                      : "No votes cast"}
                  </Text>

                  {hasVotes && (
                    <View className="w-full bg-orange-500/20 border border-orange-500/40 p-4 rounded-2xl items-center flex-row justify-center gap-3 mb-8">
                      <MaterialCommunityIcons
                        name="glass-mug-variant"
                        size={28}
                        color="#EA580C"
                      />
                      <Text className="text-orange-600 font-black text-xl uppercase tracking-widest">
                        Drink!
                      </Text>
                    </View>
                  )}

                  {/* --- VOTE BREAKDOWN LIST --- */}
                  <View className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4 border-b border-white/[0.05] pb-2">
                      Vote Breakdown
                    </Text>

                    {resultList.map((item: any) => {
                      const playerInfo = players.find(
                        (p: any) => p.id === item.userId
                      );
                      const name =
                        playerInfo?.username || playerInfo?.name || "Unknown";

                      const count = item.votes;
                      const percentage =
                        maxVotes > 0 ? (count / maxVotes) * 100 : 0;

                      // Check if this user is ONE of the winners
                      const isWinner = count === maxVotes && count > 0;

                      return (
                        <View key={item.userId} className="mb-4">
                          <View className="flex-row items-center justify-between mb-1">
                            <View className="flex-row items-center gap-2">
                              <Text
                                className={`font-bold text-sm ${
                                  isWinner ? "text-orange-500" : "text-white"
                                }`}
                              >
                                {name}
                              </Text>
                              {isWinner && (
                                <MaterialCommunityIcons
                                  name="crown"
                                  size={12}
                                  color="#f97316"
                                />
                              )}
                            </View>
                            <Text className="text-white/50 text-xs font-mono">
                              {count}
                            </Text>
                          </View>

                          <View className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                            <View
                              className={`h-full rounded-full ${
                                isWinner ? "bg-orange-500" : "bg-white/20"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}
          </ScrollView>

          {isHost && (
            <View className="absolute bottom-0 w-full px-4 pb-8 bg-black/50 pt-4">
              <TouchableOpacity
                onPress={() => sendGameAction("next_reveal")}
                className="bg-white w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg active:bg-gray-200"
              >
                <Text className="text-black font-black text-sm tracking-widest mr-2 uppercase">
                  Next Victim
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  color="black"
                  size={18}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* --- PHASE 4: GAME OVER --- */}
      {phase === "game_over" && (
        <View className="flex-1 justify-center items-center px-6">
          {/* 1. Icon with a glow effect background */}
          <View className="w-24 h-24 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/20">
            <MaterialCommunityIcons name="fire-off" size={48} color="#ff8c00" />
          </View>

          {/* 2. Text Content */}
          <Text className="text-white font-black text-3xl text-center mb-2">
            The Book is Closed
          </Text>
          <Text className="text-white/40 text-center text-base mb-12 px-4">
            This session has ended. Would you like to start a new journey or
            return to the lobby?
          </Text>

          <View className="w-full gap-4">
            <TouchableOpacity
              onPress={() => backToWaiting()}
              className="bg-white px-8 py-4 rounded-full shadow-lg items-center"
            >
              <Text className="text-black font-black tracking-widest">
                PLAY AGAIN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- WAIT PHASE --- */}
      {phase === "results_wait" && (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6">
            <MaterialCommunityIcons
              name="timer-sand-complete"
              size={50}
              color="#EA580C"
            />
          </View>
          <Text className="text-white font-black text-3xl mt-4 text-center">
            VOTING CLOSED
          </Text>
          <Text className="text-white/50 text-center mt-2 mb-8 px-4 leading-6">
            The questions have been answered.{"\n"}It is time to reveal the
            victims.
          </Text>

          {isHost ? (
            <TouchableOpacity
              onPress={() => sendGameAction("next_reveal")}
              className="bg-orange-600 w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg"
            >
              <Text className="text-black font-black text-lg mr-2">
                Start The Reveal
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-white/10 px-6 py-3 rounded-full">
              <Text className="text-white/70 font-bold">
                Waiting for Host...
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
