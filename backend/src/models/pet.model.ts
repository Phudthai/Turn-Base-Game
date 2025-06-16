import mongoose, { Schema, Document } from "mongoose";

// Base Pet Template
export interface IPet extends Document {
  _id: string;
  id: string; // unique pet ID
  name: string;
  rarity: "R" | "SR" | "SSR";
  element: "fire" | "water" | "earth" | "air" | "light" | "dark" | "neutral";
  petType: "battle" | "support" | "farming" | "passive";
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  bonuses: Array<{
    type: "stat_boost" | "skill_effect" | "resource_bonus" | "experience_boost";
    target: string; // what it affects
    value: number; // percentage or flat value
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    description: string;
    cooldown: number;
    effect: string;
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

const PetSchema = new Schema<IPet>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
    element: {
      type: String,
      enum: ["fire", "water", "earth", "air", "light", "dark", "neutral"],
      required: true,
    },
    petType: {
      type: String,
      enum: ["battle", "support", "farming", "passive"],
      required: true,
    },
    baseStats: {
      hp: { type: Number, required: true, min: 0 },
      attack: { type: Number, required: true, min: 0 },
      defense: { type: Number, required: true, min: 0 },
      speed: { type: Number, required: true, min: 0 },
    },
    bonuses: [
      {
        type: {
          type: String,
          enum: [
            "stat_boost",
            "skill_effect",
            "resource_bonus",
            "experience_boost",
          ],
          required: true,
        },
        target: { type: String, required: true },
        value: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
    skills: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        cooldown: { type: Number, required: true, min: 0 },
        effect: { type: String, required: true },
      },
    ],
    maxLevel: { type: Number, required: true, min: 1, default: 40 },
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
    collection: "pets",
  }
);

// Indexes
PetSchema.index({ rarity: 1 });
PetSchema.index({ element: 1 });
PetSchema.index({ petType: 1 });

export const Pet = mongoose.model<IPet>("Pet", PetSchema);
