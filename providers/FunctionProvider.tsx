// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   ReactNode,
// } from "react";
// import type {
//   FuncMember,
//   FuncMetadata,
//   UploadJob,
//   FuncDataResponse,
// } from "../types/api.types";
// import { useAuth } from "@clerk/clerk-expo";
// import { usePostHog } from "posthog-react-native";
// import { apiService } from "@/api";
// import * as FileSystem from "expo-file-system/legacy";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as Notifications from "expo-notifications";

// interface FunctionContextType {
//   isPartOfActiveFunc: boolean;
//   funcMembers: FuncMember[];
//   funcImagesIds: string[];
//   funcMetaData: FuncMetadata | null;
//   uploadQueue: UploadJob[];

//   refreshFuncData: (id?: string) => Promise<void>;
//   refreshAll: () => Promise<void>;
//   createFunc: () => Promise<void>;
//   addImages: (imageUrls: string[]) => Promise<void>;
//   deleteImages: (imageUrls: string[]) => Promise<void>;
//   joinFunc: (inviteCode: string) => Promise<boolean>;
//   leaveFunc: () => Promise<void>;

//   isFuncLoading: boolean;
//   isInitialLoading: boolean;
//   funcError: string | null;
// }

// const FunctionContext = createContext<FunctionContextType | undefined>(
//   undefined
// );

// export function FunctionProvider({ children }: { children: ReactNode }) {
//   const { getToken, isSignedIn } = useAuth();
//   const posthog = usePostHog();

//   const [uploadQueue, setUploadQueue] = useState<UploadJob[]>([]);
//   const [isPartOfActiveFunc, setIsPartOfActiveFunc] = useState<boolean>(false);
//   const [funcMembers, setFuncMembers] = useState<FuncMember[]>([]);
//   const [funcImagesIds, setFuncImagesIds] = useState<string[]>([]);
//   const [funcMetaData, setFuncMetaData] = useState<FuncMetadata | null>(null);

//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isFuncLoading, setIsFuncLoading] = useState(false);
//   const [funcError, setFuncError] = useState<string | null>(null);

//   const hasInitialized = useRef(false);
//   const isProcessing = useRef(false);
//   const hasNotified = useRef(false);
//   const metaDataRef = useRef<FuncMetadata | null>(null);

//   useEffect(() => {
//     metaDataRef.current = funcMetaData;
//   }, [funcMetaData]);

//   const updateJobStatus = (
//     id: string,
//     status: UploadJob["status"],
//     progress: number
//   ) => {
//     setUploadQueue((prev) =>
//       prev.map((job) => (job.id === id ? { ...job, status, progress } : job))
//     );
//   };

//   const withLoadingAndError = useCallback(
//     async <T,>(
//       apiCall: () => Promise<T>,
//       actionName: string
//     ): Promise<T | null> => {
//       try {
//         setIsFuncLoading(true);
//         const result = await apiCall();
//         return result;
//       } catch (err: any) {
//         setFuncError(err.message);
//         posthog?.capture("api_error", {
//           action: actionName,
//           error: err.message,
//         });
//         return null;
//       } finally {
//         setIsFuncLoading(false);
//       }
//     },
//     [posthog]
//   );

//   const refreshFuncData = useCallback(
//     async (id?: string) => {
//       if (!isSignedIn) return;
//       const token = await getToken();
//       if (!token) return;

//       await withLoadingAndError(async () => {
//         const data: FuncDataResponse = id
//           ? await apiService.getFuncData(token, id)
//           : await apiService.getActiveSession(token);

//         setIsPartOfActiveFunc(data.isPartOfActiveFunc);
//         setFuncMembers(data.funcMembers || []);
//         setFuncImagesIds(data.funcImageIds || []);
//         setFuncMetaData(data.funcMetadata || null);
//       }, "refresh_func_data");
//     },
//     [isSignedIn, getToken, withLoadingAndError]
//   );

//   const processUpload = useCallback(
//     async (job: UploadJob) => {
//       const token = await getToken();
//       const CLOUDINARY_CLOUD_NAME =
//         process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
//       const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

//       const currentSessionId = metaDataRef.current?.sessionID;

//       if (!token || !currentSessionId || !CLOUDINARY_CLOUD_NAME || !PRESET) {
//         console.error("Missing Config:", {
//           token: !!token,
//           sessionId: currentSessionId,
//           cloud: !!CLOUDINARY_CLOUD_NAME,
//         });
//         updateJobStatus(job.id, "failed", 0);
//         return;
//       }

//       try {
//         updateJobStatus(job.id, "uploading", 0);

