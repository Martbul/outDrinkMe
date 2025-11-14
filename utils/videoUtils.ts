import { Alert } from "react-native";
import { VIDEO_CONFIG } from "../constants/videoConfig";

export class VideoUtils {
  /**
   * Validates video duration
   */
  static isValidDuration(duration: number): boolean {
    return duration > 0 && duration <= VIDEO_CONFIG.MAX_DURATION;
  }

  /**
   * Formats duration for display (MM:SS)
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Validates video file
   */
  static validateVideoFile(uri: string): boolean {
    if (!uri) {
      Alert.alert("Error", "Invalid video file");
      return false;
    }
    return true;
  }

  /**
   * Generates video thumbnail URL from Cloudinary
   */
  static generateThumbnailUrl(cloudinaryUrl: string): string {
    // Replace /upload/ with /upload/c_thumb,w_400,g_center/
    return cloudinaryUrl.replace(
      "/upload/",
      "/upload/c_thumb,w_400,g_center,f_jpg/"
    );
  }

  /**
   * Creates FormData for video upload
   */
  static createUploadFormData(
    videoUri: string,
    userId: string,
    uploadPreset: string
  ): FormData {
    const formData = new FormData();

    formData.append("file", {
      uri: videoUri,
      type: "video/mp4",
      name: `video_${Date.now()}.mp4`,
    } as any);

    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", VIDEO_CONFIG.CLOUDINARY.resourceType);
    formData.append("folder", VIDEO_CONFIG.CLOUDINARY.folder);
    formData.append("tags", `user_${userId},video_post`);

    return formData;
  }
}
