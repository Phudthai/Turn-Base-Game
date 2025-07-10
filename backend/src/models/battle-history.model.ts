import mongoose, { Schema, Document } from "mongoose";

// Battle History Record
export interface IBattleHistory extends Document {
  _id: string;
  userId: string;
  battleId: string; // unique battle session ID
  battleType: "pve" | "pvp" | "boss" | "dungeon";
  difficulty: "easy" | "normal" | "hard" | "nightmare";

  // Battle participants
  playerCharacters: Array<{
    characterId: string;
    level: number;
    finalHp: number;
    maxHp: number;
    damageDealt: number;
    damageTaken: number;
    skillsUsed: number;
    criticalHits: number;
  }>;

  enemyCharacters: Array<{
    characterId: string;
    name: string;
    level: number;
    defeated: boolean;
  }>;

  // Battle outcome
  result: "victory" | "defeat" | "draw";
  duration: number; // in seconds
  turnsPlayed: number;
  maxTurns: number;

  // Performance metrics
  combatStatistics: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalHealing: number;
    criticalHits: number;
    skillsUsed: number;
    perfectTurns: number; // turns with no damage taken
    overkillDamage: number;
  };

  // Rewards received
  rewards: {
    experience: number;
    coins: number;
    items: Array<{
      itemId: string;
      quantity: number;
    }>;
    equipments: Array<{
      equipmentId: string;
      rarity: string;
    }>;
    rareDrops: Array<{
      itemId: string;
      quantity: number;
    }>;
  };

  // Battle events log (simplified)
  eventsSummary: {
    totalActions: number;
    playerActions: number;
    enemyActions: number;
    healingActions: number;
    criticalEvents: number;
  };

  // Metadata
  metadata: {
    completedAt: Date;
    gameVersion: string;
    region: string;
    platform: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const BattleHistorySchema = new Schema<IBattleHistory>(
  {
    userId: { type: String, required: true },
    battleId: { type: String, required: true, unique: true },
    battleType: {
      type: String,
      enum: ["pve", "pvp", "boss", "dungeon"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "normal", "hard", "nightmare"],
      required: true,
    },

    playerCharacters: [
      {
        characterId: { type: String, required: true },
        level: { type: Number, required: true, min: 1 },
        finalHp: { type: Number, required: true, min: 0 },
        maxHp: { type: Number, required: true, min: 1 },
        damageDealt: { type: Number, default: 0, min: 0 },
        damageTaken: { type: Number, default: 0, min: 0 },
        skillsUsed: { type: Number, default: 0, min: 0 },
        criticalHits: { type: Number, default: 0, min: 0 },
      },
    ],

    enemyCharacters: [
      {
        characterId: { type: String, required: true },
        name: { type: String, required: true },
        level: { type: Number, required: true, min: 1 },
        defeated: { type: Boolean, required: true },
      },
    ],

    result: {
      type: String,
      enum: ["victory", "defeat", "draw"],
      required: true,
    },
    duration: { type: Number, required: true, min: 0 },
    turnsPlayed: { type: Number, required: true, min: 0 },
    maxTurns: { type: Number, required: true, min: 1 },

    combatStatistics: {
      totalDamageDealt: { type: Number, default: 0, min: 0 },
      totalDamageTaken: { type: Number, default: 0, min: 0 },
      totalHealing: { type: Number, default: 0, min: 0 },
      criticalHits: { type: Number, default: 0, min: 0 },
      skillsUsed: { type: Number, default: 0, min: 0 },
      perfectTurns: { type: Number, default: 0, min: 0 },
      overkillDamage: { type: Number, default: 0, min: 0 },
    },

    rewards: {
      experience: { type: Number, default: 0, min: 0 },
      coins: { type: Number, default: 0, min: 0 },
      items: [
        {
          itemId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      equipments: [
        {
          equipmentId: { type: String, required: true },
          rarity: { type: String, required: true },
        },
      ],
      rareDrops: [
        {
          itemId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
    },

    eventsSummary: {
      totalActions: { type: Number, default: 0, min: 0 },
      playerActions: { type: Number, default: 0, min: 0 },
      enemyActions: { type: Number, default: 0, min: 0 },
      healingActions: { type: Number, default: 0, min: 0 },
      criticalEvents: { type: Number, default: 0, min: 0 },
    },

    metadata: {
      completedAt: { type: Date, required: true, default: Date.now },
      gameVersion: { type: String, default: "1.0.0" },
      region: { type: String, default: "global" },
      platform: { type: String, default: "web" },
    },
  },
  {
    timestamps: true,
    collection: "battle_history",
  }
);

// Indexes for better performance (คงไว้เฉพาะ composite index)
BattleHistorySchema.index({ userId: 1, createdAt: -1 });
BattleHistorySchema.index({ userId: 1, result: 1 });
BattleHistorySchema.index({ userId: 1, battleType: 1 });
BattleHistorySchema.index({ userId: 1, difficulty: 1 });
BattleHistorySchema.index({ "metadata.completedAt": -1 });

// Virtual for win rate calculation
BattleHistorySchema.virtual("survivalRate").get(function () {
  const aliveCharacters = this.playerCharacters.filter(
    (char) => char.finalHp > 0
  ).length;
  return this.playerCharacters.length > 0
    ? (aliveCharacters / this.playerCharacters.length) * 100
    : 0;
});

// Virtual for efficiency rating
BattleHistorySchema.virtual("efficiencyRating").get(function () {
  const maxPossibleTurns = this.maxTurns;
  const actualTurns = this.turnsPlayed;
  const timeBonus =
    maxPossibleTurns > 0
      ? ((maxPossibleTurns - actualTurns) / maxPossibleTurns) * 100
      : 0;

  const damageEfficiency =
    this.combatStatistics.totalDamageTaken > 0
      ? (this.combatStatistics.totalDamageDealt /
          this.combatStatistics.totalDamageTaken) *
        10
      : 100;

  return Math.min(100, Math.max(0, timeBonus + damageEfficiency));
});

BattleHistorySchema.set("toJSON", { virtuals: true });

export const BattleHistory = mongoose.model<IBattleHistory>(
  "BattleHistory",
  BattleHistorySchema
);

// Battle Session (for ongoing battles)
export interface IBattleSession extends Document {
  _id: string;
  battleId: string;
  userId: string;
  status: "active" | "paused" | "completed" | "abandoned";
  startedAt: Date;
  lastActionAt: Date;
  expiresAt: Date; // auto-cleanup

  // Current battle state (for resuming)
  currentState: {
    turn: number;
    phase: string;
    activeCharacterId: string;
    pendingActions: Array<any>;
  };

  createdAt: Date;
  updatedAt: Date;
}

const BattleSessionSchema = new Schema<IBattleSession>(
  {
    battleId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "abandoned"],
      default: "active",
    },
    startedAt: { type: Date, required: true, default: Date.now },
    lastActionAt: { type: Date, required: true, default: Date.now },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },

    currentState: {
      turn: { type: Number, default: 1 },
      phase: { type: String, default: "player_turn" },
      activeCharacterId: { type: String, required: true },
      pendingActions: [{ type: Schema.Types.Mixed }],
    },
  },
  {
    timestamps: true,
    collection: "battle_sessions",
  }
);

// Auto-cleanup expired sessions
BattleSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
BattleSessionSchema.index({ userId: 1, status: 1 });

export const BattleSession = mongoose.model<IBattleSession>(
  "BattleSession",
  BattleSessionSchema
);
