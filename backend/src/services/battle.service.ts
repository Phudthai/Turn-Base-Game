import { nanoid } from "nanoid";
import {
  BattleState,
  BattleCharacter,
  BattleAction,
  BattleResult,
  StatusEffect,
} from "../types/battle.types";
import { CharacterService } from "./character.service";
import { Character } from "../models/character.model";
import { BattleRewardsService } from "./battle-rewards.service";

// In-memory store for active battles
const activeBattles = new Map<string, BattleState>();

// Enhanced Enemy AI Types
export enum AIStrategy {
  AGGRESSIVE = "aggressive", // Always attack strongest target
  DEFENSIVE = "defensive", // Focus on healing and buffs
  TACTICAL = "tactical", // Target weakest enemy first
  BERSERKER = "berserker", // Sacrifice HP for damage
  SUPPORT = "support", // Focus on buffing allies
}

// Enemy templates with AI strategies
const ENEMY_TEMPLATES = {
  goblin_warrior: {
    name: "Goblin Warrior",
    aiStrategy: AIStrategy.AGGRESSIVE,
    stats: { hp: 120, attack: 65, defense: 30, speed: 50 },
    skills: ["slash", "rage"],
  },
  orc_shaman: {
    name: "Orc Shaman",
    aiStrategy: AIStrategy.SUPPORT,
    stats: { hp: 90, attack: 45, defense: 40, speed: 35 },
    skills: ["heal", "buff", "lightning_bolt"],
  },
  undead_knight: {
    name: "Undead Knight",
    aiStrategy: AIStrategy.DEFENSIVE,
    stats: { hp: 180, attack: 70, defense: 60, speed: 25 },
    skills: ["dark_strike", "shield_wall", "life_drain"],
  },
  dragon_whelp: {
    name: "Dragon Whelp",
    aiStrategy: AIStrategy.BERSERKER,
    stats: { hp: 200, attack: 85, defense: 45, speed: 40 },
    skills: ["fire_breath", "tail_sweep", "wing_attack"],
  },
  forest_elemental: {
    name: "Forest Elemental",
    aiStrategy: AIStrategy.TACTICAL,
    stats: { hp: 100, attack: 55, defense: 50, speed: 60 },
    skills: ["nature_bind", "thorn_volley", "regeneration"],
  },
};

export class BattleService {
  static async createBattle(
    userId: string,
    playerCharacterIds: string[]
  ): Promise<BattleState> {
    try {
      // Get user characters from database
      const userCharacters = await CharacterService.getUserCharacters(userId);
      const characterTemplates = await Character.find({});

      // Filter user characters that match the requested IDs
      const selectedUserChars = userCharacters.filter((char) =>
        playerCharacterIds.includes(char._id.toString())
      );

      if (selectedUserChars.length === 0) {
        throw new Error("No valid player characters selected");
      }

      // Convert user characters to battle characters
      const playerCharacters: BattleCharacter[] = selectedUserChars.map(
        (userChar, index) => {
          const template = characterTemplates.find(
            (t) => t.id === userChar.characterId
          );

          return {
            id: userChar._id.toString(),
            name: template?.name || userChar.characterId,
            level: userChar.level,
            stats: {
              hp: userChar.currentStats.hp,
              maxHp: userChar.currentStats.hp,
              attack: userChar.currentStats.attack,
              defense: userChar.currentStats.defense,
              speed: userChar.currentStats.speed,
              critRate: userChar.currentStats.critRate,
              critDamage: userChar.currentStats.critDamage,
            },
            skills:
              template?.skills.map((skill) => ({
                id: skill.id,
                name: skill.name,
                description: skill.description,
                damage: 100 + userChar.level * 10,
                energyCost: skill.manaCost || 20,
                cooldown: skill.cooldown || 3,
                targeting: "single" as const,
              })) || [],
            statusEffects: [],
            currentEnergy: 100,
            maxEnergy: 100,
            position: index + 1,
            isPlayer: true,
          };
        }
      );

      // Create enhanced enemies based on player level
      const enemies = this.generateEnemies(playerCharacters);

      const battleState: BattleState = {
        id: nanoid(),
        characters: [...playerCharacters, ...enemies],
        currentTurn: 0,
        turnOrder: [],
        status: "waiting",
        log: ["⚔️ Battle commenced! Enemies approach..."],
        turn: 1,
        maxTurns: 50,
        battleRewards: this.calculatePotentialRewards(
          playerCharacters,
          enemies
        ),
      };

      // Calculate initial turn order based on speed
      battleState.turnOrder = this.calculateTurnOrder(battleState.characters);
      battleState.status = "in_progress";

      // Store battle state
      activeBattles.set(battleState.id, battleState);

      return battleState;
    } catch (error) {
      console.error("Error creating battle:", error);
      throw error;
    }
  }

