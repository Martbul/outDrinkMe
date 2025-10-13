import { apiService } from "@/api";
import { UserData, UserDataContextType } from "@/types/user";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

const UserDataContext = createContext<any | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUsers, setFoundUsers] = useState<UserData[] | []>([]);
  const loadingRef = useRef(false);

  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiCall();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("API Error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !user?.id || loadingRef.current) {
        if (!isSignedIn) {
          setUserData(null);
          setError(null);
        }
        return;
      }

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        console.log("Loading user data for:", user.id);

        const token = await getToken();
        if (!token) {
          console.log("No token available");
          return;
        }

        let fetchedUserData: UserData;

        try {
          fetchedUserData = await apiService.fetchUser(token);
          // console.log("User found:", fetchedUserData.id);
        } catch (error: any) {
          if (error.message === "USER_NOT_FOUND") {
            console.log("User not found, creating new user");

            const newUserData = {
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || "",
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              imageUrl:
                user.imageUrl ||
                "https://48htuluf59.ufs.sh/f/1NvBfFppWcZeWF2WCCi3zDay6IgjQLVNYHEhKiCJ8OeGwTon",
            };

            fetchedUserData = await apiService.createUser(newUserData, token);
            console.log("New user created:", fetchedUserData);
          } else {
            console.log("errr: " + error);
            throw error;
          }
        }

        setUserData(fetchedUserData);
        console.log("User data loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadUserData();
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isSignedIn) {
      setUserData(null);
      setError(null);
    }
  }, [isSignedIn]);

  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    const token = await getToken();
    if (!token) return;

    await withLoadingAndError(
      () => apiService.fetchUser(token),
      (data) => setUserData(data)
    );
  }, [user?.id, getToken, withLoadingAndError]);

  
  const searchUsers = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim()) {
        Alert.alert("Error", "Please enter a username to search");
        return;
      }

      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      // Clear previous results when starting a new search
      setFoundUsers([]);

      await withLoadingAndError(
        () => apiService.searchUsers(searchQuery, token),
        (foundUsers:UserData[]) => setFoundUsers(foundUsers)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const contextValue: any = useMemo(
    () => ({
      userData,

      isLoading,
      error,

      setUserData,
      refreshUserData,

      searchUsers,
    }),
    [userData, isLoading, error, setUserData, refreshUserData, searchUsers]
  );

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
