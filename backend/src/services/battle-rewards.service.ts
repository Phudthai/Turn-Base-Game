import {
  BattleState,
  BattleCharacter,
  BattleRewards,
  CombatStatistics,
} from "../types/battle.types";
import { UserService } from "./user.service";
import { ItemService } from "./item.service";
import { CharacterService } from "./character.service";

export class BattleRewardsService {
  static calculateBattleRewards(
    battle: BattleState,
    playerPerformance: CombatStatistics
  ): BattleRewards {
    const playerCharacters = battle.characters.filter((c) => c.isPlayer);
    const defeatedEnemies = battle.characters.filter(
      (c) => !c.isPlayer && c.stats.hp <= 0
    );

    // Base rewards calculation
    const baseExp = this.calculateExperience(
      defeatedEnemies,
      battle.difficulty
    );
    const baseCoins = this.calculateCoins(defeatedEnemies, battle.difficulty);

    // Performance multipliers
    const perfMultiplier = this.calculatePerformanceMultiplier(
      playerPerformance,
      battle
    );

    // Calculate final rewards
    const finalExp = Math.floor(baseExp * perfMultiplier);
    const finalCoins = Math.floor(baseCoins * perfMultiplier);

    // Determine loot drops
    const itemDrops = this.calculateItemDrops(
      defeatedEnemies,
      battle.difficulty,
      perfMultiplier
    );
    const equipmentDrops = this.calculateEquipmentDrops(
      defeatedEnemies,
      battle.difficulty
    );
    const rareDrops = this.calculateRareDrops(battle, playerPerformance);

    return {
      experience: finalExp,
      coins: finalCoins,
      items: itemDrops,
      equipments: equipmentDrops,
      rare_drops: rareDrops,
    };
  }

  private static calculateExperience(
    enemies: BattleCharacter[],
    difficulty: string
  ): number {
    const baseExp = enemies.reduce((total, enemy) => {
      return total + enemy.level * 15 + enemy.stats.maxHp / 10;
    }, 0);

    const difficultyMultiplier =
      {
        easy: 0.8,
        normal: 1.0,
        hard: 1.3,
        nightmare: 1.8,
      }[difficulty] || 1.0;

    return Math.floor(baseExp * difficultyMultiplier);
  }

  private static calculateCoins(
    enemies: BattleCharacter[],
    difficulty: string
  ): number {
    const baseCoins = enemies.reduce((total, enemy) => {
      return total + enemy.level * 8 + Math.floor(Math.random() * 20);
    }, 0);

    const difficultyMultiplier =
      {
        easy: 0.7,
        normal: 1.0,
        hard: 1.2,
        nightmare: 1.5,
      }[difficulty] || 1.0;

    return Math.floor(baseCoins * difficultyMultiplier);
  }

  private static calculatePerformanceMultiplier(
    performance: CombatStatistics,
    battle: BattleState
  ): number {
    let multiplier = 1.0;

    // Fast victory bonus
    if (battle.turn <= Math.floor(battle.maxTurns * 0.3)) {
      multiplier += 0.2; // +20% for quick victory
    }

    // Perfect health bonus
    const playerChars = battle.characters.filter((c) => c.isPlayer);
    const avgHealthPercent =
      playerChars.reduce((sum, char) => {
        return sum + char.stats.hp / char.stats.maxHp;
      }, 0) / playerChars.length;

    if (avgHealthPercent > 0.8) {
      multiplier += 0.15; // +15% for high health finish
    }

    // Critical hit bonus
    if (performance.criticalHits >= 5) {
      multiplier += 0.1; // +10% for many critical hits
    }

    // Damage efficiency bonus
    const damageRatio =
      performance.totalDamageDealt / Math.max(1, performance.totalDamageTaken);
    if (damageRatio > 3) {
      multiplier += 0.1; // +10% for high damage efficiency
    }

    return Math.min(2.0, multiplier); // Cap at 200%
  }

  private static calculateItemDrops(
    enemies: BattleCharacter[],
    difficulty: string,
    performanceMultiplier: number
  ): string[] {
    const drops: string[] = [];

    const baseDropChance =
      {
        easy: 0.3,
        normal: 0.4,
        hard: 0.5,
        nightmare: 0.6,
      }[difficulty] || 0.4;

    const adjustedChance = Math.min(
      0.9,
      baseDropChance * performanceMultiplier
    );

    // Common drops
    if (Math.random() < adjustedChance) {
      drops.push("health_potion");
    }

    if (Math.random() < adjustedChance * 0.8) {
      drops.push("mana_potion");
    }

    // Material drops based on enemy types
    enemies.forEach((enemy) => {
      if (enemy.name.includes("Goblin") && Math.random() < 0.3) {
        drops.push("goblin_ear");
      }
      if (enemy.name.includes("Orc") && Math.random() < 0.25) {
        drops.push("orc_tusk");
      }
      if (enemy.name.includes("Dragon") && Math.random() < 0.15) {
        drops.push("dragon_scale");
      }
      if (enemy.name.includes("Undead") && Math.random() < 0.2) {
        drops.push("bone_fragment");
      }
    });

    // Enhancement materials
    if (Math.random() < adjustedChance * 0.4) {
      drops.push("enhancement_stone");
    }

    return [...new Set(drops)]; // Remove duplicates
  }