  private static generateEnemies(
    playerCharacters: BattleCharacter[]
  ): BattleCharacter[] {
    const avgPlayerLevel = Math.floor(
      playerCharacters.reduce((sum, char) => sum + char.level, 0) /
        playerCharacters.length
    );

    const enemyCount = Math.min(3, Math.max(1, playerCharacters.length));
    const enemies: BattleCharacter[] = [];

    const enemyTypes = Object.keys(ENEMY_TEMPLATES);

    for (let i = 0; i < enemyCount; i++) {
      const enemyType =
        enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const template =
        ENEMY_TEMPLATES[enemyType as keyof typeof ENEMY_TEMPLATES];

      // Scale enemy stats based on player level
      const levelMultiplier = 1 + (avgPlayerLevel - 1) * 0.15;

      const enemy: BattleCharacter = {
        id: `enemy_${enemyType}_${i}`,
        name: template.name,
        level: avgPlayerLevel + Math.floor(Math.random() * 3) - 1,
        stats: {
          hp: Math.floor(template.stats.hp * levelMultiplier),
          maxHp: Math.floor(template.stats.hp * levelMultiplier),
          attack: Math.floor(template.stats.attack * levelMultiplier),
          defense: Math.floor(template.stats.defense * levelMultiplier),
          speed: template.stats.speed,
          critRate: 8 + Math.floor(Math.random() * 5),
          critDamage: 130 + Math.floor(Math.random() * 20),
        },
        skills: this.generateEnemySkills(template.skills, avgPlayerLevel),
        statusEffects: [],
        currentEnergy: 100,
        maxEnergy: 100,
        position: i + 1,
        isPlayer: false,
        aiStrategy: template.aiStrategy,
      };

      enemies.push(enemy);
    }

    return enemies;
  }

  private static generateEnemySkills(skillIds: string[], level: number) {
    const skillDatabase = {
      slash: {
        id: "slash",
        name: "🗡️ Slash",
        description: "Basic sword attack",
        damage: 60 + level * 5,
        energyCost: 15,
        cooldown: 1,
        targeting: "single" as const,
      },
      rage: {
        id: "rage",
        name: "😡 Rage",
        description: "Berserker attack with increased damage",
        damage: 80 + level * 8,
        energyCost: 25,
        cooldown: 3,
        targeting: "single" as const,
      },
      heal: {
        id: "heal",
        name: "💚 Heal",
        description: "Restore ally HP",
        healing: 50 + level * 6,
        energyCost: 30,
        cooldown: 2,
        targeting: "single" as const,
      },
      lightning_bolt: {
        id: "lightning_bolt",
        name: "⚡ Lightning Bolt",
        description: "Electric magic attack",
        damage: 70 + level * 7,
        energyCost: 35,
        cooldown: 2,
        targeting: "single" as const,
      },
      fire_breath: {
        id: "fire_breath",
        name: "🔥 Fire Breath",
        description: "Area fire attack",
        damage: 90 + level * 10,
        energyCost: 40,
        cooldown: 4,
        targeting: "all" as const,
      },
    };

    return skillIds
      .map((skillId) => skillDatabase[skillId as keyof typeof skillDatabase])
      .filter(Boolean);
  }