//         const manipulated = await ImageManipulator.manipulateAsync(
//           job.uri,
//           [],
//           {
//             compress: 1,
//             format: ImageManipulator.SaveFormat.JPEG,
//           }
//         );

//         const uploadTask = FileSystem.createUploadTask(
//           `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
//           manipulated.uri,
//           {
//             httpMethod: "POST",
//             uploadType: FileSystem.FileSystemUploadType.MULTIPART,
//             fieldName: "file",
//             parameters: {
//               upload_preset: PRESET,
//               folder: "func-images",
//             },
//           },
//           (p) => {
//             if (p.totalBytesExpectedToSend > 0) {
//               const progress = p.totalBytesSent / p.totalBytesExpectedToSend;
//               updateJobStatus(job.id, "uploading", progress);
//             }
//           }
//         );

//         const response = await uploadTask.uploadAsync();

//         if (!response || response.status !== 200) {
//           throw new Error(
//             `Cloudinary Error: ${response?.status} - ${response?.body}`
//           );
//         }

//         const cloudinaryData = JSON.parse(response.body);

//         await apiService.uploadImages(token, currentSessionId, [
//           cloudinaryData.secure_url,
//         ]);

//         updateJobStatus(job.id, "completed", 1);
//         posthog?.capture("func_image_uploaded", {
//           sessionId: currentSessionId,
//         });
//       } catch (err) {
//         console.error("Upload Job Failed:", err);
//         updateJobStatus(job.id, "failed", 0);
//       }
//     },
//     [getToken, posthog]
//   );

//   useEffect(() => {
//     const processQueue = async () => {
//       const pendingJob = uploadQueue.find((j) => j.status === "pending");
//       const activeJobs = uploadQueue.filter(
//         (j) => j.status === "pending" || j.status === "uploading"
//       );

//       if (activeJobs.length > 0) {
//         hasNotified.current = false;

//         if (pendingJob && !isProcessing.current) {
//           isProcessing.current = true;
//           await processUpload(pendingJob);
//           isProcessing.current = false;
//         }
//       } else if (uploadQueue.length > 0 && activeJobs.length === 0) {
//         if (!hasNotified.current) {
//           hasNotified.current = true;

//           const completedCount = uploadQueue.filter(
//             (j) => j.status === "completed"
//           ).length;

//           if (completedCount > 0) {
//             Notifications.scheduleNotificationAsync({
//               content: {
//                 title: "Function Updated",
//                 body: `Successfully uploaded ${completedCount} photos.`,
//               },
//               trigger: null,
//             });
//             refreshFuncData();
//           }

//           setTimeout(() => {
//             setUploadQueue([]);
//             hasNotified.current = false;
//           }, 5000);
//         }
//       }
//     };

//     processQueue();
//   }, [uploadQueue, processUpload, refreshFuncData]);

//   const refreshAll = useCallback(async () => {
//     if (!isSignedIn) {
//       setIsInitialLoading(false);
//       return;
//     }
//     await refreshFuncData();
//     setIsInitialLoading(false);
//   }, [isSignedIn, refreshFuncData]);

//   const createFunc = useCallback(async () => {
//     const token = await getToken();
//     if (!token) return;

//     await withLoadingAndError(async () => {
//       const data = await apiService.createFunction(token);
//       setIsPartOfActiveFunc(true);
//       await refreshFuncData(data.sessionID);
//       posthog?.capture("func_created", { sessionId: data.sessionID });
//     }, "create_func");
//   }, [getToken, withLoadingAndError, refreshFuncData, posthog]);

//   const addImages = useCallback(
//     async (imageUrls: string[]) => {
//       if (!metaDataRef.current?.sessionID) {
//         console.warn("Cannot upload: No active session ID found.");
//         return;
//       }

//       const newJobs: UploadJob[] = imageUrls.map((uri) => ({
//         id: Math.random().toString(36).substring(7),
//         uri,
//         progress: 0,
//         status: "pending",
//       }));

//       hasNotified.current = false;
//       setUploadQueue((prev) => [...prev, ...newJobs]);
//       posthog?.capture("func_images_queued", { count: imageUrls.length });
//     },
//     [posthog]
//   );

//   const deleteImages = useCallback(
//     async (imageUrls: string[]) => {
//       const token = await getToken();
//       if (!token || !funcMetaData?.sessionID) return;