  private static calculateEquipmentDrops(
    enemies: BattleCharacter[],
    difficulty: string
  ): string[] {
    const drops: string[] = [];

    const baseDropChance =
      {
        easy: 0.05,
        normal: 0.08,
        hard: 0.12,
        nightmare: 0.18,
      }[difficulty] || 0.08;

    // Equipment drops based on enemy level and type
    enemies.forEach((enemy) => {
      if (Math.random() < baseDropChance) {
        const equipmentRarity = this.determineEquipmentRarity(
          enemy.level,
          difficulty
        );
        const equipmentType = this.determineEquipmentType(enemy.name);
        drops.push(`${equipmentRarity}_${equipmentType}`);
      }
    });

    return drops;
  }

  private static calculateRareDrops(
    battle: BattleState,
    performance: CombatStatistics
  ): string[] {
    const rareDrops: string[] = [];

    // Perfect victory rare drop
    const playerChars = battle.characters.filter((c) => c.isPlayer);
    const allPlayersAlive = playerChars.every((char) => char.stats.hp > 0);
    const fastVictory = battle.turn <= Math.floor(battle.maxTurns * 0.2);

    if (allPlayersAlive && fastVictory && Math.random() < 0.05) {
      rareDrops.push("perfect_crystal");
    }

    // Boss-specific rare drops
    if (battle.battleType === "boss" && Math.random() < 0.1) {
      rareDrops.push("boss_fragment");
    }

    // High performance rare drops
    if (performance.criticalHits >= 10 && Math.random() < 0.03) {
      rareDrops.push("critical_gem");
    }

    return rareDrops;
  }

  private static determineEquipmentRarity(
    enemyLevel: number,
    difficulty: string
  ): string {
    let baseRarityChance = {
      easy: { R: 0.7, SR: 0.25, SSR: 0.05 },
      normal: { R: 0.6, SR: 0.3, SSR: 0.1 },
      hard: { R: 0.5, SR: 0.35, SSR: 0.15 },
      nightmare: { R: 0.4, SR: 0.4, SSR: 0.2 },
    }[difficulty] || { R: 0.6, SR: 0.3, SSR: 0.1 };

    // Level bonus for higher rarity
    if (enemyLevel >= 20) {
      baseRarityChance.SSR += 0.05;
      baseRarityChance.SR += 0.1;
      baseRarityChance.R -= 0.15;
    }

    const roll = Math.random();
    if (roll < baseRarityChance.SSR) return "ssr";
    if (roll < baseRarityChance.SSR + baseRarityChance.SR) return "sr";
    return "r";
  }

  private static determineEquipmentType(enemyName: string): string {
    const typeMap: { [key: string]: string[] } = {
      Goblin: ["sword", "dagger", "leather_armor"],
      Orc: ["axe", "mace", "heavy_armor"],
      Dragon: ["staff", "orb", "dragon_scale_armor"],
      Undead: ["bone_sword", "dark_robe", "cursed_ring"],
      Elemental: ["elemental_staff", "nature_cloak", "spirit_ring"],
    };

    for (const [type, equipment] of Object.entries(typeMap)) {
      if (enemyName.includes(type)) {
        return equipment[Math.floor(Math.random() * equipment.length)];
      }
    }

    // Default equipment types
    const defaultTypes = ["sword", "armor", "ring", "boots"];
    return defaultTypes[Math.floor(Math.random() * defaultTypes.length)];
  }

  static async distributeBattleRewards(
    userId: string,
    characterIds: string[],
    rewards: BattleRewards
  ): Promise<void> {
    try {
      // Distribute experience to characters
      for (const characterId of characterIds) {
        await CharacterService.addExperience(
          userId,
          characterId,
          Math.floor(rewards.experience / characterIds.length)
        );
      }

      // Add coins to user
      await UserService.addCurrency(userId, "coins", rewards.coins);

      // Add items to inventory
      for (const itemId of rewards.items) {
        await ItemService.addItemToUser(userId, itemId, 1);
      }

      // Add equipments to inventory
      for (const equipmentId of rewards.equipments) {
        await ItemService.addItemToUser(userId, equipmentId, 1);
      }

      // Add rare drops
      if (rewards.rare_drops) {
        for (const rareItem of rewards.rare_drops) {
          await ItemService.addItemToUser(userId, rareItem, 1);
        }
      }

      // Update user statistics
      await UserService.incrementUserStatistic(userId, "totalBattles", 1);
      await UserService.incrementUserStatistic(
        userId,
        "totalExperience",
        rewards.experience
      );
      await UserService.incrementUserStatistic(
        userId,
        "totalCoinsEarned",
        rewards.coins
      );
    } catch (error) {
      console.error("Error distributing battle rewards:", error);
      throw new Error("Failed to distribute battle rewards");
    }
  }

  static calculateCombatStatistics(battle: BattleState): CombatStatistics {
    const playerCharacters = battle.characters.filter((c) => c.isPlayer);

    // This would be enhanced to track actual combat events
    // For now, we'll calculate based on final state

    const totalDamageDealt = playerCharacters.reduce((sum, char) => {
      return sum + (char.stats.maxHp - char.stats.hp); // Simplified calculation
    }, 0);

    return {
      totalDamageDealt: totalDamageDealt,
      totalDamageTaken: playerCharacters.reduce(
        (sum, char) => sum + (char.stats.maxHp - char.stats.hp),
        0
      ),
      totalHealing: 0, // Would be tracked during battle
      criticalHits: Math.floor(Math.random() * 5), // Would be tracked during battle
      skillsUsed: Math.floor(Math.random() * 10), // Would be tracked during battle
      turnsSurvived: battle.turn,
      enemiesDefeated: battle.characters.filter(
        (c) => !c.isPlayer && c.stats.hp <= 0
      ).length,
    };
  }
}
