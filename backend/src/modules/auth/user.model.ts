import mongoose, { Schema, Document } from "mongoose";

// Interface for User document (clean - no embedded inventory)
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
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
  gameProgress: {
    storyChapter: number;
    arenaRank: number;
    guildId?: string;
    lastLogin: Date;
    totalPlayTime: number; // in minutes
  };
  settings: {
    notifications: boolean;
    soundEnabled: boolean;
    language: string;
    timezone: string;
  };
  statistics: {
    totalGachaPulls: number;
    totalSSRsObtained: number;
    totalBattlesPlayed: number;
    totalBattlesWon: number;
    charactersOwned: number;
    equipmentsOwned: number;
    itemsOwned: number;
  };
  premium: {
    isActive: boolean;
    expiresAt?: Date;
    type?: "monthly" | "annual";
    benefits: string[];
  };
}

// User Schema (clean)
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      gems: { type: Number, default: 0, min: 0 },
      coins: { type: Number, default: 0, min: 0 },
    },
    pity: {
      standardPity: { type: Number, default: 0, min: 0, max: 100 },
      eventPity: { type: Number, default: 0, min: 0, max: 100 },
      totalPulls: { type: Number, default: 0, min: 0 },
    },
    gameProgress: {
      storyChapter: { type: Number, default: 1, min: 1 },
      arenaRank: { type: Number, default: 0, min: 0 },
      guildId: { type: String, default: null },
      lastLogin: { type: Date, default: Date.now },
      totalPlayTime: { type: Number, default: 0, min: 0 },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },
    statistics: {
      totalGachaPulls: { type: Number, default: 0, min: 0 },
      totalSSRsObtained: { type: Number, default: 0, min: 0 },
      totalBattlesPlayed: { type: Number, default: 0, min: 0 },
      totalBattlesWon: { type: Number, default: 0, min: 0 },
      charactersOwned: { type: Number, default: 0, min: 0 },
      equipmentsOwned: { type: Number, default: 0, min: 0 },
      itemsOwned: { type: Number, default: 0, min: 0 },
    },
    premium: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
      type: { type: String, enum: ["monthly", "annual"], default: null },
      benefits: [{ type: String }],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "users",
  }
);

// Indexes for better performance
UserSchema.index({ createdAt: -1 });
UserSchema.index({ level: -1 });
UserSchema.index({ "gameProgress.arenaRank": 1 });
UserSchema.index({ "gameProgress.lastLogin": -1 });

// Virtual for user ID (to maintain compatibility with existing code)
UserSchema.virtual("id").get(function () {
  return this._id.toString();
});

// Virtual for level progress
UserSchema.virtual("levelProgress").get(function () {
  const expRequired = this.level * 100; // Simple formula
  return {
    current: this.experience,
    required: expRequired,
    percentage: Math.min((this.experience / expRequired) * 100, 100),
  };
});

// Virtual for win rate
UserSchema.virtual("winRate").get(function () {
  if (this.statistics.totalBattlesPlayed === 0) return 0;
  return Math.round(
    (this.statistics.totalBattlesWon / this.statistics.totalBattlesPlayed) * 100
  );
});

// Ensure virtual fields are serialized
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never return password in JSON
    return ret;
  },
});

// Export the model
export const User = mongoose.model<IUser>("User", UserSchema);

export interface UserResponse extends Omit<IUser, "password"> {}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
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
  createdAt: string;
  lastLogin: string;
  statistics: {
    totalGachaPulls: number;
    totalSSRsObtained: number;
    totalBattlesPlayed: number;
    totalBattlesWon: number;
    charactersOwned: number;
    equipmentsOwned: number;
    itemsOwned: number;
  };
  pityStatus: {
    standardPity: number;
    eventPity: number;
    totalPulls: number;
  };
}

export interface UpdateProfileRequest {
  username?: string;
  settings?: {
    notifications?: boolean;
    soundEnabled?: boolean;
    language?: string;
    timezone?: string;
  };
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserSummary {
  username: string;
  currency: number;
  inventoryCount: number;
  pityStatus: {
    [bannerId: string]: number;
  };
}
