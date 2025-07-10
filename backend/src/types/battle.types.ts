export type Stats = {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
};

export type StatusEffect = {
  id: string;
  name: string;
  type: "buff" | "debuff";
  duration: number;
  effect: {
    stat?: keyof Stats;
    value: number;
  };
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  damage?: number;
  healing?: number;
  statusEffects?: StatusEffect[];
  cooldown: number;
  currentCooldown?: number;
  targeting: "single" | "all" | "self";
  energyCost: number;
};

export enum AIStrategy {
  AGGRESSIVE = "aggressive",
  DEFENSIVE = "defensive",
  TACTICAL = "tactical",
  BERSERKER = "berserker",
  SUPPORT = "support",
}

export type BattleCharacter = {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  skills: Skill[];
  statusEffects: StatusEffect[];
  currentEnergy: number;
  maxEnergy: number;
  position: number;
  isPlayer: boolean;
  aiStrategy?: AIStrategy;
  formation?: "front" | "back";
};

export type BattleAction = {
  type: "skill" | "basic_attack" | "defend" | "item";
  characterId: string;
  targetIds: string[];
  skillId?: string;
  itemId?: string;
};

export type BattleRewards = {
  experience: number;
  coins: number;
  items: string[];
  equipments: string[];
  rare_drops?: string[];
};

export type BattleState = {
  id: string;
  characters: BattleCharacter[];
  currentTurn: number;
  turnOrder: string[];
  status: "waiting" | "in_progress" | "completed";
  winner?: "player" | "enemy" | "draw";
  log: string[];
  turn: number;
  maxTurns: number;
  battleRewards?: BattleRewards;
  finalRewards?: BattleRewards;
  battleType?: "pve" | "pvp" | "boss" | "dungeon";
  difficulty?: "easy" | "normal" | "hard" | "nightmare";
  selectedEnemy?: string;
  startTime?: Date;
  environment?: {
    name: string;
    effects: string[];
  };
};

export type BattleResult = {
  damage?: number;
  healing?: number;
  statusEffectsApplied?: StatusEffect[];
  energyChange?: number;
  isCritical?: boolean;
  isBlocked?: boolean;
  isDodged?: boolean;
  combos?: number;
  elementalEffects?: string[];
};

export type Formation = {
  frontRow: string[];
  backRow: string[];
  formation_bonus?: {
    stat: keyof Stats;
    modifier: number;
  }[];
};

export type BattleEnvironment = {
  id: string;
  name: string;
  description: string;
  effects: {
    type: "weather" | "terrain" | "magical";
    name: string;
    effect: string;
    applies_to: "all" | "players" | "enemies";
  }[];
};

export type CombatStatistics = {
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  criticalHits: number;
  skillsUsed: number;
  turnsSurvived: number;
  enemiesDefeated: number;
};
