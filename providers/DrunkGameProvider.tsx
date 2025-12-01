import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { apiService } from "@/api";
import { RoundResult } from "@/types/api.types";

export type ViewStage = "lobby" | "waiting" | "game";

export interface Player {
  id: string;
  username: string;
  isHost: boolean;
}

export interface PublicGame {
  sessionId: string;
  gameType: string;
  host: string;
  players: number;
}

export interface KingsCupCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  rule: string;
  color: string;
  imageUrl: string;
}

export interface KingsCupState {
  currentCard: KingsCupCard | null;
  cardsRemaining: number;
  gameOver: boolean;
}

export interface BurnBookState {
  phase: string;
  questionText: string;
  collectedCount: number;
  voters: { userid: string; username: string };
  winner: string;
  votes: any;
  anonymousAnswers: string[];
  isVoting: boolean;
  roundResults?: RoundResult;
}

export type GameState = KingsCupState | BurnBookState | any;

interface DrunkGameContextType {
  stage: ViewStage;
  sessionId: string;
  isHost: boolean;
  hostName: string;
  gameType: string;
  gameLabel: string;
  players: Player[];
  messages: string[];
  publicGames: PublicGame[];
  loading: boolean;

  gameState: GameState;

  createGame: (gameId: string, gameLabel: string) => Promise<void>;
  joinGame: (sessionId: string, gameType: string, hostName: string) => void;
  joinViaDeepLink: (sid: string) => Promise<void>;
  leaveGame: () => void;
  startGame: () => void;
  sendMessage: (text: string) => void;
  refreshPublicGames: () => Promise<void>;

  // GENERIC ACTION (Replaces drawCard)
  sendGameAction: (actionType: string, payload?: any) => void;
}

const DrunkGameContext = createContext<DrunkGameContextType | undefined>(
  undefined
);