//       if (!metaDataRef.current?.sessionID) {
//         console.warn("Cannot delete: No active session ID found.");
//         return;
//       }
//       await withLoadingAndError(async () => {
//         await apiService.deleteImages(
//           token,
//           imageUrls,
//           funcMetaData?.sessionID
//         );
//       }, "delete_images");
//     },
//     [funcMetaData?.sessionID, getToken, withLoadingAndError]
//   );

//   const joinFunc = useCallback(
//     async (inviteCode: string): Promise<boolean> => {
//       const token = await getToken();
//       if (!token) return false;

//       const result = await withLoadingAndError(async () => {
//         const response = await apiService.joinFunction(token, inviteCode);

//         await refreshFuncData(response?.funcId);

//         posthog?.capture("func_joined", { inviteCode });
//         return true;
//       }, "join_func");

//       return !!result;
//     },
//     [posthog, getToken, withLoadingAndError, refreshFuncData]
//   );

//   const leaveFunc = useCallback(async () => {
//     const token = await getToken();
//     if (!token || !funcMetaData?.sessionID) return;

//     await withLoadingAndError(async () => {
//       await apiService.leaveFunction(token, funcMetaData.sessionID);
//       setIsPartOfActiveFunc(false);
//       setFuncMetaData(null);
//       setFuncImagesIds([]);
//       setFuncMembers([]);
//     }, "leave_func");
//   }, [getToken, funcMetaData, withLoadingAndError]);

//   useEffect(() => {
//     if (isSignedIn && !hasInitialized.current) {
//       hasInitialized.current = true;
//       refreshAll();
//     }
//   }, [isSignedIn, refreshAll]);

//   return (
//     <FunctionContext.Provider
//       value={{
//         isPartOfActiveFunc,
//         funcMembers,
//         funcImagesIds,
//         funcMetaData,
//         uploadQueue,
//         refreshFuncData,
//         refreshAll,
//         createFunc,
//         addImages,
//         deleteImages,
//         joinFunc,
//         leaveFunc,
//         isFuncLoading,
//         isInitialLoading,
//         funcError,
//       }}
//     >
//       {children}
//     </FunctionContext.Provider>
//   );
// }

// export function useFunc() {
//   const context = useContext(FunctionContext);
//   if (!context) throw new Error("useFunc must be used within FunctionProvider");
//   return context;
// }

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import type { FuncMember, FuncMetadata, UploadJob, FuncDataResponse } from "../types/api.types";
import { useAuth } from "@clerk/clerk-expo";
import { usePostHog } from "posthog-react-native";
import { apiService } from "@/api";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Notifications from "expo-notifications";

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
  deleteImages: (imageUrls: string[]) => Promise<void>;
  joinFunc: (inviteCode: string) => Promise<boolean>;
  leaveFunc: () => Promise<void>;

  isFuncLoading: boolean;
  isInitialLoading: boolean;
  funcError: string | null;
}

const FunctionContext = createContext<FunctionContextType | undefined>(undefined);

