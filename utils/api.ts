
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { authClient } from "@/lib/auth";

export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "http://localhost:3000";

console.log("🔗 Backend URL configured:", BACKEND_URL);

const ANONYMOUS_TOKEN_KEY = "livdaily_anonymous_token";
const ANONYMOUS_USER_ID_KEY = "livdaily_anonymous_user_id";

let anonymousToken: string | null = null;
let anonymousUserId: string | null = null;

/**
 * Get or create an anonymous session token
 * This is called automatically when making API calls
 */
async function getOrCreateAnonymousToken(): Promise<string | null> {
  console.log("🔑 Getting or creating anonymous token...");
  
  // Check memory cache first
  if (anonymousToken) {
    console.log("✅ Using cached anonymous token");
    return anonymousToken;
  }

  // Try to retrieve from storage
  try {
    if (Platform.OS === "web") {
      anonymousToken = await AsyncStorage.getItem(ANONYMOUS_TOKEN_KEY);
      anonymousUserId = await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
    } else {
      anonymousToken = await SecureStore.getItemAsync(ANONYMOUS_TOKEN_KEY);
      anonymousUserId = await SecureStore.getItemAsync(ANONYMOUS_USER_ID_KEY);
    }

    if (anonymousToken) {
      console.log("✅ Retrieved anonymous token from storage");
      return anonymousToken;
    }
  } catch (error) {
    console.error("⚠️ Error retrieving token from storage:", error);
  }

  // If no token, create a new anonymous session
  try {
    console.log("🆕 Creating new anonymous session...");
    const response = await fetch(`${BACKEND_URL}/v1/auth/anonymous`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("❌ Failed to create anonymous session:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    anonymousToken = data.token;
    anonymousUserId = data.userId;

    // Store the new token
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(ANONYMOUS_TOKEN_KEY, anonymousToken);
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, anonymousUserId);
    } else {
      await SecureStore.setItemAsync(ANONYMOUS_TOKEN_KEY, anonymousToken);
      await SecureStore.setItemAsync(ANONYMOUS_USER_ID_KEY, anonymousUserId);
    }

    console.log("✅ Anonymous session created successfully");
    return anonymousToken;
  } catch (error) {
    console.error("❌ Error creating anonymous session:", error);
    return null;
  }
}

/**
 * Clear anonymous session (for testing or logout)
 */
export async function clearAnonymousSession() {
  console.log("🗑️ Clearing anonymous session...");
  anonymousToken = null;
  anonymousUserId = null;

  try {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(ANONYMOUS_TOKEN_KEY);
      await AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY);
    } else {
      await SecureStore.deleteItemAsync(ANONYMOUS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ANONYMOUS_USER_ID_KEY);
    }
    console.log("✅ Anonymous session cleared");
  } catch (error) {
    console.error("⚠️ Error clearing session:", error);
  }
}

