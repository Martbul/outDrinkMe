import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { usePostHog } from "posthog-react-native";
import { apiService } from "@/api";
import type {
  FuncMember,
  FuncMetadata,
  UploadJob,
  FuncDataResponse, // Added this import
} from "../types/api.types";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

interface FunctionContextType {
  isPartOfActiveFunc: boolean;
  funcMembers: FuncMember[];
  funcImagesIds: string[];
  funcMetaData: FuncMetadata | null;
  uploadQueue: UploadJob[];

  refreshFuncData: (id?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  createFunc: () => Promise<void>;
  addImages: (imageUrls: string[]) => Promise<void>;
  leaveFunc: () => Promise<void>;

  isFuncLoading: boolean;
  isInitialLoading: boolean;
  funcError: string | null;
}

const FunctionContext = createContext<FunctionContextType | undefined>(
  undefined
);

export function FunctionProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const posthog = usePostHog();

  // --- State ---
  const [uploadQueue, setUploadQueue] = useState<UploadJob[]>([]);
  const [isPartOfActiveFunc, setIsPartOfActiveFunc] = useState<boolean>(false);
  const [funcMembers, setFuncMembers] = useState<FuncMember[]>([]);
  const [funcImagesIds, setFuncImagesIds] = useState<string[]>([]);
  const [funcMetaData, setFuncMetaData] = useState<FuncMetadata | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFuncLoading, setIsFuncLoading] = useState(false);
  const [funcError, setFuncError] = useState<string | null>(null);

  const hasInitialized = useRef(false);
  const isProcessing = useRef(false);

  const updateJobStatus = (
    id: string,
    status: UploadJob["status"],
    progress: number
  ) => {
    setUploadQueue((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status, progress } : job))
    );
  };

  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      actionName: string
    ): Promise<T | null> => {
      try {
        setIsFuncLoading(true);
        const result = await apiCall();
        return result;
      } catch (err: any) {
        setFuncError(err.message);
        posthog?.capture("api_error", {
          action: actionName,
          error: err.message,
        });
        return null;
      } finally {
        setIsFuncLoading(false);
      }
    },
    [posthog]
  );

  const refreshFuncData = useCallback(
    async (id?: string) => {
      if (!isSignedIn) return;
      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(async () => {
        const data: FuncDataResponse = id
          ? await apiService.getFuncData(token, id)
          : await apiService.getActiveSession(token);

        setIsPartOfActiveFunc(data.isPartOfActiveFunc);
        setFuncMembers(data.funcMembers || []);
        setFuncImagesIds(data.funcImageIds || []);
        setFuncMetaData(data.funcMetadata || null);
      }, "refresh_func_data");
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const checkIfFinished = useCallback(() => {
    const activeJobs = uploadQueue.filter(
      (j) => j.status === "pending" || j.status === "uploading"
    );
    // If no more jobs are pending/uploading but we had jobs in the queue
    if (activeJobs.length === 0 && uploadQueue.length > 0) {
      const completedCount = uploadQueue.filter(
        (j) => j.status === "completed"
      ).length;

      Notifications.scheduleNotificationAsync({
        content: {
          title: "Function Updated! 📸",
          body: `Successfully uploaded ${completedCount} photos to the dump.`,
        },
        trigger: null,
      });

      refreshFuncData();
      // Clear queue after 10 seconds to hide the progress bar in UI
      setTimeout(() => setUploadQueue([]), 10000);
    }
  }, [uploadQueue, refreshFuncData]);

  useEffect(() => {
    const processNext = async () => {
      const nextJob = uploadQueue.find((j) => j.status === "pending");
      if (nextJob && !isProcessing.current) {
        isProcessing.current = true;
        await processUpload(nextJob);
        isProcessing.current = false;
      }
    };
    processNext();
    // We check if finished every time the queue state changes
    if (uploadQueue.length > 0) {
      checkIfFinished();
    }
  }, [uploadQueue, checkIfFinished]);

  const processUpload = async (job: UploadJob) => {
    const token = await getToken();
    const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!token || !funcMetaData?.sessionID || !CLOUD_NAME || !PRESET) {
      updateJobStatus(job.id, "failed", 0);
      return;
    }

    try {
      updateJobStatus(job.id, "uploading", 0);

      // 1. High-Quality Manipulation
      const manipulated = await ImageManipulator.manipulateAsync(
        job.uri,
        [{ resize: { width: 2000 } }],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // 2. Background Upload to Cloudinary
      const uploadTask = FileSystem.createUploadTask(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        manipulated.uri,
        {
          httpMethod: "POST",
    uploadType: 0, 
          parameters: {
            upload_preset: PRESET,
            folder: "func-images",
          },
        },
        (p) => {
          if (p.totalBytesExpectedToSend > 0) {
            const progress = p.totalBytesSent / p.totalBytesExpectedToSend;
            updateJobStatus(job.id, "uploading", progress);
          }
        }
      );

      const response = await uploadTask.uploadAsync();

      if (!response || response.status !== 200) {
        throw new Error(`Cloudinary Error: ${response?.status}`);
      }

      const cloudinaryData = JSON.parse(response.body);

      await apiService.uploadImages(token, funcMetaData.sessionID, [
        cloudinaryData.secure_url,
      ]);

      updateJobStatus(job.id, "completed", 1);
      posthog?.capture("func_image_uploaded", {
        sessionId: funcMetaData.sessionID,
      });
    } catch (err) {
      console.error("Critical Upload Error:", err);
      updateJobStatus(job.id, "failed", 0);
    }
  };

  const refreshAll = useCallback(async () => {
    if (!isSignedIn) {
      setIsInitialLoading(false);
      return;
    }
    await refreshFuncData();
    setIsInitialLoading(false);
  }, [isSignedIn, refreshFuncData]);

  const createFunc = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    await withLoadingAndError(async () => {
      const data = await apiService.createFunction(token);
      setIsPartOfActiveFunc(true);
      await refreshFuncData(data.sessionID);
      posthog?.capture("func_created", { sessionId: data.sessionID });
    }, "create_func");
  }, [getToken, withLoadingAndError, refreshFuncData, posthog]);

  const addImages = useCallback(
    async (imageUrls: string[]) => {
      const newJobs: UploadJob[] = imageUrls.map((uri) => ({
        id: Math.random().toString(36).substring(7),
        uri,
        progress: 0,
        status: "pending",
      }));

      setUploadQueue((prev) => [...prev, ...newJobs]);
      posthog?.capture("func_images_queued", { count: imageUrls.length });
    },
    [posthog]
  );

  const leaveFunc = useCallback(async () => {
    const token = await getToken();
    if (!token || !funcMetaData?.sessionID) return;

    await withLoadingAndError(async () => {
      await apiService.leaveFunction(token, funcMetaData.sessionID);
      setIsPartOfActiveFunc(false);
      setFuncMetaData(null);
      setFuncImagesIds([]);
      setFuncMembers([]);
    }, "leave_func");
  }, [getToken, funcMetaData, withLoadingAndError]);

  useEffect(() => {
    if (isSignedIn && !hasInitialized.current) {
      hasInitialized.current = true;
      refreshAll();
    }
  }, [isSignedIn, refreshAll]);

  return (
    <FunctionContext.Provider
      value={{
        isPartOfActiveFunc,
        funcMembers,
        funcImagesIds,
        funcMetaData,
        uploadQueue,
        refreshFuncData,
        refreshAll,
        createFunc,
        addImages,
        leaveFunc,
        isFuncLoading,
        isInitialLoading,
        funcError,
      }}
    >
      {children}
    </FunctionContext.Provider>
  );
}

export function useFunc() {
  const context = useContext(FunctionContext);
  if (!context) throw new Error("useFunc must be used within FunctionProvider");
  return context;
}
