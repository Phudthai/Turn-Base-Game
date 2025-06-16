// API Configuration
export const API_BASE_URL = "http://localhost:8000/api";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    ADD_CURRENCY: `${API_BASE_URL}/auth/add-currency`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  GAME: {
    GACHA_PULL: `${API_BASE_URL}/gacha/pull`,
    GACHA_BANNERS: `${API_BASE_URL}/gacha/banners`,
    BATTLE: `${API_BASE_URL}/battle`,
  },
  INVENTORY: {
    BASE: `${API_BASE_URL}/inventory`,
    CHARACTERS: `${API_BASE_URL}/inventory/characters`,
    PETS: `${API_BASE_URL}/inventory/pets`,
    ITEMS: `${API_BASE_URL}/inventory/items`,
  },
  DATA: {
    CHARACTERS: `${API_BASE_URL}/data/characters`,
    PETS: `${API_BASE_URL}/data/pets`,
    ITEMS: `${API_BASE_URL}/data/items`,
  },
} as const;