export function FunctionProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const posthog = usePostHog();

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
  const hasNotified = useRef(false);
  const metaDataRef = useRef<FuncMetadata | null>(null);

  useEffect(() => {
    metaDataRef.current = funcMetaData;
  }, [funcMetaData]);

  const updateJobStatus = (id: string, status: UploadJob["status"], progress: number) => {
    setUploadQueue((prev) => prev.map((job) => (job.id === id ? { ...job, status, progress } : job)));
  };

  const withLoadingAndError = useCallback(
    async <T,>(apiCall: () => Promise<T>, actionName: string): Promise<T | null> => {
      try {
        setIsFuncLoading(true);
        const result = await apiCall();
        return result;
      } catch (err: any) {
        setFuncError(err.message);
        console.error(`Error in ${actionName}:`, err);
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
        // If ID is provided, fetch specific. If NOT, fetch the user's current Active Session.
        const data: FuncDataResponse = id
          ? await apiService.getFuncData(token, id)
          : await apiService.getActiveSession(token);

        console.log("Refreshed Data:", {
          id: id || "Active Session",
          found: !!data,
          images: data?.funcImageIds?.length,
        });

        if (data) {
          setIsPartOfActiveFunc(data.isPartOfActiveFunc);
          setFuncMembers(data.funcMembers || []);
          setFuncImagesIds(data.funcImageIds || []);
          setFuncMetaData(data.funcMetadata || null);
        } else {
          // Handle case where data is empty (e.g., user is not in a function)
          setIsPartOfActiveFunc(false);
          setFuncMetaData(null);
        }
      }, "refresh_func_data");
    },
    [isSignedIn, getToken, withLoadingAndError]
  );

  const processUpload = useCallback(
    async (job: UploadJob) => {
      const token = await getToken();
      const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const currentSessionId = metaDataRef.current?.sessionID;

      if (!token || !currentSessionId || !CLOUDINARY_CLOUD_NAME || !PRESET) {
        console.error("Missing Config for Upload");
        updateJobStatus(job.id, "failed", 0);
        return;
      }

      try {
        updateJobStatus(job.id, "uploading", 0);

        const manipulated = await ImageManipulator.manipulateAsync(job.uri, [], {
          compress: 0.8, // Slightly reduced for speed
          format: ImageManipulator.SaveFormat.JPEG,
        });

        const uploadTask = FileSystem.createUploadTask(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          manipulated.uri,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: "file",
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
          throw new Error(`Cloudinary Error: ${response?.status} - ${response?.body}`);
        }

        const cloudinaryData = JSON.parse(response.body);

        await apiService.uploadImages(token, currentSessionId, [cloudinaryData.secure_url]);

        updateJobStatus(job.id, "completed", 1);
        posthog?.capture("func_image_uploaded", {
          sessionId: currentSessionId,
        });
      } catch (err) {
        console.error("Upload Job Failed:", err);
        updateJobStatus(job.id, "failed", 0);
      }
    },
    [getToken, posthog]
  );

  useEffect(() => {
    const processQueue = async () => {
      const pendingJob = uploadQueue.find((j) => j.status === "pending");
      const activeJobs = uploadQueue.filter((j) => j.status === "pending" || j.status === "uploading");

      if (activeJobs.length > 0) {
        hasNotified.current = false;

        if (pendingJob && !isProcessing.current) {
          isProcessing.current = true;
          await processUpload(pendingJob);
          isProcessing.current = false;
        }
      } else if (uploadQueue.length > 0 && activeJobs.length === 0) {
        if (!hasNotified.current) {
          hasNotified.current = true;

          const completedCount = uploadQueue.filter((j) => j.status === "completed").length;

          if (completedCount > 0) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "Function Updated",
                body: `Successfully uploaded ${completedCount} photos.`,
              },
              trigger: null,
            });
            // Refresh to see the new images
            refreshFuncData();
          }

          setTimeout(() => {
            setUploadQueue([]);
            hasNotified.current = false;
          }, 5000);
        }
      }
    };

    processQueue();
  }, [uploadQueue, processUpload, refreshFuncData]);

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
      // Immediately refresh with the new session ID to ensure state is synced
      await refreshFuncData(data.sessionID);
      posthog?.capture("func_created", { sessionId: data.sessionID });
    }, "create_func");
  }, [getToken, withLoadingAndError, refreshFuncData, posthog]);

  const addImages = useCallback(
    async (imageUrls: string[]) => {
      if (!metaDataRef.current?.sessionID) {
        console.warn("Cannot upload: No active session ID found.");
        return;
      }

      const newJobs: UploadJob[] = imageUrls.map((uri) => ({
        id: Math.random().toString(36).substring(7),
        uri,
        progress: 0,
        status: "pending",
      }));

      hasNotified.current = false;
      setUploadQueue((prev) => [...prev, ...newJobs]);
      posthog?.capture("func_images_queued", { count: imageUrls.length });
    },
    [posthog]
  );

  const deleteImages = useCallback(
    async (imageUrls: string[]) => {
      const token = await getToken();
      if (!token || !funcMetaData?.sessionID) return;

      await withLoadingAndError(async () => {
        await apiService.deleteImages(token, imageUrls, funcMetaData!.sessionID);
        // Refresh to reflect deletion
        await refreshFuncData(funcMetaData!.sessionID);
      }, "delete_images");
    },
    [funcMetaData, getToken, withLoadingAndError, refreshFuncData]
  );

  
  const joinFunc = useCallback(
    async (inviteCode: string): Promise<boolean> => {
      const token = await getToken();
      if (!token) return false;

      const result = await withLoadingAndError(async () => {
        const response = await apiService.joinFunction(token, inviteCode);

        if (response && response.funcId) {
          await refreshFuncData(response.funcId);
        } else {
          await refreshFuncData();
        }

        posthog?.capture("func_joined", { inviteCode });
        return true;
      }, "join_func");

      return !!result;
    },
    [posthog, getToken, withLoadingAndError, refreshFuncData]
  );

  const leaveFunc = useCallback(async () => {
    const token = await getToken();
    if (!token || !funcMetaData?.sessionID) return;

    await withLoadingAndError(async () => {
      await apiService.leaveFunction(token, funcMetaData!.sessionID);
      // Reset local state
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
        deleteImages,
        joinFunc,
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
