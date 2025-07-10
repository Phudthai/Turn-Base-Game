import mongoose, { Schema, Document } from "mongoose";

// Achievement Template (game-defined achievements)
export interface IAchievement extends Document {
  _id: string;
  id: string; // unique achievement ID
  name: string;
  description: string;
  category:
    | "battle"
    | "collection"
    | "progression"
    | "special"
    | "daily"
    | "weekly";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";

  // Achievement requirements
  requirements: {
    type:
      | "battle_wins"
      | "character_collection"
      | "level_reached"
      | "items_collected"
      | "equipment_enhanced"
      | "damage_dealt"
      | "perfect_battles"
      | "consecutive_wins"
      | "skill_usage"
      | "critical_hits"
      | "survival_rate"
      | "speed_clear"
      | "gacha_pulls"
      | "daily_login"
      | "weekly_quests"
      | "boss_defeats"
      | "pvp_wins"
      | "custom";
    target: number; // target value to achieve
    parameters?: {
      // additional parameters for complex requirements
      difficulty?: string[];
      battleType?: string[];
      characterType?: string[];
      timeLimit?: number; // in seconds
      minimumLevel?: number;
      specificItems?: string[];
      customCondition?: string;
    };
  };

  // Rewards for completing the achievement
  rewards: {
    experience: number;
    coins: number;
    gems: number;
    items: Array<{
      itemId: string;
      quantity: number;
    }>;
    equipments: Array<{
      equipmentId: string;
      quantity: number;
    }>;
    characters: Array<{
      characterId: string;
      quantity: number;
    }>;
    title?: string; // special title for player
    badge?: string; // special badge/icon
  };

  // UI and display
  artwork: {
    icon: string;
    badge: string;
    banner?: string;
  };

  // Achievement properties
  isHidden: boolean; // secret achievements
  isRepeatable: boolean; // can be completed multiple times
  prerequisiteAchievements: string[]; // other achievements required first
  expiresAt?: Date; // for limited-time achievements

  // Metadata
  metadata: {
    addedInVersion: string;
    difficulty: "easy" | "medium" | "hard" | "extreme";
    estimatedTime: string; // "1 hour", "1 day", "1 week", etc.
    completionRate: number; // percentage of players who completed this
  };

  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "battle",
        "collection",
        "progression",
        "special",
        "daily",
        "weekly",
      ],
      required: true,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      required: true,
    },

    requirements: {
      type: {
        type: String,
        enum: [
          "battle_wins",
          "character_collection",
          "level_reached",
          "items_collected",
          "equipment_enhanced",
          "damage_dealt",
          "perfect_battles",
          "consecutive_wins",
          "skill_usage",
          "critical_hits",
          "survival_rate",
          "speed_clear",
          "gacha_pulls",
          "daily_login",
          "weekly_quests",
          "boss_defeats",
          "pvp_wins",
          "custom",
        ],
        required: true,
      },
      target: { type: Number, required: true, min: 1 },
      parameters: {
        difficulty: [{ type: String }],
        battleType: [{ type: String }],
        characterType: [{ type: String }],
        timeLimit: { type: Number, min: 0 },
        minimumLevel: { type: Number, min: 1 },
        specificItems: [{ type: String }],
        customCondition: { type: String },
      },
    },

    rewards: {
      experience: { type: Number, default: 0, min: 0 },
      coins: { type: Number, default: 0, min: 0 },
      gems: { type: Number, default: 0, min: 0 },
      items: [
        {
          itemId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      equipments: [
        {
          equipmentId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      characters: [
        {
          characterId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      title: { type: String, default: null },
      badge: { type: String, default: null },
    },

    artwork: {
      icon: { type: String, required: true },
      badge: { type: String, required: true },
      banner: { type: String, default: null },
    },

    isHidden: { type: Boolean, default: false },
    isRepeatable: { type: Boolean, default: false },
    prerequisiteAchievements: [{ type: String }],
    expiresAt: { type: Date, default: null },

    metadata: {
      addedInVersion: { type: String, required: true, default: "1.0.0" },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "extreme"],
        required: true,
      },
      estimatedTime: { type: String, required: true },
      completionRate: { type: Number, default: 0, min: 0, max: 100 },
    },
  },
  {
    timestamps: true,
    collection: "achievements",
  }
);

// Indexes
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ tier: 1 });
AchievementSchema.index({ isHidden: 1 });
AchievementSchema.index({ expiresAt: 1 });