  private static calculatePotentialRewards(
    players: BattleCharacter[],
    enemies: BattleCharacter[]
  ) {
    const totalEnemyLevel = enemies.reduce(
      (sum, enemy) => sum + enemy.level,
      0
    );
    const avgPlayerLevel = Math.floor(
      players.reduce((sum, char) => sum + char.level, 0) / players.length
    );

    return {
      experience: Math.floor(totalEnemyLevel * 25 + Math.random() * 50),
      coins: Math.floor(totalEnemyLevel * 15 + Math.random() * 30),
      items: Math.random() > 0.7 ? ["enhancement_stone", "health_potion"] : [],
      equipments: Math.random() > 0.9 ? ["common_sword"] : [],
    };
  }

  static async getBattleState(battleId: string): Promise<BattleState> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }
    return battle;
  }

  static async performAction(
    battleId: string,
    action: BattleAction
  ): Promise<BattleResult> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }

    // Validate turn
    const currentCharacterId = battle.turnOrder[battle.currentTurn];
    if (currentCharacterId !== action.characterId) {
      throw new Error("Not this character's turn");
    }

    // Get characters
    const actor = battle.characters.find((c) => c.id === action.characterId);
    const targets = battle.characters.filter((c) =>
      action.targetIds.includes(c.id)
    );

    if (!actor || targets.length === 0) {
      throw new Error("Invalid actor or targets");
    }

    let result: BattleResult;

    // Process action
    if (action.type === "basic_attack") {
      result = this.processBasicAttack(actor, targets[0]);
    } else if (action.type === "skill") {
      const skill = actor.skills.find((s) => s.id === action.skillId);
      if (!skill) {
        throw new Error("Skill not found");
      }
      if (actor.currentEnergy < skill.energyCost) {
        throw new Error("Not enough energy");
      }
      result = this.processSkill(actor, targets, skill);
    } else {
      throw new Error("Invalid action type");
    }

    // Update battle state
    this.updateBattleState(battle, actor, targets, result);

    // Check win/lose condition
    const battleEnd = this.checkBattleEnd(battle);
    if (battleEnd) {
      battle.finalRewards = this.calculateFinalRewards(battle);
    }

    // Process enemy AI turns if battle continues
    if (battle.status === "in_progress") {
      await this.processEnemyTurns(battle);
    }

    // Update battle in store
    activeBattles.set(battleId, battle);

    return result;
  }

  private static async processEnemyTurns(battle: BattleState): Promise<void> {
    const enemies = battle.characters.filter(
      (char) => !char.isPlayer && char.stats.hp > 0
    );
    const players = battle.characters.filter(
      (char) => char.isPlayer && char.stats.hp > 0
    );

    for (const enemy of enemies) {
      if (battle.status !== "in_progress") break;

      const aiAction = this.getAIAction(enemy, players, enemies);

      if (aiAction) {
        const result = await this.executeAIAction(battle, enemy, aiAction);
        this.updateBattleState(battle, enemy, aiAction.targets, result);

        // Check if battle ended after AI action
        this.checkBattleEnd(battle);
      }
    }
  }

  private static getAIAction(
    enemy: BattleCharacter,
    players: BattleCharacter[],
    allies: BattleCharacter[]
  ) {
    const strategy = enemy.aiStrategy || AIStrategy.AGGRESSIVE;
    let target: BattleCharacter | null = null;
    let skill = null;

    switch (strategy) {
      case AIStrategy.AGGRESSIVE:
        // Target highest HP or highest attack player
        target = players.reduce((prev, current) =>
          prev.stats.attack > current.stats.attack ? prev : current
        );
        // Use strongest available skill
        skill =
          enemy.skills.find(
            (s) => s.damage && enemy.currentEnergy >= s.energyCost
          ) || enemy.skills[0];
        break;

      case AIStrategy.TACTICAL:
        // Target lowest HP player
        target = players.reduce((prev, current) =>
          prev.stats.hp < current.stats.hp ? prev : current
        );
        skill =
          enemy.skills.find((s) => enemy.currentEnergy >= s.energyCost) ||
          enemy.skills[0];
        break;

      case AIStrategy.DEFENSIVE:
        // Heal allies if they're hurt, otherwise attack
        const hurtAlly = allies.find(
          (ally) => ally.stats.hp < ally.stats.maxHp * 0.5
        );
        if (hurtAlly && enemy.skills.some((s) => s.healing)) {
          target = hurtAlly;
          skill = enemy.skills.find((s) => s.healing);
        } else {
          target = players[Math.floor(Math.random() * players.length)];
          skill = enemy.skills.find((s) => s.damage) || enemy.skills[0];
        }
        break;

      case AIStrategy.BERSERKER:
        // Always use most powerful attack regardless of cost
        target = players[Math.floor(Math.random() * players.length)];
        skill = enemy.skills.sort(
          (a, b) => (b.damage || 0) - (a.damage || 0)
        )[0];
        break;

      case AIStrategy.SUPPORT:
        // Prioritize buffing and healing allies
        const needsHeal = allies.find(
          (ally) => ally.stats.hp < ally.stats.maxHp * 0.7
        );
        if (needsHeal && enemy.skills.some((s) => s.healing)) {
          target = needsHeal;
          skill = enemy.skills.find((s) => s.healing);
        } else {
          target = players[Math.floor(Math.random() * players.length)];
          skill = enemy.skills.find((s) => s.damage) || enemy.skills[0];
        }
        break;

      default:
        target = players[Math.floor(Math.random() * players.length)];
        skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    }

    if (!target || !skill) return null;

    return {
      type: skill.damage ? "skill" : "basic_attack",
      characterId: enemy.id,
      targets: [target],
      skill: skill,
    };
  }

  private static async executeAIAction(
    battle: BattleState,
    enemy: BattleCharacter,
    aiAction: any
  ): Promise<BattleResult> {
    if (aiAction.type === "skill") {
      return this.processSkill(enemy, aiAction.targets, aiAction.skill);
    } else {
      return this.processBasicAttack(enemy, aiAction.targets[0]);
    }
  }

  private static calculateTurnOrder(characters: BattleCharacter[]): string[] {
    return characters
      .filter((char) => char.stats.hp > 0)
      .sort((a, b) => b.stats.speed - a.stats.speed)
      .map((c) => c.id);
  }

  private static processBasicAttack(
    attacker: BattleCharacter,
    target: BattleCharacter
  ): BattleResult {
    const isCritical = Math.random() * 100 < attacker.stats.critRate;
    let damage =
      attacker.stats.attack *
      (1 - target.stats.defense / (100 + target.stats.defense));

    // Add damage variance (±15%)
    const variance = 0.85 + Math.random() * 0.3;
    damage *= variance;

    if (isCritical) {
      damage *= attacker.stats.critDamage / 100;
    }

    return {
      damage: Math.round(Math.max(1, damage)),
      isCritical,
      energyChange: 10,
    };
  }

  private static processSkill(
    actor: BattleCharacter,
    targets: BattleCharacter[],
    skill: any
  ): BattleResult {
    const result: BattleResult = {
      statusEffectsApplied: [],
      energyChange: -skill.energyCost,
    };

    if (skill.damage) {
      const isCritical = Math.random() * 100 < actor.stats.critRate;
      let damage = skill.damage * (1 + actor.stats.attack / 200);

      // Add skill damage variance
      const variance = 0.9 + Math.random() * 0.2;
      damage *= variance;

      if (isCritical) {
        damage *= actor.stats.critDamage / 100;
      }

      result.damage = Math.round(Math.max(1, damage));
      result.isCritical = isCritical;
    }

    if (skill.healing) {
      result.healing = Math.round(skill.healing * (1 + Math.random() * 0.2));
    }

    if (skill.statusEffects) {
      result.statusEffectsApplied = skill.statusEffects;
    }

    return result;
  }

  private static updateBattleState(
    battle: BattleState,
    actor: BattleCharacter,
    targets: BattleCharacter[],
    result: BattleResult
  ): void {
    // Set default values if not set
    if (!battle.difficulty) {
      battle.difficulty = "normal";
    }
    if (!battle.battleType) {
      battle.battleType = "pve";
    }

    // Update HP
    if (result.damage) {
      targets.forEach((target) => {
        target.stats.hp = Math.max(0, target.stats.hp - result.damage!);
      });
    }

    if (result.healing) {
      targets.forEach((target) => {
        target.stats.hp = Math.min(
          target.stats.maxHp,
          target.stats.hp + result.healing!
        );
      });
    }

    // Update energy
    if (result.energyChange) {
      actor.currentEnergy = Math.min(
        actor.maxEnergy,
        Math.max(0, actor.currentEnergy + result.energyChange)
      );
    }

    // Apply status effects
    if (result.statusEffectsApplied) {
      targets.forEach((target) => {
        target.statusEffects.push(...result.statusEffectsApplied!);
      });
    }

    // Increment turn counter
    battle.turn += 1;

    // Add to battle log
    battle.log.push(this.generateLogMessage(actor, targets, result));
  }

  private static checkBattleEnd(battle: BattleState): boolean {
    const allPlayersDead = battle.characters
      .filter((c) => c.isPlayer)
      .every((c) => c.stats.hp <= 0);

    const allEnemiesDead = battle.characters
      .filter((c) => !c.isPlayer)
      .every((c) => c.stats.hp <= 0);

    if (allPlayersDead) {
      battle.status = "completed";
      battle.winner = "enemy";
      return true;
    } else if (allEnemiesDead) {
      battle.status = "completed";
      battle.winner = "player";
      return true;
    }
    return false;
  }

  private static generateLogMessage(
    actor: BattleCharacter,
    targets: BattleCharacter[],
    result: BattleResult
  ): string {
    let message = `${actor.name} `;

    if (result.damage) {
      message += `deals ${result.damage} damage to ${targets
        .map((t) => t.name)
        .join(", ")}`;
      if (result.isCritical) {
        message += " (Critical Hit!)";
      }
    } else if (result.healing) {
      message += `heals ${targets.map((t) => t.name).join(", ")} for ${
        result.healing
      } HP`;
    }

    if (result.statusEffectsApplied && result.statusEffectsApplied.length > 0) {
      message += ` and applies ${result.statusEffectsApplied
        .map((e) => e.name)
        .join(", ")}`;
    }

    return message;
  }

  private static calculateFinalRewards(battle: BattleState) {
    const combatStats = BattleRewardsService.calculateCombatStatistics(battle);
    return BattleRewardsService.calculateBattleRewards(battle, combatStats);
  }

  // Add method to complete battle and distribute rewards
  static async completeBattle(
    battleId: string,
    userId: string
  ): Promise<BattleRewards | null> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }

    if (battle.status !== "completed") {
      throw new Error("Battle is not completed yet");
    }

    if (!battle.finalRewards) {
      throw new Error("Battle rewards not calculated");
    }

    try {
      // Get player character IDs
      const playerCharacterIds = battle.characters
        .filter((c) => c.isPlayer)
        .map((c) => c.id);

      // Distribute rewards to user
      await BattleRewardsService.distributeBattleRewards(
        userId,
        playerCharacterIds,
        battle.finalRewards
      );

      // Remove battle from active battles
      activeBattles.delete(battleId);

      return battle.finalRewards;
    } catch (error) {
      console.error("Error completing battle:", error);
      throw new Error("Failed to complete battle and distribute rewards");
    }
  }
}
