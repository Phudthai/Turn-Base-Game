import mongoose, { Schema, Document } from "mongoose";

// Character interface and schema
export interface ICharacter {
  id: string;
  name: string;
  rarity: "R" | "SR" | "SSR";
  stats: {
    hp: number;
    attack: number;
    defense: number;
  };
}

const CharacterSchema = new Schema<ICharacter>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
  stats: {
    hp: { type: Number, required: true, min: 0 },
    attack: { type: Number, required: true, min: 0 },
    defense: { type: Number, required: true, min: 0 },
  },
});

// Pet interface and schema
export interface IPet {
  id: string;
  name: string;
  rarity: "R" | "SR" | "SSR";
  bonus: {
    type: string;
    value: number;
  };
}

const PetSchema = new Schema<IPet>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
  bonus: {
    type: { type: String, required: true },
    value: { type: Number, required: true },
  },
});

// Item interface and schema
export interface IItem {
  id: string;
  name: string;
  rarity: "R" | "SR" | "SSR";
  effect: string;
}

const ItemSchema = new Schema<IItem>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, enum: ["R", "SR", "SSR"], required: true },
  effect: { type: String, required: true },
});

// Banner interface and schema
export interface IBanner {
  id: string;
  name: string;
  type: "standard" | "event" | "limited";
  featured: {
    items: string[];
    rateUp: number;
  };
  cost: {
    currency: "gems" | "coins";
    amount: number;
    discount?: {
      multiPull: number;
    };
  };
  duration?: {
    start: Date;
    end: Date;
  };
  isActive: boolean;
}

const BannerSchema = new Schema<IBanner>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["standard", "event", "limited"],
    required: true,
  },
  featured: {
    items: [{ type: String }],
    rateUp: { type: Number, min: 0, max: 1, default: 0 },
  },
  cost: {
    currency: { type: String, enum: ["gems", "coins"], required: true },
    amount: { type: Number, required: true, min: 0 },
    discount: {
      multiPull: { type: Number, min: 0, default: 0 },
    },
  },
  duration: {
    start: { type: Date },
    end: { type: Date },
  },
  isActive: { type: Boolean, default: true },
});

// GachaPool interface and schema
export interface IGachaPool extends Document {
  _id: string;
  version: string;
  characters: ICharacter[];
  pets: IPet[];
  items: IItem[];
  banners: IBanner[];
  rates: {
    R: number;
    SR: number;
    SSR: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GachaPoolSchema = new Schema<IGachaPool>(
  {
    version: { type: String, required: true, default: "1.0.0" },
    characters: [CharacterSchema],
    pets: [PetSchema],
    items: [ItemSchema],
    banners: [BannerSchema],
    rates: {
      R: { type: Number, required: true, min: 0, max: 1, default: 0.85 },
      SR: { type: Number, required: true, min: 0, max: 1, default: 0.13 },
      SSR: { type: Number, required: true, min: 0, max: 1, default: 0.02 },
    },
  },
  {
    timestamps: true,
    collection: "gacha_pools",
  }
);

// Indexes
GachaPoolSchema.index({ version: 1 });
GachaPoolSchema.index({ "banners.isActive": 1 });

// Virtual for ID compatibility
GachaPoolSchema.virtual("id").get(function () {
  return this._id.toString();
});

// JSON transformation
GachaPoolSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Export main GachaPool model only (avoid conflicts with other Character/Item models)
export const GachaPool = mongoose.model<IGachaPool>(
  "GachaPool",
  GachaPoolSchema
);

// Export types for compatibility
export type Character = ICharacter;
export type Pet = IPet;
export type Item = IItem;
export type Banner = IBanner;
