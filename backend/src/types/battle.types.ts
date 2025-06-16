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
};

export type BattleAction = {
  type: "skill" | "basic_attack";
  characterId: string;
  targetIds: string[];
  skillId?: string;
};

export type BattleState = {
  id: string;
  characters: BattleCharacter[];
  currentTurn: number;
  turnOrder: string[];
  status: "waiting" | "in_progress" | "completed";
  winner?: "player" | "enemy";
  log: string[];
};

export type BattleResult = {
  damage?: number;
  healing?: number;
  statusEffectsApplied?: StatusEffect[];
  energyChange?: number;
  isCritical?: boolean;
};