export const Achievement = mongoose.model<IAchievement>(
  "Achievement",
  AchievementSchema
);

// User Achievement Progress
export interface IUserAchievement extends Document {
  _id: string;
  userId: string;
  achievementId: string; // reference to Achievement.id

  // Progress tracking
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  completedAt?: Date;

  // Progress history (for repeatable achievements)
  completionHistory: Array<{
    completedAt: Date;
    progressAtCompletion: number;
    rewardsReceived: {
      experience: number;
      coins: number;
      gems: number;
      items: Array<{ itemId: string; quantity: number }>;
      equipments: Array<{ equipmentId: string; quantity: number }>;
    };
  }>;

  // Tracking data for complex achievements
  trackingData: {
    consecutiveCount?: number; // for consecutive wins, etc.
    lastActionDate?: Date; // for daily/weekly tracking
    specificCounts?: { [key: string]: number }; // for complex counting
    customData?: { [key: string]: any }; // for custom achievements
  };

  // Metadata
  firstProgressAt: Date;
  lastProgressAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true, index: true },

    currentProgress: { type: Number, required: true, default: 0, min: 0 },
    targetProgress: { type: Number, required: true, min: 1 },
    isCompleted: { type: Boolean, required: true, default: false },
    completedAt: { type: Date, default: null },

    completionHistory: [
      {
        completedAt: { type: Date, required: true },
        progressAtCompletion: { type: Number, required: true },
        rewardsReceived: {
          experience: { type: Number, default: 0 },
          coins: { type: Number, default: 0 },
          gems: { type: Number, default: 0 },
          items: [
            {
              itemId: { type: String, required: true },
              quantity: { type: Number, required: true },
            },
          ],
          equipments: [
            {
              equipmentId: { type: String, required: true },
              quantity: { type: Number, required: true },
            },
          ],
        },
      },
    ],

    trackingData: {
      consecutiveCount: { type: Number, default: 0 },
      lastActionDate: { type: Date, default: null },
      specificCounts: { type: Map, of: Number, default: {} },
      customData: { type: Map, of: Schema.Types.Mixed, default: {} },
    },

    firstProgressAt: { type: Date, required: true, default: Date.now },
    lastProgressAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: "user_achievements",
  }
);

// Compound index for unique user-achievement combination
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });
UserAchievementSchema.index({ userId: 1, completedAt: -1 });

// Virtual for completion percentage
UserAchievementSchema.virtual("completionPercentage").get(function () {
  return this.targetProgress > 0
    ? Math.min(100, (this.currentProgress / this.targetProgress) * 100)
    : 0;
});

// Virtual for time to complete
UserAchievementSchema.virtual("timeToComplete").get(function () {
  if (!this.isCompleted || !this.completedAt) return null;
  return this.completedAt.getTime() - this.firstProgressAt.getTime();
});

UserAchievementSchema.set("toJSON", { virtuals: true });

export const UserAchievement = mongoose.model<IUserAchievement>(
  "UserAchievement",
  UserAchievementSchema
);

// Achievement Categories (for organization)
export interface IAchievementCategory extends Document {
  _id: string;
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementCategorySchema = new Schema<IAchievementCategory>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    sortOrder: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "achievement_categories",
  }
);

AchievementCategorySchema.index({ sortOrder: 1 });
AchievementCategorySchema.index({ isActive: 1 });

export const AchievementCategory = mongoose.model<IAchievementCategory>(
  "AchievementCategory",
  AchievementCategorySchema
);
