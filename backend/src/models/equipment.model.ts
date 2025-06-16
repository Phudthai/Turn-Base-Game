import mongoose, { Schema, Document } from "mongoose";

// Base Equipment Template
export interface IEquipment extends Document {
  _id: string;
  id: string; // unique equipment ID
  name: string;
  description: string;
  rarity: "R" | "SR" | "SSR";
  type: "weapon" | "armor" | "accessory";
  subType:
    | "sword"
    | "bow"
    | "staff"
    | "helmet"
    | "chestplate"
    | "boots"
    | "ring"
    | "necklace"
    | "pendant";
  allowedClasses?: string[]; // which character types can use this
  baseStats: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    critRate?: number;
    critDamage?: number;
  };
  setBonus?: {
    setId: string;
    bonuses: Array<{
      pieces: number; // 2, 4, 6 pieces
      effects: Array<{
        stat: string;
        value: number;
      }>;
    }>;
  };
  enhancementLevels: {
    maxLevel: number;
    materials: Array<{
      level: number;
      requirements: Array<{
        itemId: string;
        quantity: number;
      }>;
    }>;
  };
  artwork: {
    icon: string;
    preview: string;
  };
  lore: string;
  tradeable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
    type: {
      type: String,
      enum: ["weapon", "armor", "accessory"],
      required: true,
    },
    subType: {
      type: String,
      enum: [
        "sword",
        "bow",
        "staff",
        "helmet",
        "chestplate",
        "boots",
        "ring",
        "necklace",
        "pendant",
      ],
      required: true,
    },
    allowedClasses: [{ type: String }],
    baseStats: {
      hp: { type: Number, min: 0, default: 0 },
      attack: { type: Number, min: 0, default: 0 },
      defense: { type: Number, min: 0, default: 0 },
      speed: { type: Number, min: 0, default: 0 },
      critRate: { type: Number, min: 0, max: 100, default: 0 },
      critDamage: { type: Number, min: 0, default: 0 },
    },
    setBonus: {
      setId: { type: String },
      bonuses: [
        {
          pieces: { type: Number, required: true, min: 2 },
          effects: [
            {
              stat: { type: String, required: true },
              value: { type: Number, required: true },
            },
          ],
        },
      ],
    },
    enhancementLevels: {
      maxLevel: { type: Number, required: true, min: 0, default: 15 },
      materials: [
        {
          level: { type: Number, required: true, min: 1 },
          requirements: [
            {
              itemId: { type: String, required: true },
              quantity: { type: Number, required: true, min: 1 },
            },
          ],
        },
      ],
    },
    artwork: {
      icon: { type: String, required: true },
      preview: { type: String, required: true },
    },
    lore: { type: String, default: "" },
    tradeable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "equipments",
  }
);

EquipmentSchema.index({ rarity: 1 });
EquipmentSchema.index({ type: 1 });
EquipmentSchema.index({ subType: 1 });

export const Equipment = mongoose.model<IEquipment>(
  "Equipment",
  EquipmentSchema
);

// User-owned Equipment Instance (unique)
export interface IUserEquipment extends Document {
  _id: string;
  userId: string;
  equipmentId: string; // reference to Equipment.id
  enhancementLevel: number;
  currentStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
  };
  substats: Array<{
    stat: string;
    value: number;
    isLocked: boolean; // for reroll mechanics
  }>;
  equippedTo?: string; // UserCharacter._id
  metadata: {
    obtainedAt: Date;
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "craft" | "drop";
    isLocked: boolean;
    isFavorite: boolean;
    nickname?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserEquipmentSchema = new Schema<IUserEquipment>(
  {
    userId: { type: String, required: true, index: true },
    equipmentId: { type: String, required: true, index: true },
    enhancementLevel: { type: Number, required: true, min: 0, default: 0 },
    currentStats: {
      hp: { type: Number, required: true, min: 0, default: 0 },
      attack: { type: Number, required: true, min: 0, default: 0 },
      defense: { type: Number, required: true, min: 0, default: 0 },
      speed: { type: Number, required: true, min: 0, default: 0 },
      critRate: { type: Number, required: true, min: 0, max: 100, default: 0 },
      critDamage: { type: Number, required: true, min: 0, default: 0 },
    },
    substats: [
      {
        stat: { type: String, required: true },
        value: { type: Number, required: true },
        isLocked: { type: Boolean, default: false },
      },
    ],
    equippedTo: { type: String, default: null },
    metadata: {
      obtainedAt: { type: Date, required: true, default: Date.now },
      obtainedFrom: {
        type: String,
        enum: ["gacha", "event", "trade", "gift", "craft", "drop"],
        required: true,
        default: "gacha",
      },
      isLocked: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
      nickname: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    collection: "user_equipments",
  }
);

UserEquipmentSchema.index({ userId: 1, equipmentId: 1 });
UserEquipmentSchema.index({ userId: 1, enhancementLevel: -1 });
UserEquipmentSchema.index({ userId: 1, equippedTo: 1 });
UserEquipmentSchema.index({ "metadata.obtainedAt": -1 });

// Virtual for equipment power level
UserEquipmentSchema.virtual("powerLevel").get(function () {
  const stats = this.currentStats;
  return Math.floor(
    stats.hp * 0.2 +
      stats.attack * 0.3 +
      stats.defense * 0.2 +
      stats.speed * 0.1 +
      stats.critRate * 0.1 +
      stats.critDamage * 0.1
  );
});

UserEquipmentSchema.set("toJSON", { virtuals: true });

export const UserEquipment = mongoose.model<IUserEquipment>(
  "UserEquipment",
  UserEquipmentSchema
);
 