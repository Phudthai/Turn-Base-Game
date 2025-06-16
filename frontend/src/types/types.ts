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
  // Equipment specific fields
  type?: "weapon" | "armor" | "accessory";
  equipmentStats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    critRate?: number;
    critDamage?: number;
  };
}

export interface GachaPull {
  type: "character" | "pet" | "item" | "equipment";
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
  characters: Array<{
    id: string;
    name: string;
    level: number;
    experience: number;
    powerLevel: number;
    rarity: "R" | "SR" | "SSR";
    isFavorite: boolean;
    isLocked: boolean;
    obtainedAt: string;
  }>;
  pets: Array<{
    id: string;
    name: string;
    level: number;
    experience: number;
    rarity: "R" | "SR" | "SSR";
    isActive: boolean;
    isFavorite: boolean;
    isLocked: boolean;
    obtainedAt: string;
  }>;
  items: Array<{
    id: string;
    name: string;
    description: string;
    rarity: "R" | "SR" | "SSR";
    type: "consumable" | "material" | "enhancement" | "currency" | "special";
    subType:
      | "potion"
      | "scroll"
      | "gem"
      | "ore"
      | "essence"
      | "token"
      | "key"
      | "other";
    quantity: number;
    isLocked: boolean;
    obtainedAt: string;
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "purchase" | "craft";
    artwork: {
      icon: string;
      thumbnail: string;
    };
    effects: Array<{
      type: "heal" | "buff" | "experience" | "currency" | "unlock" | "craft";
      value: number;
      duration?: number;
      target?: "character" | "pet" | "user";
    }>;
    sellPrice: number;
    stackLimit: number;
    tradeable: boolean;
  }>;
  equipments: Array<{
    id: string;
    _id: string;
    name: string;
    description: string;
    rarity: "R" | "SR" | "SSR";
    type: "weapon" | "armor" | "accessory";
    subType: string;
    enhancementLevel: number;
    isLocked: boolean;
    equippedTo?: string;
    equippedSlot?: string;
    obtainedAt: string;
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "craft";
    baseStats: {
      hp?: number;
      attack?: number;
      defense?: number;
      speed?: number;
      critRate?: number;
      critDamage?: number;
    };
    allowedClasses: string[];
  }>;
  total: number;
}

// NEW: Grid View Types (Compact Data)
export interface InventoryGridResponse {
  characters: Array<{
    id: string;
    characterId: string;
    name: string;
    rarity: "R" | "SR" | "SSR";
    level: number;
    isLocked: boolean;
    isFavorite: boolean;
    artwork: {
      icon: string;
      thumbnail: string;
    };
  }>;
  pets: Array<{
    id: string;
    petId: string;
    name: string;
    rarity: "R" | "SR" | "SSR";
    level: number;
    isLocked: boolean;
    isFavorite: boolean;
    isActive: boolean;
    artwork: {
      icon: string;
      thumbnail: string;
    };
  }>;
  items: Array<{
    id: string;
    itemId: string;
    name: string;
    rarity: "R" | "SR" | "SSR";
    type: "consumable" | "material" | "enhancement" | "currency" | "special";
    typeAbbr: string;
    quantity: number;
    isLocked: boolean;
    artwork: {
      icon: string;
      thumbnail: string;
    };
  }>;
  total: number;
}

// NEW: Detail View Types (Full Data)
export interface CharacterDetailResponse {
  character: {
    id: string;
    characterId: string;
    name: string;
    description: string;
    rarity: "R" | "SR" | "SSR";
    level: number;
    experience: number;
    currentStats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      critRate: number;
      critDamage: number;
    };
    powerLevel: number;
    evolution: {
      stage: number;
      materials: Array<{
        itemId: string;
        used: number;
      }>;
    };
    equipments: {
      weapon?: string;
      armor?: string;
      accessory1?: string;
      accessory2?: string;
    };
    battleStats: {
      gamesPlayed: number;
      wins: number;
      losses: number;
      lastUsed: string;
    };
    skills: Array<{
      id: string;
      name: string;
      description: string;
      damage?: number;
      manaCost?: number;
      cooldown?: number;
    }>;
    artwork: {
      icon: string;
      thumbnail: string;
      fullImage: string;
    };
    metadata: {
      obtainedAt: string;
      obtainedFrom: "gacha" | "event" | "trade" | "gift";
      isLocked: boolean;
      isFavorite: boolean;
      nickname?: string;
    };
    template?: {
      baseStats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        critRate: number;
        critDamage: number;
      };
      growthRates: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        critRate: number;
        critDamage: number;
      };
      maxLevel: number;
      element: string;
    };
  };
}

export interface PetDetailResponse {
  pet: {
    id: string;
    petId: string;
    name: string;
    description: string;
    rarity: "R" | "SR" | "SSR";
    level: number;
    experience: number;
    currentStats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
    };
    skillLevels: Array<{
      skillId: string;
      level: number;
    }>;
    evolution: {
      stage: number;
      materials: Array<{
        itemId: string;
        used: number;
      }>;
    };
    bonusEffects: Array<{
      type: string;
      target: string;
      value: number;
      isActive: boolean;
    }>;
    battleStats: {
      gamesPlayed: number;
      wins: number;
      losses: number;
      lastUsed: string;
    };
    skills: Array<{
      id: string;
      name: string;
      description: string;
      cooldown: number;
      effect: string;
    }>;
    artwork: {
      icon: string;
      thumbnail: string;
      fullImage: string;
    };
    metadata: {
      obtainedAt: string;
      obtainedFrom: "gacha" | "event" | "trade" | "gift" | "breeding";
      isActive: boolean;
      isLocked: boolean;
      isFavorite: boolean;
      nickname?: string;
    };
    template?: {
      baseStats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
      };
      bonuses: Array<{
        type: string;
        target: string;
        value: number;
        description: string;
      }>;
      maxLevel: number;
      element: string;
      petType: string;
    };
  };
}

export interface ItemDetailResponse {
  item: {
    id: string;
    itemId: string;
    name: string;
    description: string;
    rarity: "R" | "SR" | "SSR";
    type: "consumable" | "material" | "enhancement" | "currency" | "special";
    subType: string;
    quantity: number;
    stackLimit: number;
    sellPrice: number;
    tradeable: boolean;
    effects: Array<{
      type: "heal" | "buff" | "experience" | "currency" | "unlock" | "craft";
      value: number;
      duration?: number;
      target?: "character" | "pet" | "user";
    }>;
    artwork: {
      icon: string;
      thumbnail: string;
      fullImage: string;
    };
    metadata: {
      obtainedAt: string;
      obtainedFrom: "gacha" | "event" | "trade" | "gift" | "purchase" | "craft";
      isLocked: boolean;
      lastUsed?: string;
    };
  };
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