/**
 * Helper function to make API calls with automatic anonymous authentication
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`🌐 API Call: ${options.method || "GET"} ${url}`);

    // Get or create anonymous token
    const token = await getOrCreateAnonymousToken();
    if (!token) {
      console.error("❌ No anonymous token available");
      return null;
    }

    // Make the request with the token
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle 401 - token might be expired, try to refresh once
    if (response.status === 401) {
      console.warn("⚠️ 401 Unauthorized - attempting to refresh token...");
      
      // Clear old token and try to create a new one
      await clearAnonymousSession();
      const newToken = await getOrCreateAnonymousToken();
      
      if (newToken) {
        console.log("🔄 Retrying request with new token...");
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log(`✅ API Success (after retry): ${options.method || "GET"} ${url}`);
          return data as T;
        }
      }
      
      console.error("❌ Failed to authenticate after retry");
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`❌ API Error: ${response.status}`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`✅ API Success: ${options.method || "GET"} ${url}`);
    return data as T;
  } catch (error: any) {
    console.error(`❌ API Call Failed: ${endpoint}`, error);
    return null;
  }
}

// AI Content Generation APIs
export const aiAPI = {
  // Unified AI generation endpoint
  generate: async (params: {
    module: string;
    goal: string;
    timeAvailable?: number;
    tone?: string;
    constraints?: any;
  }) => {
    console.log("🤖 Generating AI content for module:", params.module);
    return apiCall("/v1/ai/generate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // Legacy endpoints for backward compatibility
  generateJournalPrompt: async (params: {
    mood?: string;
    energy?: string;
    rhythmPhase?: string;
    userPatterns?: any;
  }) => {
    return aiAPI.generate({
      module: "journal",
      goal: "Generate a reflective journal prompt",
      tone: params.mood || "calm",
      constraints: params,
    });
  },

  generateNutritionTasks: async (params: {
    date: string;
    userPatterns?: any;
    preferences?: any;
  }) => {
    return aiAPI.generate({
      module: "nutrition",
      goal: "Generate simple daily nutrition tasks",
      constraints: params,
    });
  },

  generateMovementSuggestions: async (params: {
    energy?: string;
    timeAvailable?: number;
    preferences?: any;
  }) => {
    return aiAPI.generate({
      module: "movement",
      goal: "Generate movement suggestions",
      timeAvailable: params.timeAvailable,
      tone: params.energy,
      constraints: params,
    });
  },

  generateSleepContent: async (params: {
    currentState?: string;
    userPatterns?: any;
  }) => {
    return aiAPI.generate({
      module: "sleep",
      goal: "Generate sleep content",
      tone: params.currentState || "calm",
      constraints: params,
    });
  },

  generateWeeklyMotivation: async (params: {
    userPatterns?: any;
    weekTheme?: string;
  }) => {
    return aiAPI.generate({
      module: "motivation",
      goal: "Generate weekly motivation",
      constraints: params,
    });
  },
};

// User APIs
export const userAPI = {
  getMe: async () => {
    return apiCall("/api/user/me");
  },

  getProfile: async () => {
    return apiCall("/api/user/profile");
  },

  updateProfile: async (data: {
    name?: string;
    themePreference?: string;
    notificationSettings?: any;
  }) => {
    return apiCall("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getPatterns: async () => {
    return apiCall("/api/user/patterns");
  },
};

// Daily Rhythms APIs
export const rhythmsAPI = {
  getRhythms: async (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return apiCall(`/api/rhythms${query}`);
  },

  createRhythm: async (data: {
    date: string;
    morningMood?: string;
    middayEnergy?: string;
    eveningState?: string;
    nightQuality?: string;
  }) => {
    return apiCall("/api/rhythms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRhythm: async (
    id: string,
    data: {
      morningMood?: string;
      middayEnergy?: string;
      eveningState?: string;
      nightQuality?: string;
    }
  ) => {
    return apiCall(`/api/rhythms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Journal APIs
export const journalAPI = {
  getEntries: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/v1/journal${query ? `?${query}` : ""}`);
  },

  createEntry: async (data: {
    content: string;
    mood?: string;
    energyLevel?: string;
    promptUsed?: string;
    rhythmPhase?: string;
  }) => {
    return apiCall("/v1/journal", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteEntry: async (id: string) => {
    return apiCall(`/v1/journal/${id}`, {
      method: "DELETE",
    });
  },
};

// Movement APIs
export const movementAPI = {
  getLogs: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/v1/movement${query ? `?${query}` : ""}`);
  },

  createLog: async (data: {
    activityType: string;
    durationMinutes: number;
    videoId?: string;
    notes?: string;
  }) => {
    return apiCall("/v1/movement", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStats: async (period: "week" | "month") => {
    return apiCall(`/v1/movement/stats?period=${period}`);
  },
};

// Nutrition APIs
export const nutritionAPI = {
  getTasks: async (date: string) => {
    return apiCall(`/v1/nutrition/tasks?date=${date}`);
  },

  createTask: async (data: { taskDescription: string; date: string }) => {
    return apiCall("/v1/nutrition/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: string, data: { completed: boolean; completedAt?: string }) => {
    return apiCall(`/v1/nutrition/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Sleep APIs
export const sleepAPI = {
  getLogs: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/v1/sleep${query ? `?${query}` : ""}`);
  },

  createLog: async (data: {
    bedtime: string;
    wakeTime?: string;
    qualityRating?: number;
    windDownActivity?: string;
    reflection?: string;
    date: string;
  }) => {
    return apiCall("/v1/sleep", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStats: async (period: "week" | "month") => {
    return apiCall(`/v1/sleep/stats?period=${period}`);
  },
};

// Grounding APIs
export const groundingAPI = {
  getSessions: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/v1/grounding${query ? `?${query}` : ""}`);
  },

  createSession: async (data: {
    sessionType: string;
    durationMinutes: number;
    notes?: string;
  }) => {
    return apiCall("/v1/grounding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Mindfulness APIs
export const mindfulnessAPI = {
  getContent: async () => {
    return apiCall("/v1/mindfulness/content");
  },

  getContentById: async (id: string) => {
    return apiCall(`/v1/mindfulness/content/${id}`);
  },

  createJournalEntry: async (data: {
    mindfulnessContentId?: string;
    content: string;
    mood?: string;
  }) => {
    return apiCall("/v1/mindfulness/journal", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getJournalEntries: async () => {
    return apiCall("/v1/mindfulness/journal");
  },

  getSubscription: async () => {
    // Return free subscription for anonymous users
    return { subscriptionType: 'free', status: 'active' };
  },
};

// Media APIs
export const mediaAPI = {
  getMedia: async (params?: {
    mediaType?: string;
    category?: string;
    season?: string;
    rhythmPhase?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/api/media${query ? `?${query}` : ""}`);
  },

  uploadMedia: async (formData: FormData) => {
    try {
      console.log("🌐 API Call: POST /api/media/upload");
      
      // Use Better Auth's fetch for authenticated upload
      // Note: Don't set Content-Type for FormData - browser will set it with boundary
      const response = await authClient.$fetch(`${BACKEND_URL}/api/media/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("✅ Media upload successful");
      return response;
    } catch (error: any) {
      console.error("❌ Media upload failed:", error);
      throw new Error(`Upload failed: ${error.message || "Unknown error"}`);
    }
  },
};

// Motivation APIs
export const motivationAPI = {
  getCurrent: async () => {
    return apiCall("/v1/motivation/current");
  },

  getHistory: async () => {
    return apiCall("/v1/motivation/history");
  },
};

// Admin APIs
export const adminAPI = {
  getUsers: async () => {
    return apiCall("/api/admin/users");
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    return apiCall(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },

  getStats: async () => {
    return apiCall("/api/admin/stats");
  },

  createMedia: async (data: {
    mediaType: string;
    url: string;
    category?: string;
    season?: string;
    rhythmPhase?: string;
  }) => {
    return apiCall("/api/admin/media", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMedia: async (
    id: string,
    data: {
      isActive?: boolean;
      category?: string;
      season?: string;
    }
  ) => {
    return apiCall(`/api/admin/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteMedia: async (id: string) => {
    return apiCall(`/api/admin/media/${id}`, {
      method: "DELETE",
    });
  },

  createMotivation: async (data: {
    weekStartDate: string;
    content: string;
    author?: string;
  }) => {
    return apiCall("/api/admin/motivation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMotivation: async (
    id: string,
    data: {
      content?: string;
      author?: string;
    }
  ) => {
    return apiCall(`/api/admin/motivation/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteMotivation: async (id: string) => {
    return apiCall(`/api/admin/motivation/${id}`, {
      method: "DELETE",
    });
  },
};
