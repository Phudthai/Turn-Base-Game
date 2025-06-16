// Shared types between backend and frontend

export interface User {
  id: string;
  username: string;
  createdAt: string;
  level?: number;
  experience?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: "R" | "SR" | "SSR";
  // Union type for different item types
  stats?: {
    hp: number;
    attack: number;
    defense: number;
  };
  bonus?: {
    type: string;
    value: number;
  };
  effect?: string;
}

export interface GachaPull {
  type: "character" | "pet" | "item";
  item: GachaItem;
}

export interface MultiGachaPull {
  pulls: GachaPull[];
  guaranteedSR: boolean;
}

// Backend response format
export interface GachaPullResponse {
  success: boolean;
  pull: GachaPull | MultiGachaPull;
  pityInfo?: {
    current: number;
    untilGuaranteed: number;
  };
  currency: {
    type: "gems" | "coins";
    spent: number;
    remaining: number;
  };
}

// Legacy types for backward compatibility
export interface GachaResponse {
  success: boolean;
  pull: GachaPull;
  pityInfo?: {
    current: number;
    untilGuaranteed: number;
  };
  currency: {
    type: "gems" | "coins";
    spent: number;
    remaining: number;
  };
}

export interface MultiGachaResponse {
  success: boolean;
  pull: MultiGachaPull;
  pityInfo?: {
    current: number;
    untilGuaranteed: number;
  };
  currency: {
    type: "gems" | "coins";
    spent: number;
    remaining: number;
  };
}

export interface BattleState {
  player: {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
  };
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
  };
  turn: "player" | "enemy";
  isGameOver: boolean;
  winner?: "player" | "enemy";
}

export interface InventoryItem {
  id: string;
  item: GachaItem;
  quantity: number;
  equipped?: boolean;
}

export interface InventoryResponse {
  characters: Array<{ id: string; count: number }>;
  pets: Array<{ id: string; count: number }>;
  items: Array<{ id: string; count: number }>;
  total: number;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  currency: {
    gems: number;
    coins: number;
  };
  pity: {
    standardPity: number;
    eventPity: number;
    totalPulls: number;
  };
  settings: {
    notifications: boolean;
    soundEnabled: boolean;
  };
}
