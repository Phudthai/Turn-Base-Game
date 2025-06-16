import mongoose, { Schema, Document } from "mongoose";

// User-owned Character Instance (with progression)
export interface IUserCharacter extends Document {
  _id: string;
  userId: string;
  characterId: string; // reference to Character.id
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
  skillLevels: Array<{
    skillId: string;
    level: number;
  }>;
  evolution: {
    stage: number; // 0-6 stars
    materials: Array<{
      itemId: string;
      used: number;
    }>;
  };
  equipments: {
    weapon?: string; // UserEquipment._id
    armor?: string;
    accessory1?: string;
    accessory2?: string;
  };
  runes: Array<{
    slot: number; // 1-6
    runeId?: string; // UserRune._id
  }>;
  battleStats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    lastUsed: Date;
  };
  metadata: {
    obtainedAt: Date;
    obtainedFrom: "gacha" | "event" | "trade" | "gift";
    isLocked: boolean;
    isFavorite: boolean;
    nickname?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserCharacterSchema = new Schema<IUserCharacter>(
  {
    userId: { type: String, required: true, index: true },
    characterId: { type: String, required: true, index: true },
    level: { type: Number, required: true, min: 1, default: 1 },
    experience: { type: Number, required: true, min: 0, default: 0 },
    currentStats: {
      hp: { type: Number, required: true, min: 0 },
      attack: { type: Number, required: true, min: 0 },
      defense: { type: Number, required: true, min: 0 },
      speed: { type: Number, required: true, min: 0 },
      critRate: { type: Number, required: true, min: 0, max: 100 },
      critDamage: { type: Number, required: true, min: 0 },
    },
    skillLevels: [
      {
        skillId: { type: String, required: true },
        level: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    evolution: {
      stage: { type: Number, required: true, min: 0, max: 6, default: 0 },
      materials: [
        {
          itemId: { type: String, required: true },
          used: { type: Number, required: true, min: 0, default: 0 },
        },
      ],
    },
    equipments: {
      weapon: { type: String, default: null },
      armor: { type: String, default: null },
      accessory1: { type: String, default: null },
      accessory2: { type: String, default: null },
    },
    runes: [
      {
        slot: { type: Number, required: true, min: 1, max: 6 },
        runeId: { type: String, default: null },
      },
    ],
    battleStats: {
      gamesPlayed: { type: Number, default: 0, min: 0 },
      wins: { type: Number, default: 0, min: 0 },
      losses: { type: Number, default: 0, min: 0 },
      lastUsed: { type: Date, default: Date.now },
    },
    metadata: {
      obtainedAt: { type: Date, required: true, default: Date.now },
      obtainedFrom: {
        type: String,
        enum: ["gacha", "event", "trade", "gift"],
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
    collection: "user_characters",
  }
);

// Indexes for better performance
UserCharacterSchema.index({ userId: 1, characterId: 1 });
UserCharacterSchema.index({ userId: 1, level: -1 });
UserCharacterSchema.index({ userId: 1, "metadata.isFavorite": 1 });
UserCharacterSchema.index({ userId: 1, "evolution.stage": -1 });
UserCharacterSchema.index({ "metadata.obtainedAt": -1 });

// Virtual for character power level
UserCharacterSchema.virtual("powerLevel").get(function () {
  const stats = this.currentStats;
  return Math.floor(
    stats.hp * 0.3 +
      stats.attack * 0.4 +
      stats.defense * 0.2 +
      stats.speed * 0.1
  );
});

// Virtual for level progress
UserCharacterSchema.virtual("levelProgress").get(function () {
  const expRequired = this.level * 100; // Simple formula
  return {
    current: this.experience,
    required: expRequired,
    percentage: Math.min((this.experience / expRequired) * 100, 100),
  };
});

UserCharacterSchema.set("toJSON", { virtuals: true });

export const UserCharacter = mongoose.model<IUserCharacter>(
  "UserCharacter",
  UserCharacterSchema
);
