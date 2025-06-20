import mongoose, { Schema, Document } from "mongoose";

// User-owned Pet Instance (with progression)
export interface IUserPet extends Document {
  _id: string;
  userId: string;
  petId: string; // reference to Pet.id
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
    stage: number; // 0-3 stars for pets
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
    lastUsed: Date;
  };
  metadata: {
    obtainedAt: Date;
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "breeding";
    isActive: boolean; // only one pet can be active at a time
    isLocked: boolean;
    isFavorite: boolean;
    nickname?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPetSchema = new Schema<IUserPet>(
  {
    userId: { type: String, required: true },
    petId: { type: String, required: true },
    level: { type: Number, required: true, min: 1, default: 1 },
    experience: { type: Number, required: true, min: 0, default: 0 },
    currentStats: {
      hp: { type: Number, required: true, min: 0 },
      attack: { type: Number, required: true, min: 0 },
      defense: { type: Number, required: true, min: 0 },
      speed: { type: Number, required: true, min: 0 },
    },
    skillLevels: [
      {
        skillId: { type: String, required: true },
        level: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    evolution: {
      stage: { type: Number, required: true, min: 0, max: 3, default: 0 },
      materials: [
        {
          itemId: { type: String, required: true },
          used: { type: Number, required: true, min: 0, default: 0 },
        },
      ],
    },
    bonusEffects: [
      {
        type: { type: String, required: true },
        target: { type: String, required: true },
        value: { type: Number, required: true },
        isActive: { type: Boolean, required: true, default: true },
      },
    ],
    battleStats: {
      gamesPlayed: { type: Number, required: true, min: 0, default: 0 },
      wins: { type: Number, required: true, min: 0, default: 0 },
      losses: { type: Number, required: true, min: 0, default: 0 },
      lastUsed: { type: Date, default: Date.now },
    },
    metadata: {
      obtainedAt: { type: Date, required: true, default: Date.now },
      obtainedFrom: {
        type: String,
        enum: ["gacha", "event", "trade", "gift", "breeding"],
        required: true,
      },
      isActive: { type: Boolean, required: true, default: false },
      isLocked: { type: Boolean, required: true, default: false },
      isFavorite: { type: Boolean, required: true, default: false },
      nickname: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "user_pets",
  }
);

// Indexes
UserPetSchema.index({ userId: 1 });
UserPetSchema.index({ petId: 1 });
UserPetSchema.index({ userId: 1, petId: 1 });
UserPetSchema.index({ "metadata.isActive": 1 });

export const UserPet = mongoose.model<IUserPet>("UserPet", UserPetSchema);
