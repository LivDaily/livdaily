
import Constants from "expo-constants";
import { authClient } from "@/lib/auth";

export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "http://localhost:3000";

console.log("🔗 Backend URL configured:", BACKEND_URL);

/**
 * Helper function to make authenticated API calls
 * Uses Better Auth's built-in fetch which automatically handles authentication
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`🌐 API Call: ${options.method || "GET"} ${url}`);

    // Use Better Auth's fetch method which automatically includes auth headers
    const response = await authClient.$fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`✅ API Success: ${options.method || "GET"} ${url}`);
    return response as T;
  } catch (error: any) {
    console.error(`❌ API Call Failed: ${endpoint}`, error);
    
    // Better Auth throws errors with response property
    if (error.response) {
      const status = error.response.status;
      const errorText = await error.response.text().catch(() => "Unknown error");
      console.error(`❌ API Error: ${status}`, errorText);
      throw new Error(`API Error: ${status} - ${errorText}`);
    }
    
    throw error;
  }
}

// AI Content Generation APIs
export const aiAPI = {
  generateJournalPrompt: async (params: {
    mood?: string;
    energy?: string;
    rhythmPhase?: string;
    userPatterns?: any;
  }) => {
    return apiCall("/api/ai/journal-prompt", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  generateNutritionTasks: async (params: {
    date: string;
    userPatterns?: any;
    preferences?: any;
  }) => {
    return apiCall("/api/ai/nutrition-tasks", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  generateMovementSuggestions: async (params: {
    energy?: string;
    timeAvailable?: number;
    preferences?: any;
  }) => {
    return apiCall("/api/ai/movement-suggestions", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  generateSleepContent: async (params: {
    currentState?: string;
    userPatterns?: any;
  }) => {
    return apiCall("/api/ai/sleep-content", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  generateWeeklyMotivation: async (params: {
    userPatterns?: any;
    weekTheme?: string;
  }) => {
    return apiCall("/api/ai/weekly-motivation", {
      method: "POST",
      body: JSON.stringify(params),
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
    return apiCall(`/api/journal${query ? `?${query}` : ""}`);
  },

  createEntry: async (data: {
    content: string;
    mood?: string;
    energyLevel?: string;
    promptUsed?: string;
    rhythmPhase?: string;
  }) => {
    return apiCall("/api/journal", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteEntry: async (id: string) => {
    return apiCall(`/api/journal/${id}`, {
      method: "DELETE",
    });
  },
};

// Movement APIs
export const movementAPI = {
  getLogs: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/api/movement${query ? `?${query}` : ""}`);
  },

  createLog: async (data: {
    activityType: string;
    durationMinutes: number;
    videoId?: string;
    notes?: string;
  }) => {
    return apiCall("/api/movement", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStats: async (period: "week" | "month") => {
    return apiCall(`/api/movement/stats?period=${period}`);
  },
};

// Nutrition APIs
export const nutritionAPI = {
  getTasks: async (date: string) => {
    return apiCall(`/api/nutrition/tasks?date=${date}`);
  },

  createTask: async (data: { taskDescription: string; date: string }) => {
    return apiCall("/api/nutrition/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: string, data: { completed: boolean; completedAt?: string }) => {
    return apiCall(`/api/nutrition/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Sleep APIs
export const sleepAPI = {
  getLogs: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/api/sleep${query ? `?${query}` : ""}`);
  },

  createLog: async (data: {
    bedtime: string;
    wakeTime?: string;
    qualityRating?: number;
    windDownActivity?: string;
    reflection?: string;
    date: string;
  }) => {
    return apiCall("/api/sleep", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStats: async (period: "week" | "month") => {
    return apiCall(`/api/sleep/stats?period=${period}`);
  },
};

// Grounding APIs
export const groundingAPI = {
  getSessions: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/api/grounding${query ? `?${query}` : ""}`);
  },

  createSession: async (data: {
    sessionType: string;
    durationMinutes: number;
    notes?: string;
  }) => {
    return apiCall("/api/grounding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Mindfulness APIs
export const mindfulnessAPI = {
  getContent: async () => {
    return apiCall("/api/mindfulness/content");
  },

  getContentById: async (id: string) => {
    return apiCall(`/api/mindfulness/content/${id}`);
  },

  createJournalEntry: async (data: {
    mindfulnessContentId?: string;
    content: string;
    mood?: string;
  }) => {
    return apiCall("/api/mindfulness/journal", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getJournalEntries: async () => {
    return apiCall("/api/mindfulness/journal");
  },

  getSubscription: async () => {
    return apiCall("/api/mindfulness/subscription");
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
    return apiCall("/api/motivation/current");
  },

  getHistory: async () => {
    return apiCall("/api/motivation/history");
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
