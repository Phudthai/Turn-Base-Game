import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GachaPullResponse,
  InventoryResponse,
  UserProfile,
} from "../types/types";
import { API_ENDPOINTS } from "../constants/api";

// Generic API request function with better error handling
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
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
};

// Inventory API services
export const inventoryAPI = {
  // Get full inventory
  getInventory: async (token: string): Promise<InventoryResponse> => {
    return apiRequest<InventoryResponse>(API_ENDPOINTS.INVENTORY.BASE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get characters
  getCharacters: async (token: string): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.INVENTORY.CHARACTERS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get pets
  getPets: async (token: string): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.INVENTORY.PETS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get items
  getItems: async (token: string): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.INVENTORY.ITEMS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
  startBattle: async (token: string, characterIds: string[]): Promise<any> => {
    return apiRequest<any>(`${API_ENDPOINTS.GAME.BATTLE}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ characterIds }),
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
      },
      body: JSON.stringify(action),
    });
  },
};
