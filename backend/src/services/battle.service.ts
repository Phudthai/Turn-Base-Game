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

// In-memory store for active battles
const activeBattles = new Map<string, BattleState>();

export class BattleService {
  static async createBattle(
    userId: string,
    playerCharacterIds: string[]
  ): Promise<BattleState> {
    try {
      // Get user characters from database
      const userCharacters = await CharacterService.getUserCharacters(userId);
      const characterTemplates = await Character.find({});

      // Filter user characters that match the requested IDs (use _id for matching)
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
                damage: 100 + userChar.level * 10, // Scale with level
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

      // Create simple enemy
      const enemy: BattleCharacter = {
        id: "enemy_goblin",
        name: "Goblin Warrior",
        level: Math.max(
          1,
          Math.floor(
            playerCharacters.reduce((sum, char) => sum + char.level, 0) /
              playerCharacters.length
          )
        ),
        stats: {
          hp: 150 + (playerCharacters[0]?.level || 1) * 20,
          maxHp: 150 + (playerCharacters[0]?.level || 1) * 20,
          attack: 80 + (playerCharacters[0]?.level || 1) * 5,
          defense: 40 + (playerCharacters[0]?.level || 1) * 3,
          speed: 70,
          critRate: 10,
          critDamage: 130,
        },
        skills: [
          {
            id: "goblin_slash",
            name: "Slash",
            description: "Basic sword attack",
            damage: 80,
            energyCost: 15,
            cooldown: 2,
            targeting: "single",
          },
        ],
        statusEffects: [],
        currentEnergy: 100,
        maxEnergy: 100,
        position: 1,
        isPlayer: false,
      };

      const battleState: BattleState = {
        id: nanoid(),
        characters: [...playerCharacters, enemy],
        currentTurn: 0,
        turnOrder: [],
        status: "waiting",
        log: ["Battle started"],
      };

      // Calculate initial turn order
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
    this.checkBattleEnd(battle);

    // Move to next turn
    battle.currentTurn = (battle.currentTurn + 1) % battle.turnOrder.length;

    // Update battle in store
    activeBattles.set(battleId, battle);

    return result;
  }

  private static calculateTurnOrder(characters: BattleCharacter[]): string[] {
    return characters
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

    if (isCritical) {
      damage *= attacker.stats.critDamage / 100;
    }

    return {
      damage: Math.round(damage),
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
      let damage = skill.damage * (1 + actor.stats.attack / 100);

      if (isCritical) {
        damage *= actor.stats.critDamage / 100;
      }

      result.damage = Math.round(damage);
      result.isCritical = isCritical;
    }

    if (skill.healing) {
      result.healing = Math.round(skill.healing);
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

    // Add to battle log
    battle.log.push(this.generateLogMessage(actor, targets, result));
  }

  private static checkBattleEnd(battle: BattleState): void {
    const allPlayersDead = battle.characters
      .filter((c) => c.isPlayer)
      .every((c) => c.stats.hp <= 0);

    const allEnemiesDead = battle.characters
      .filter((c) => !c.isPlayer)
      .every((c) => c.stats.hp <= 0);

    if (allPlayersDead) {
      battle.status = "completed";
      battle.winner = "enemy";
    } else if (allEnemiesDead) {
      battle.status = "completed";
      battle.winner = "player";
    }
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
}
