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

// Difficulty settings that match frontend
const DIFFICULTY_SETTINGS = {
  easy: {
    multiplier: 0.8,
    rewards: 0.8,
    description: "Easy enemies with reduced stats",
  },
  normal: {
    multiplier: 1.0,
    rewards: 1.0,
    description: "Standard difficulty",
  },
  hard: {
    multiplier: 1.3,
    rewards: 1.5,
    description: "Stronger enemies with increased rewards",
  },
  nightmare: {
    multiplier: 1.6,
    rewards: 2.0,
    description: "Extremely challenging battles",
  },
};

// Enhanced Enemy AI Types
export enum AIStrategy {
  AGGRESSIVE = "aggressive", // Always attack strongest target
  DEFENSIVE = "defensive", // Focus on healing and buffs
  TACTICAL = "tactical", // Target weakest enemy first
  BERSERKER = "berserker", // Sacrifice HP for damage
  SUPPORT = "support", // Focus on buffing allies
}

export class BattleService {
  static async createBattle(
    userId: string,
    playerCharacterIds: string[],
    difficulty: "easy" | "normal" | "hard" | "nightmare" = "normal",
    selectedEnemy: string = "char_r_001" // Default to first character
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

          const battleChar = {
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
                currentCooldown: 0,
                targeting: "single" as const,
              })) || [],
            statusEffects: [],
            currentEnergy: 100,
            maxEnergy: 100,
            position: index + 1,
            isPlayer: true,
          };
          return battleChar;
        }
      );
      // LOG: Player characters and their skills
      console.log(
        "[BATTLE] Player characters in battle:",
        playerCharacters.map((c) => ({
          id: c.id,
          characterId: c.characterId,
          skills: c.skills.map((s) => s.id),
        }))
      );

      // Create enemies based on selected enemy character and difficulty
      const enemies = await this.generateEnemiesFromCharacter(
        selectedEnemy,
        difficulty,
        playerCharacters
      );

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
          enemies,
          difficulty
        ),
        difficulty,
        battleType: "pve",
        selectedEnemy,
        startTime: new Date(),
      };

      // Calculate initial turn order based on speed
      battleState.turnOrder = this.calculateTurnOrder(battleState.characters);
      battleState.status = "in_progress";

      // ถ้าเทิร์นแรกเป็นของ enemy ให้ AI ทำ action ทันที
      const firstTurnId = battleState.turnOrder[0];
      const firstChar = battleState.characters.find(
        (c) => c.id === firstTurnId
      );
      if (firstChar && !firstChar.isPlayer) {
        await this.processEnemyTurns(battleState);
        // Re-calculate turn order and set turn to first player
        battleState.turnOrder = this.calculateTurnOrder(battleState.characters);
        const firstPlayerIdx = battleState.turnOrder.findIndex((id) => {
          const chr = battleState.characters.find((c) => c.id === id);
          return chr?.isPlayer;
        });
        battleState.currentTurn = firstPlayerIdx >= 0 ? firstPlayerIdx : 0;
      }

      // Store battle state
      activeBattles.set(battleState.id, battleState);

      return battleState;
    } catch (error) {
      console.error("Error creating battle:", error);
      throw error;
    }
  }

  private static async generateEnemiesFromCharacter(
    enemyCharacterId: string,
    difficulty: "easy" | "normal" | "hard" | "nightmare",
    playerCharacters: BattleCharacter[]
  ): Promise<BattleCharacter[]> {
    try {
      // Get character template from database
      const enemyTemplate = await Character.findOne({ id: enemyCharacterId });
      if (!enemyTemplate) {
        throw new Error(`Character with id ${enemyCharacterId} not found`);
      }

      const difficultyData = DIFFICULTY_SETTINGS[difficulty];
      const avgPlayerLevel = Math.floor(
        playerCharacters.reduce((sum, char) => sum + char.level, 0) /
          playerCharacters.length
      );

      // Scale enemy based on player level and difficulty
      const levelMultiplier = 1 + (avgPlayerLevel - 1) * 0.1;
      const finalMultiplier = levelMultiplier * difficultyData.multiplier;

      // Determine AI strategy based on character type
      let aiStrategy = AIStrategy.AGGRESSIVE;
      switch (enemyTemplate.characterType) {
        case "tank":
          aiStrategy = AIStrategy.DEFENSIVE;
          break;
        case "healer":
          aiStrategy = AIStrategy.SUPPORT;
          break;
        case "assassin":
          aiStrategy = AIStrategy.TACTICAL;
          break;
        case "mage":
          aiStrategy = AIStrategy.BERSERKER;
          break;
        default:
          aiStrategy = AIStrategy.AGGRESSIVE;
      }

      const enemy: BattleCharacter = {
        id: `enemy_${enemyTemplate.id}`,
        name: enemyTemplate.name,
        level: Math.max(1, Math.round((avgPlayerLevel + 2) * levelMultiplier)),
        stats: {
          hp: Math.round(enemyTemplate.baseStats.hp * finalMultiplier),
          maxHp: Math.round(enemyTemplate.baseStats.hp * finalMultiplier),
          attack: Math.round(enemyTemplate.baseStats.attack * finalMultiplier),
          defense: Math.round(
            enemyTemplate.baseStats.defense * finalMultiplier
          ),
          speed: Math.round(
            enemyTemplate.baseStats.speed * (1 + (finalMultiplier - 1) * 0.5)
          ), // Speed scales less
          critRate: Math.min(
            50,
            enemyTemplate.baseStats.critRate + difficulty === "nightmare"
              ? 10
              : 5
          ),
          critDamage: Math.min(
            300,
            enemyTemplate.baseStats.critDamage + difficulty === "nightmare"
              ? 50
              : 20
          ),
        },
        skills: enemyTemplate.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          damage: Math.round(
            (enemyTemplate.baseStats.attack + (skill.manaCost || 20) * 2) *
              finalMultiplier
          ),
          energyCost: skill.manaCost || 20,
          cooldown: skill.cooldown || 2,
          currentCooldown: 0,
          targeting:
            skill.name.toLowerCase().includes("all") ||
            skill.name.toLowerCase().includes("area")
              ? "all"
              : "single",
        })),
        statusEffects: [],
        currentEnergy: Math.round(
          enemyTemplate.baseStats.hp * 0.4 * finalMultiplier
        ),
        maxEnergy: Math.round(
          enemyTemplate.baseStats.hp * 0.4 * finalMultiplier
        ),
        position: 1,
        isPlayer: false,
        aiStrategy: aiStrategy,
      };

      return [enemy];
    } catch (error) {
      console.error("Error generating enemy from character:", error);
      // Fallback to a basic enemy if character not found
      return this.generateFallbackEnemy(difficulty, playerCharacters);
    }
  }

  private static generateFallbackEnemy(
    difficulty: "easy" | "normal" | "hard" | "nightmare",
    playerCharacters: BattleCharacter[]
  ): BattleCharacter[] {
    const difficultyData = DIFFICULTY_SETTINGS[difficulty];
    const avgPlayerLevel = Math.floor(
      playerCharacters.reduce((sum, char) => sum + char.level, 0) /
        playerCharacters.length
    );

    const enemy: BattleCharacter = {
      id: "enemy_basic",
      name: "Unknown Warrior",
      level: avgPlayerLevel,
      stats: {
        hp: Math.round(600 * difficultyData.multiplier),
        maxHp: Math.round(600 * difficultyData.multiplier),
        attack: Math.round(80 * difficultyData.multiplier),
        defense: Math.round(60 * difficultyData.multiplier),
        speed: 70,
        critRate: 8,
        critDamage: 130,
      },
      skills: [
        {
          id: "basic_attack",
          name: "⚔️ Basic Attack",
          description: "Simple attack",
          damage: Math.round(80 * difficultyData.multiplier),
          energyCost: 0,
          cooldown: 1,
          currentCooldown: 0,
          targeting: "single",
        },
      ],
      statusEffects: [],
      currentEnergy: 100,
      maxEnergy: 100,
      position: 1,
      isPlayer: false,
      aiStrategy: AIStrategy.AGGRESSIVE,
    };

    return [enemy];
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
    enemies: BattleCharacter[],
    difficulty: "easy" | "normal" | "hard" | "nightmare"
  ) {
    const difficultyData = DIFFICULTY_SETTINGS[difficulty];
    const totalEnemyLevel = enemies.reduce(
      (sum, enemy) => sum + enemy.level,
      0
    );
    const avgPlayerLevel = Math.floor(
      players.reduce((sum, char) => sum + char.level, 0) / players.length
    );

    return {
      experience: Math.floor(
        totalEnemyLevel * 25 * difficultyData.rewards + Math.random() * 50
      ),
      coins: Math.floor(
        totalEnemyLevel * 15 * difficultyData.rewards + Math.random() * 30
      ),
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
      console.error("[BATTLE] Invalid actor or targets", {
        action,
        actor,
        targets,
      });
      throw new Error("Invalid actor or targets");
    }

    let result: BattleResult;

    // Process action
    if (action.type === "basic_attack") {
      result = this.processBasicAttack(actor, targets[0]);
    } else if (action.type === "skill") {
      // LOG: Skill search
      console.log(
        "[BATTLE] performAction: actor=",
        actor.name,
        "actor.skills=",
        actor.skills.map((s) => s.id),
        "action.skillId=",
        action.skillId
      );
      const skill = actor.skills.find((s) => s.id === action.skillId);
      if (!skill) {
        console.error("[BATTLE] Skill not found", {
          actor: actor.name,
          skillIds: actor.skills.map((s) => s.id),
          actionSkillId: action.skillId,
        });
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
