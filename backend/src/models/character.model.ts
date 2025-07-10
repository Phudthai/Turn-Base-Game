import mongoose, { Schema, Document } from "mongoose";

// Base Character Template (from gacha pool)
export interface ICharacter extends Document {
  _id: string;
  id: string; // unique character ID
  name: string;
  rarity: "R" | "SR" | "SSR";
  element: "fire" | "water" | "earth" | "air" | "light" | "dark" | "neutral";
  characterType:
    | "warrior"
    | "mage"
    | "archer"
    | "healer"
    | "tank"
    | "assassin"
    | "summoner";
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
  };
  skills: Array<{
    id: string;
    name: string;
    description: string;
    cooldown: number;
    manaCost: number;
  }>;
  maxLevel: number;
  evolutionMaterials?: Array<{
    itemId: string;
    quantity: number;
  }>;
  artwork: {
    icon: string;
    portrait: string;
    fullArt: string;
  };
  lore: string;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
    element: {
      type: String,
      enum: ["fire", "water", "earth", "air", "light", "dark", "neutral"],
      required: true,
    },
    characterType: {
      type: String,
      enum: [
        "warrior",
        "mage",
        "archer",
        "healer",
        "tank",
        "assassin",
        "summoner",
      ],
      required: true,
    },
    baseStats: {
      hp: { type: Number, required: true, min: 0 },
      attack: { type: Number, required: true, min: 0 },
      defense: { type: Number, required: true, min: 0 },
      speed: { type: Number, required: true, min: 0 },
      critRate: { type: Number, required: true, min: 0, max: 100 },
      critDamage: { type: Number, required: true, min: 0 },
    },
    growthRates: {
      hp: { type: Number, required: true, min: 0 },
      attack: { type: Number, required: true, min: 0 },
      defense: { type: Number, required: true, min: 0 },
      speed: { type: Number, required: true, min: 0 },
    },
    skills: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        cooldown: { type: Number, required: true, min: 0 },
        manaCost: { type: Number, required: true, min: 0 },
      },
    ],
    maxLevel: { type: Number, required: true, min: 1, default: 60 },
    evolutionMaterials: [
      {
        itemId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    artwork: {
      icon: { type: String, required: true },
      portrait: { type: String, required: true },
      fullArt: { type: String, required: true },
    },
    lore: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "characters",
  }
);

CharacterSchema.index({ rarity: 1 });
CharacterSchema.index({ element: 1 });
CharacterSchema.index({ characterType: 1 });

export const Character = mongoose.model<ICharacter>(
  "Character",
  CharacterSchema
);