export const DrunkGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [stage, setStage] = useState<ViewStage>("lobby");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [hostName, setHostName] = useState("");

  const [gameType, setGameType] = useState(""); // Track the ID (e.g., "kings-cup")
  const [gameLabel, setGameLabel] = useState(""); // Track label (e.g., "King's Cup")

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [publicGames, setPublicGames] = useState<PublicGame[]>([]);

  const [gameState, setGameState] = useState<GameState>({});

  const ws = useRef<WebSocket | null>(null);

  const getMyUsername = () => {
    return user?.username || user?.firstName || "Guest";
  };

  const refreshPublicGames = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const games = await apiService.getPublicGames(token);
      console.log(games)
      //!TODO: Add the host's username to games
      setPublicGames(games || []);
    } catch (error) {
      console.error("Failed to fetch public games", error);
    }
  };

  useEffect(() => {
    refreshPublicGames();
  }, []);

  const connectSocket = async (sid: string, asHost: boolean) => {
    try {
      if (ws.current) ws.current.close();

      const token = await getToken();
      if (!token) {
        Alert.alert("Auth Error", "Could not get user token");
        return;
      }

      let url = apiService.getWebSocketUrl(sid);
      url = `${url}?token=${token}`;
      console.log(url);

      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        setStage("waiting");
        const joinPayload = JSON.stringify({
          action: "join_room",
          username: getMyUsername(),
          userId: user?.id,
          isHost: asHost,
        });
        socket.send(joinPayload);
      };

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handleWsMessage(data);
        } catch (err) {
          console.log("Raw message:", e.data);
        }
      };

      socket.onerror = (e: any) => {
        Alert.alert("Connection Failed", "Could not connect to game server.");
        setStage("lobby");
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleWsMessage = (data: any) => {
    switch (data.action) {
      case "chat":
        setMessages((prev) => [`${data.sender}: ${data.content}`, ...prev]);
        break;

      case "join_room":
        setMessages((prev) => [`${data.username} joined.`, ...prev]);
        // If the server sends metadata on join, update our state
        if (data.gameType) {
          setGameType(data.gameType);
          // Helper to format label nicely
          const label =
            data.gameType === "kings-cup"
              ? "King's Cup"
              : data.gameType === "mafia"
                ? "Mafia"
                : data.gameType === "burn-book"
                  ? "Burn Book"
                  : "Game";
          setGameLabel(label);
        }
        if (data.hostName) {
          setHostName(data.hostName);
        }
        // ----------------------
        break;

      case "update_player_list":
        setPlayers(data.players);
        break;

      case "start_game":
        setStage("game");
        setMessages((prev) => ["--- GAME STARTED ---", ...prev]);
        break;

      case "game_update":
        setGameState(data.gameState);
        break;

      default:
        console.log("Unknown WS action:", data);
    }
  };

  const createGame = async (gameId: string, label: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await apiService.createDrinkingGame(gameId, token);
      setSessionId(data.sessionId);
      setIsHost(true);
      setHostName(getMyUsername());

      setGameType(gameId); // Save "kings-cup"
      setGameLabel(label); // Save "King's Cup"

      setPlayers([]);
      setGameState({});
      await connectSocket(data.sessionId, true);
    } catch (error) {
      Alert.alert("Error", "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const joinGame = (sid: string, gType: string, host: string) => {
    setSessionId(sid);
    setIsHost(false);
    setHostName(host);

    setGameType(gType); // Save "kings-cup"
    // Find label from constants if needed, or pass it in
    const label =
      gType === "kings-cup"
        ? "King's Cup"
        : gType === "burn-book"
          ? "Burn Book"
          : "Game";
    setGameLabel(label);

    setPlayers([]);
    setGameState({});
    connectSocket(sid, false);
  };


  const joinViaDeepLink = async (sid: string) => {
    if (sessionId === sid) return; // Already in this game

    setLoading(true);
    try {
      // Option A: If you have an API to get game details, call it here.
      // const details = await apiService.getGameDetails(sid);

      // Option B: For now, we join "Blindly" and wait for the WebSocket
      // to tell us what game it is.
      setSessionId(sid);
      setIsHost(false);
      setHostName("Loading..."); // Placeholder
      setGameType("unknown"); // Placeholder
      setGameLabel("Joining..."); // Placeholder

      setPlayers([]);
      setGameState({});

      // Connect!
      await connectSocket(sid, false);
    } catch (error) {
      Alert.alert("Error", "Failed to join via link");
      setLoading(false);
      setStage("lobby");
    }
  };

  const startGame = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ action: "start_game" }));
      setStage("game");
    }
  };

  const sendGameAction = (actionType: string, payload: any = {}) => {
    console.log("sendiong game actrion")
    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          action: "game_action",
          type: actionType, 
          ...payload, // Any extra data needed
        })
      );
    }
  };

  const sendMessage = (text: string) => {
    if (ws.current && text.trim()) {
      ws.current.send(
        JSON.stringify({
          action: "chat",
          sender: getMyUsername(),
          content: text,
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  const leaveGame = () => {
    if (ws.current) ws.current.close();
    setStage("lobby");
    setSessionId("");
    setPlayers([]);
    setMessages([]);
    setGameState({});
    setLoading(false);
    refreshPublicGames();
  };

  return (
    <DrunkGameContext.Provider
      value={{
        stage,
        sessionId,
        isHost,
        hostName,
        gameType,
        gameLabel,
        players,
        messages,
        publicGames,
        loading,
        gameState,
        createGame,
        joinGame,
        joinViaDeepLink,
        leaveGame,
        startGame,
        sendGameAction, 
        sendMessage,
        refreshPublicGames,
      }}
    >
      {children}
    </DrunkGameContext.Provider>
  );
};

export const useDrunkGame = () => {
  const context = useContext(DrunkGameContext);
  if (!context) {
    throw new Error("useDrunkGame must be used within a DrunkGameProvider");
  }
  return context;
};
