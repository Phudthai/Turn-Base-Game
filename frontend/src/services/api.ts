import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GachaPullResponse,
  InventoryResponse,
  UserProfile,
  InventoryGridResponse,
  CharacterDetailResponse,
  PetDetailResponse,
  ItemDetailResponse,
} from "../types/types";
import { API_ENDPOINTS } from "../constants/api";

// Generic API request function with better error handling
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("🌐 API Request:", { url, options });
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log("🌐 API Response status:", response.status);
    const data = await response.json();
    console.log("🌐 API Response data:", data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("🌐 API request failed:", error);
    throw error;
  }
}

// Auth API services
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async (
    token: string
  ): Promise<{ success: boolean; user: UserProfile }> => {
    return apiRequest<{ success: boolean; user: UserProfile }>(
      API_ENDPOINTS.AUTH.PROFILE,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  updateProfile: async (
    token: string,
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.PROFILE,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );
  },

  changePassword: async (
    token: string,
    passwords: { oldPassword: string; newPassword: string }
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      }
    );
  },

  addCurrency: async (
    token: string,
    currency: { gems: number; coins: number }
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.ADD_CURRENCY,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currency),
      }
    );
  },
};

// Game API services
export const gameAPI = {
  // Single gacha pull
  performGacha: async (
    token: string,
    bannerId: string = "standard_banner"
  ): Promise<GachaPullResponse> => {
    const url = `${API_ENDPOINTS.GAME.GACHA_PULL}?bannerId=${bannerId}`;
    return apiRequest<GachaPullResponse>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Multi gacha pull (10x)
  performMultiGacha: async (
    token: string,
    bannerId: string = "standard_banner"
  ): Promise<GachaPullResponse> => {
    const url = `${API_ENDPOINTS.GAME.GACHA_PULL}?bannerId=${bannerId}&multi=true`;
    return apiRequest<GachaPullResponse>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get gacha banners
  getBanners: async (token?: string): Promise<any> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return apiRequest<any>(API_ENDPOINTS.GAME.GACHA_BANNERS, {
      method: "GET",
      headers,
    });
  },

  // Get active gacha banners
  getBannersActive: async (token?: string): Promise<any> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return apiRequest<any>(API_ENDPOINTS.GAME.GACHA_BANNERS_ACTIVE, {
      method: "GET",
      headers,
    });
  },
};

// Inventory API services
export const inventoryAPI = {
  getUserInventory: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(API_ENDPOINTS.GAME.INVENTORY, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get inventory");
    }
  },

  getCharacters: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.GAME.INVENTORY}/characters`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get characters");
    }
  },

  getCharactersGrid: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.GAME.INVENTORY}/grid/characters`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Backend returns data directly, not wrapped in {success, data}
    return response;
  },

  getCharacterDetail: async (
    token: string,
    characterId: string
  ): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.GAME.INVENTORY}/character/${characterId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get character detail");
    }
  },

  getPets: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.GAME.INVENTORY}/pets`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get pets");
    }
  },

  getItems: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.GAME.INVENTORY}/items`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get items");
    }
  },

  // NEW: Grid View APIs (Compact Data)
  getInventoryGrid: async (token: string): Promise<InventoryGridResponse> => {
    const response = await apiRequest<any>(API_ENDPOINTS.INVENTORY.GRID, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get inventory grid");
    }
  },

  getPetsGrid: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(API_ENDPOINTS.INVENTORY.GRID_PETS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get pets grid");
    }
  },

  getItemsGrid: async (token: string): Promise<any> => {
    const response = await apiRequest<any>(API_ENDPOINTS.INVENTORY.GRID_ITEMS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get items grid");
    }
  },

  // NEW: Detail View APIs (Full Data)
  getPetDetail: async (
    token: string,
    petId: string
  ): Promise<PetDetailResponse> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.INVENTORY.PET_DETAIL}/${petId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get pet detail");
    }
  },

  getItemDetail: async (
    token: string,
    itemId: string
  ): Promise<ItemDetailResponse> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.INVENTORY.ITEM_DETAIL}/${itemId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get item detail");
    }
  },

  getEquipmentDetail: async (
    token: string,
    equipmentId: string
  ): Promise<any> => {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.INVENTORY.EQUIPMENT_DETAIL}/${equipmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to get equipment detail");
    }
  },
};

// Data API services (public data)
export const dataAPI = {
  getCharacters: async (): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.DATA.CHARACTERS, {
      method: "GET",
    });
  },

  getPets: async (): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.DATA.PETS, {
      method: "GET",
    });
  },

  getItems: async (): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.DATA.ITEMS, {
      method: "GET",
    });
  },
};

// Battle API services
export const battleAPI = {
  // Get available enemies for battle preparation (public)
  getAvailableEnemies: async (): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/enemies`, {
      method: "GET",
    });
  },

  // Get difficulty settings (public)
  getDifficultySettings: async (): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/difficulties`, {
      method: "GET",
    });
  },

  startBattle: async (
    token: string,
    data: {
      characterIds: string[];
      difficulty?: "easy" | "normal" | "hard" | "nightmare";
      battleType?: "pve" | "pvp" | "boss" | "dungeon";
      selectedEnemy?: string;
    }
  ): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  getBattleState: async (token: string, battleId: string): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/${battleId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  performAction: async (
    token: string,
    battleId: string,
    action: any
  ): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/${battleId}/action`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action),
    });
  },

  completeBattle: async (token: string, battleId: string): Promise<any> => {
    return apiRequest<any>(
      `${API_ENDPOINTS.GAME.BATTLE}/${battleId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getBattleRewards: async (token: string, battleId: string): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/${battleId}/rewards`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getBattleStatistics: async (
    token: string,
    battleId: string
  ): Promise<any> => {
    return apiRequest<any>(
      `${API_ENDPOINTS.GAME.BATTLE}/${battleId}/statistics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // New: Abandon battle
  abandonBattle: async (token: string, battleId: string): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/${battleId}/abandon`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Achievement API services
export const achievementAPI = {
  getCategories: async (token: string): Promise<any> => {
    return apiRequest<any>("/api/achievements/categories", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getAllAchievements: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/achievements?${queryParams}`
      : "/api/achievements";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getUserAchievements: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/achievements/my?${queryParams}`
      : "/api/achievements/my";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getAchievementProgress: async (
    token: string,
    achievementId: string
  ): Promise<any> => {
    return apiRequest<any>(`/api/achievements/${achievementId}/progress`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  claimReward: async (token: string, achievementId: string): Promise<any> => {
    return apiRequest<any>(`/api/achievements/${achievementId}/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getLeaderboard: async (token: string, queryParams?: string): Promise<any> => {
    const url = queryParams
      ? `/api/achievements/leaderboard?${queryParams}`
      : "/api/achievements/leaderboard";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Statistics API services
export const statisticsAPI = {
  getUserStatistics: async (token: string): Promise<any> => {
    return apiRequest<any>("/api/statistics", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getBattleStatistics: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/statistics/battles?${queryParams}`
      : "/api/statistics/battles";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getBattleHistory: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/statistics/battles/history?${queryParams}`
      : "/api/statistics/battles/history";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getPerformanceAnalytics: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/statistics/analytics?${queryParams}`
      : "/api/statistics/analytics";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getLeaderboards: async (
    token: string,
    queryParams?: string
  ): Promise<any> => {
    const url = queryParams
      ? `/api/statistics/leaderboards?${queryParams}`
      : "/api/statistics/leaderboards";
    return apiRequest<any>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
