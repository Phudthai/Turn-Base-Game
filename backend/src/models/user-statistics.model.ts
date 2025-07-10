import mongoose, { Schema, Document } from "mongoose";

// Interface for UserStatistics document
export interface IUserStatistics extends Document {
  _id: string;
  userId: string;

  battleStats: {
    totalBattles: number;
    totalVictories: number;
    totalDefeats: number;
    totalDraws: number;

    // Combat metrics
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalCriticalHits: number;
    totalSkillsUsed: number;

    // Difficulty statistics
    difficultyStats: {
      easy: {
        battles: number;
        wins: number;
        losses: number;
      };
      normal: {
        battles: number;
        wins: number;
        losses: number;
      };
      hard: {
        battles: number;
        wins: number;
        losses: number;
      };
      nightmare: {
        battles: number;
        wins: number;
        losses: number;
      };
    };

    // Battle type statistics
    battleTypeStats: {
      pve: {
        battles: number;
        wins: number;
        losses: number;
      };
      pvp: {
        battles: number;
        wins: number;
        losses: number;
      };
      boss: {
        battles: number;
        wins: number;
        losses: number;
      };
      dungeon: {
        battles: number;
        wins: number;
        losses: number;
      };
    };

    // Streak tracking
    currentWinStreak: number;
    currentLossStreak: number;
    longestWinStreak: number;
    longestLossStreak: number;

    lastBattleDate: Date;
  };

  progressionStats: {
    totalExperienceGained: number;
    totalCoinsEarned: number;
  };

  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// UserStatistics Schema
const UserStatisticsSchema = new Schema<IUserStatistics>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    battleStats: {
      totalBattles: { type: Number, default: 0, min: 0 },
      totalVictories: { type: Number, default: 0, min: 0 },
      totalDefeats: { type: Number, default: 0, min: 0 },
      totalDraws: { type: Number, default: 0, min: 0 },

      totalDamageDealt: { type: Number, default: 0, min: 0 },
      totalDamageTaken: { type: Number, default: 0, min: 0 },
      totalCriticalHits: { type: Number, default: 0, min: 0 },
      totalSkillsUsed: { type: Number, default: 0, min: 0 },

      difficultyStats: {
        easy: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        normal: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        hard: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        nightmare: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
      },

      battleTypeStats: {
        pve: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        pvp: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        boss: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
        dungeon: {
          battles: { type: Number, default: 0, min: 0 },
          wins: { type: Number, default: 0, min: 0 },
          losses: { type: Number, default: 0, min: 0 },
        },
      },

      currentWinStreak: { type: Number, default: 0, min: 0 },
      currentLossStreak: { type: Number, default: 0, min: 0 },
      longestWinStreak: { type: Number, default: 0, min: 0 },
      longestLossStreak: { type: Number, default: 0, min: 0 },

      lastBattleDate: { type: Date, default: null },
    },

    progressionStats: {
      totalExperienceGained: { type: Number, default: 0, min: 0 },
      totalCoinsEarned: { type: Number, default: 0, min: 0 },
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "user_statistics",
  }
);

// Indexes for better performance
UserStatisticsSchema.index({ lastUpdated: -1 });
UserStatisticsSchema.index({ "battleStats.lastBattleDate": -1 });
UserStatisticsSchema.index({ "battleStats.totalBattles": -1 });
UserStatisticsSchema.index({ "battleStats.totalVictories": -1 });

// Virtual for overall win rate
UserStatisticsSchema.virtual("winRate").get(function () {
  if (this.battleStats.totalBattles === 0) return 0;
  return Math.round(
    (this.battleStats.totalVictories / this.battleStats.totalBattles) * 100
  );
});

// Virtual for damage efficiency
UserStatisticsSchema.virtual("damageEfficiency").get(function () {
  if (this.battleStats.totalDamageTaken === 0) return 0;
  return (
    Math.round(
      (this.battleStats.totalDamageDealt / this.battleStats.totalDamageTaken) *
        100
    ) / 100
  );
});

// Virtual for user ID (to maintain compatibility with existing code)
UserStatisticsSchema.virtual("id").get(function () {
  return this._id.toString();
});

// Ensure virtual fields are serialized
UserStatisticsSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Export the model
export const UserStatistics = mongoose.model<IUserStatistics>(
  "UserStatistics",
  UserStatisticsSchema
);

// Additional interfaces for responses
export interface UserStatisticsResponse extends IUserStatistics {
  winRate: number;
  damageEfficiency: number;
}

export interface StatisticsSummary {
  userId: string;
  totalBattles: number;
  totalVictories: number;
  winRate: string;
  currentWinStreak: number;
  longestWinStreak: number;
  totalDamageDealt: number;
  totalExperienceGained: number;
  lastBattleDate: Date;
}
