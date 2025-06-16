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
  type: "characters" | "pets" | "items";
  description?: string;
  attack?: number;
  defense?: number;
  hp?: number;
}

export interface GachaPull {
  type: "characters" | "pets" | "items";
  item: GachaItem;
}

export interface GachaResponse {
  success: boolean;
  pull: GachaPull;
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
