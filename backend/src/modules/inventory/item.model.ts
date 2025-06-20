import mongoose, { Schema, Document } from "mongoose";

// Base Item Template
export interface IItem extends Document {
  _id: string;
  id: string; // unique item ID
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
  effects: Array<{
    type: "heal" | "buff" | "experience" | "currency" | "unlock" | "craft";
    value: number;
    duration?: number; // in seconds for buffs
    target?: "character" | "pet" | "user";
  }>;
  stackLimit: number; // max stack size
  sellPrice: number;
  tradeable: boolean;
  artwork: {
    icon: string;
    thumbnail: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
    type: {
      type: String,
      enum: ["consumable", "material", "enhancement", "currency", "special"],
      required: true,
    },
    subType: {
      type: String,
      enum: [
        "potion",
        "scroll",
        "gem",
        "ore",
        "essence",
        "token",
        "key",
        "other",
      ],
      required: true,
    },
    effects: [
      {
        type: {
          type: String,
          enum: ["heal", "buff", "experience", "currency", "unlock", "craft"],
          required: true,
        },
        value: { type: Number, required: true },
        duration: { type: Number, min: 0 },
        target: {
          type: String,
          enum: ["character", "pet", "user"],
          default: "character",
        },
      },
    ],
    stackLimit: { type: Number, required: true, min: 1, default: 999 },
    sellPrice: { type: Number, required: true, min: 0, default: 0 },
    tradeable: { type: Boolean, default: true },
    artwork: {
      icon: { type: String, required: true },
      thumbnail: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    collection: "items",
  }
);

ItemSchema.index({ rarity: 1 });
ItemSchema.index({ type: 1 });
ItemSchema.index({ subType: 1 });

export const Item = mongoose.model<IItem>("Item", ItemSchema);

// User-owned Item Instance (stackable)
export interface IUserItem extends Document {
  _id: string;
  userId: string;
  itemId: string; // reference to Item.id
  quantity: number;
  metadata: {
    obtainedAt: Date;
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "purchase" | "craft";
    isLocked: boolean;
    lastUsed?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserItemSchema = new Schema<IUserItem>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    metadata: {
      obtainedAt: { type: Date, required: true, default: Date.now },
      obtainedFrom: {
        type: String,
        enum: ["gacha", "event", "trade", "gift", "purchase", "craft"],
        required: true,
        default: "gacha",
      },
      isLocked: { type: Boolean, default: false },
      lastUsed: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    collection: "user_items",
  }
);

// Compound index for unique user-item combination
UserItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });
UserItemSchema.index({ userId: 1, quantity: -1 });
UserItemSchema.index({ "metadata.obtainedAt": -1 });

export const UserItem = mongoose.model<IUserItem>("UserItem", UserItemSchema);
 