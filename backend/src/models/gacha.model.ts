export type Rarity = "R" | "SR" | "SSR";
export type BannerType = "standard" | "event" | "limited";
export type CurrencyType = "gems" | "coins";

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  stats: {
    hp: number;
    attack: number;
    defense: number;
  };
}

export interface Pet {
  id: string;
  name: string;
  rarity: Rarity;
  bonus: {
    type: string;
    value: number;
  };
}

export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  effect: string;
}

export type GachaItem = Character | Pet | Item;

export interface Banner {
  id: string;
  name: string;
  type: BannerType;
  featured: {
    items: string[]; // Array of item IDs
    rateUp: number; // Rate up percentage for featured items
  };
  cost: {
    currency: CurrencyType;
    amount: number;
    discount?: {
      multiPull: number; // Discount for 10-pull
    };
  };
  duration?: {
    start: string;
    end: string;
  };
}

export interface GachaPool {
  characters: Character[];
  pets: Pet[];
  items: Item[];
  banners: Banner[];
  rates: {
    R: number;
    SR: number;
    SSR: number;
  };
}

export interface GachaPull {
  type: "character" | "pet" | "item";
  item: GachaItem;
}

export interface MultiGachaPull {
  pulls: GachaPull[];
  guaranteedSR: boolean;
}

export interface GachaPullResponse {
  success: boolean;
  pull: GachaPull | MultiGachaPull;
  pityInfo?: {
    current: number;
    untilGuaranteed: number;
  };
  currency: {
    type: CurrencyType;
    spent: number;
    remaining: number;
  };
}

export interface PullHistory {
  userId: string;
  timestamp: string;
  bannerId: string;
  result: GachaPull[];
}
