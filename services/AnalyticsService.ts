import { AppState, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
// import * as Application from "expo-application";
import Constants from "expo-constants";
import { v4 as uuidv4 } from "uuid";

interface DeviceInfo {
  app_version: string;
  platform: string;
  os_version: string;
  device_model: string;
}

class AnalyticsService {
  private baseUrl: string;
  private sessionId: string | null = null;
  private currentScreen: string | null = null;
  private screenStartTime: number | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private appState: string = AppState.currentState;
  private screenViewCount: number = 0;
  private isInitialized: boolean = false;
  private authToken: string | null = null;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    const apiUrl = process.env.EXPO_PUBLIC_OUTDRINKME_API_URL;
    this.baseUrl = apiUrl || "http://localhost:3000";
  }

  async initialize(authToken: string) {
    if (this.isInitialized) {
      console.log("[Analytics] Already initialized");
      return;
    }

    try {
      this.authToken = authToken;
      this.sessionId = uuidv4();
      this.isInitialized = true;

      // Get device info
      this.deviceInfo = await this.getDeviceInfo();

      console.log("[Analytics] Initialized with session:", this.sessionId);

      // Start session
      await this.startSession();

      // Start heartbeat
      this.startHeartbeat();

      // Setup app state listener
      this.setupAppStateListener();

      // Setup crash handlers
      this.setupCrashHandlers();
    } catch (error) {
      console.error("[Analytics] Initialization failed:", error);
    }
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const version =
      //   Application.nativeApplicationVersion ||
        Constants.expoConfig?.version ||
        "1.0.0";
      const model = await DeviceInfo.getModel();

      return {
        app_version: version,
        platform: Platform.OS,
        os_version: Platform.Version.toString(),
        device_model: model,
      };
    } catch (error) {
      console.error("[Analytics] Failed to get device info:", error);
      return {
        app_version: "1.0.0",
        platform: Platform.OS,
        os_version: Platform.Version.toString(),
        device_model: "unknown",
      };
    }
  }

  cleanup() {
    console.log("[Analytics] Cleaning up...");
    this.endSession();
    this.stopHeartbeat();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    this.isInitialized = false;
  }

  // ============= PRESENCE TRACKING =============

  private startHeartbeat() {
    this.sendHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async sendHeartbeat() {
    if (!this.authToken || !this.deviceInfo) return;

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/analytics/presence/heartbeat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(this.deviceInfo),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("[Analytics] Active users:", data.active_users);
      }
    } catch (error) {
      console.error("[Analytics] Heartbeat failed:", error);
    }
  }

  private async disconnect() {
    if (!this.authToken) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/presence/disconnect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      console.log("[Analytics] Disconnected");
    } catch (error) {
      console.error("[Analytics] Disconnect failed:", error);
    }
  }

  // ============= SESSION TRACKING =============

  private async startSession() {
    if (!this.authToken || !this.sessionId || !this.deviceInfo) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          ...this.deviceInfo,
        }),
      });
      console.log("[Analytics] Session started:", this.sessionId);
    } catch (error) {
      console.error("[Analytics] Failed to start session:", error);
    }
  }

  private async endSession() {
    if (!this.authToken || !this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/session/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          screen_views: this.screenViewCount,
        }),
      });
      console.log("[Analytics] Session ended:", this.sessionId);
    } catch (error) {
      console.error("[Analytics] Failed to end session:", error);
    }
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          this.appState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground
          console.log("[Analytics] App resumed");
          this.sessionId = uuidv4();
          this.startSession();
          this.startHeartbeat();
          this.trackEvent("app_resumed", "navigation");
        } else if (nextAppState.match(/inactive|background/)) {
          // App went to background
          console.log("[Analytics] App backgrounded");
          this.endSession();
          this.stopHeartbeat();
          this.disconnect();
          this.trackEvent("app_backgrounded", "navigation");
        }
        this.appState = nextAppState;
      }
    );
  }

  // ============= SCREEN TRACKING =============

  trackScreenView(screenName: string, params?: Record<string, any>) {
    // End previous screen tracking
    if (this.currentScreen && this.screenStartTime) {
      const duration = Math.floor((Date.now() - this.screenStartTime) / 1000);
      this.sendScreenView(this.currentScreen, screenName, duration, {});
    }

    // Start new screen tracking
    this.currentScreen = screenName;
    this.screenStartTime = Date.now();
    this.screenViewCount++;

    console.log("[Analytics] Screen view:", screenName);
  }

  private async sendScreenView(
    screenName: string,
    nextScreen: string | null,
    duration: number,
    metadata: Record<string, any>
  ) {
    if (!this.authToken || !this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/screen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          screen_name: screenName,
          previous_screen: nextScreen,
          duration_seconds: duration,
          metadata,
        }),
      });
    } catch (error) {
      console.error("[Analytics] Failed to track screen:", error);
    }
  }

  // ============= EVENT TRACKING =============

  async trackEvent(
    eventName: string,
    eventType: "action" | "navigation" | "conversion" = "action",
    properties: Record<string, any> = {}
  ) {
    if (!this.authToken || !this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          event_name: eventName,
          event_type: eventType,
          properties: {
            ...properties,
            screen: this.currentScreen,
          },
        }),
      });
      console.log("[Analytics] Event tracked:", eventName);
    } catch (error) {
      console.error("[Analytics] Failed to track event:", error);
    }
  }

  // ============= PERFORMANCE TRACKING =============

  async trackPerformance(
    metricType: "app_start" | "screen_load" | "api_call",
    metricName: string,
    durationMs: number,
    metadata: Record<string, any> = {}
  ) {
    if (!this.authToken || !this.deviceInfo) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/analytics/performance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          metric_type: metricType,
          metric_name: metricName,
          duration_ms: durationMs,
          ...this.deviceInfo,
          metadata,
        }),
      });
      console.log(
        "[Analytics] Performance tracked:",
        metricName,
        durationMs + "ms"
      );
    } catch (error) {
      console.error("[Analytics] Failed to track performance:", error);
    }
  }

  startPerformanceMeasure(metricName: string) {
    const startTime = Date.now();
    return {
      metricName,
      startTime,
      end: (
        metricType: "app_start" | "screen_load" | "api_call" = "screen_load",
        metadata: Record<string, any> = {}
      ) => {
        const duration = Date.now() - startTime;
        this.trackPerformance(metricType, metricName, duration, metadata);
      },
    };
  }

  // ============= CRASH REPORTING =============

  private setupCrashHandlers() {
    const originalHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.reportCrash(error, isFatal);
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Unhandled promise rejections
    const rejectionHandler = (event: any) => {
      this.reportCrash(event.reason, false);
    };

    if (global.addEventListener) {
      global.addEventListener("unhandledRejection", rejectionHandler);
    }
  }

  async reportCrash(error: Error | any, isFatal: boolean = false) {
    if (!this.authToken || !this.deviceInfo) return;

    try {
      const stackTrace = error.stack || "";

      await fetch(`${this.baseUrl}/api/v1/analytics/crash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          error_type: isFatal ? "fatal_crash" : "error",
          error_message: error.message || error.toString(),
          stack_trace: stackTrace,
          ...this.deviceInfo,
          metadata: {
            screen: this.currentScreen,
            session_id: this.sessionId,
            is_fatal: isFatal,
          },
        }),
      });

      console.error("[Analytics] Crash reported:", error.message);
    } catch (reportError) {
      console.error("[Analytics] Failed to report crash:", reportError);
    }
  }

  // ============= CONVENIENCE METHODS =============

  trackButtonClick(buttonName: string, screenName?: string) {
    this.trackEvent("button_click", "action", {
      button_name: buttonName,
      screen: screenName || this.currentScreen,
    });
  }

  trackFeatureUsage(featureName: string, metadata: Record<string, any> = {}) {
    this.trackEvent("feature_used", "action", {
      feature: featureName,
      ...metadata,
    });
  }

  trackConversion(
    conversionName: string,
    value?: number,
    metadata: Record<string, any> = {}
  ) {
    this.trackEvent(conversionName, "conversion", {
      value,
      ...metadata,
    });
  }

  async trackApiCall<T>(apiName: string, promise: Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await promise;
      const duration = Date.now() - startTime;

      this.trackPerformance("api_call", apiName, duration, {
        status: "success",
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.trackPerformance("api_call", apiName, duration, {
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }
}

export default new AnalyticsService();
