import { BattleService } from "../services/battle.service";
import { BattleAction } from "../types/battle.types";
import { BattleHistory, BattleSession } from "../models";
import { updateUserStatistics } from "./statistics.controller";
import { updateAchievementProgress } from "./achievement.controller";
import { nanoid } from "nanoid";
import { Character } from "../models/character.model";

export const startBattle = async ({
  body,
  user,
}: {
  body: {
    characterIds: string[];
    difficulty?: "easy" | "normal" | "hard" | "nightmare";
    battleType?: "pve" | "pvp" | "boss" | "dungeon";
    selectedEnemy?: string;
  };
  user: any;
}) => {
  try {
    const battleState = await BattleService.createBattle(
      user.id,
      body.characterIds,
      body.difficulty || "normal",
      body.selectedEnemy || "goblin"
    );

    // Set optional battle parameters
    if (body.difficulty) {
      battleState.difficulty = body.difficulty;
    }
    if (body.battleType) {
      battleState.battleType = body.battleType;
    }

    // Create battle session record
    const battleSession = new BattleSession({
      battleId: battleState.id,
      userId: user.id,
      status: "active",
      currentState: {
        turn: 1,
        phase: "battle",
        activeCharacterId: battleState.turnOrder[0],
        pendingActions: [],
      },
    });
    await battleSession.save();

    return {
      success: true,
      data: battleState,
      message: `🎮 Battle started with ${
        battleState.characters.filter((c) => !c.isPlayer).length
      } enemies! Difficulty: ${battleState.difficulty}`,
    };
  } catch (error: any) {
    console.error("Error starting battle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getBattleState = async ({
  params,
}: {
  params: { battleId: string };
}) => {
  try {
    const battleState = await BattleService.getBattleState(params.battleId);
    return {
      success: true,
      data: battleState,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const performAction = async ({
  params,
  body,
}: {
  params: { battleId: string };
  body: BattleAction;
}) => {
  try {
    const result = await BattleService.performAction(params.battleId, body);
    const updatedState = await BattleService.getBattleState(params.battleId);

    // Update battle session with latest state
    await BattleSession.findOneAndUpdate(
      { battleId: params.battleId },
      {
        lastActionAt: new Date(),
        "currentState.turn": updatedState.currentTurn + 1,
        "currentState.activeCharacterId":
          updatedState.turnOrder[updatedState.currentTurn],
        $push: {
          "currentState.pendingActions": {
            action: body,
            result: result,
            timestamp: new Date(),
          },
        },
      }
    );

    return {
      success: true,
      data: {
        result,
        battleState: updatedState,
      },
      message: result.isCritical ? "💥 Critical hit!" : undefined,
    };
  } catch (error: any) {
    console.error("Error performing battle action:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const completeBattle = async ({
  params,
  user,
}: {
  params: { battleId: string };
  user: any;
}) => {
  try {
    const battleState = await BattleService.getBattleState(params.battleId);
    // ใช้ finalRewards จาก battleState หรือคำนวณใหม่ถ้ายังไม่มี
    let rewards = battleState.finalRewards;
    if (!rewards) {
      rewards = BattleService["calculateFinalRewards"](battleState);
    }

    // Determine battle result
    const playerChars = battleState.characters.filter((c) => c.isPlayer);
    const enemyChars = battleState.characters.filter((c) => !c.isPlayer);

    const playersAlive = playerChars.filter((c) => c.stats.hp > 0).length;
    const enemiesAlive = enemyChars.filter((c) => c.stats.hp > 0).length;

    let result: "victory" | "defeat" | "draw";
    if (playersAlive > 0 && enemiesAlive === 0) {
      result = "victory";
    } else if (playersAlive === 0) {
      result = "defeat";
    } else {
      result = "draw";
    }

    // Calculate battle statistics
    const duration =
      Date.now() - new Date(battleState.startedAt || Date.now()).getTime();
    const durationInSeconds = Math.floor(duration / 1000);

    // Create battle history record
    const battleHistory = new BattleHistory({
      userId: user.id,
      battleId: params.battleId,
      battleType: battleState.battleType || "pve",
      difficulty: battleState.difficulty || "normal",

      playerCharacters: playerChars.map((char) => ({
        characterId: char.id,
        level: char.level,
        finalHp: char.stats.hp,
        maxHp: char.stats.maxHp,
        damageDealt: char.damageDealt || 0,
        damageTaken: char.damageTaken || 0,
        skillsUsed: char.skillsUsed || 0,
        criticalHits: char.criticalHits || 0,
      })),

      enemyCharacters: enemyChars.map((char) => ({
        characterId: char.id,
        name: char.name,
        level: char.level,
        defeated: char.stats.hp <= 0,
      })),

      result,
      duration: durationInSeconds,
      turnsPlayed: battleState.currentTurn + 1,
      maxTurns: 50, // Default max turns

      combatStatistics: {
        totalDamageDealt: playerChars.reduce(
          (sum, char) => sum + (char.damageDealt || 0),
          0
        ),
        totalDamageTaken: playerChars.reduce(
          (sum, char) => sum + (char.damageTaken || 0),
          0
        ),
        totalHealing: playerChars.reduce(
          (sum, char) => sum + (char.healingDone || 0),
          0
        ),
        criticalHits: playerChars.reduce(
          (sum, char) => sum + (char.criticalHits || 0),
          0
        ),
        skillsUsed: playerChars.reduce(
          (sum, char) => sum + (char.skillsUsed || 0),
          0
        ),
        perfectTurns: 0, // Would need to track during battle
        overkillDamage: 0,
      },

      rewards: {
        experience: rewards.experience || 0,
        coins: rewards.coins || 0,
        items: rewards.items || [],
        equipments: rewards.equipments || [],
        rareDrops: rewards.rareDrops || [],
      },

      eventsSummary: {
        totalActions: battleState.currentTurn + 1,
        playerActions: Math.ceil((battleState.currentTurn + 1) / 2),
        enemyActions: Math.floor((battleState.currentTurn + 1) / 2),
        healingActions: 0,
        criticalEvents: playerChars.reduce(
          (sum, char) => sum + (char.criticalHits || 0),
          0
        ),
      },

      metadata: {
        completedAt: new Date(),
        gameVersion: "1.0.0",
        region: "global",
        platform: "web",
      },
    });

    await battleHistory.save();

    // Update battle session status
    await BattleSession.findOneAndUpdate(
      { battleId: params.battleId },
      {
        status: "completed",
        lastActionAt: new Date(),
      }
    );

    // Update user statistics
    await updateUserStatistics(user.id, battleHistory.toObject());

    // Update achievements
    if (result === "victory") {
      await updateAchievementProgress(user.id, "battle_wins", 1);

      // Check for perfect victory
      if (playersAlive === playerChars.length) {
        await updateAchievementProgress(user.id, "perfect_battles", 1);
      }

      // Check for speed clear (under 30 seconds)
      if (durationInSeconds <= 30) {
        await updateAchievementProgress(user.id, "speed_clear", 1);
      }
    }

    // Update critical hits achievement
    const totalCrits = playerChars.reduce(
      (sum, char) => sum + (char.criticalHits || 0),
      0
    );
    if (totalCrits > 0) {
      await updateAchievementProgress(user.id, "critical_hits", totalCrits);
    }

    return {
      success: true,
      data: {
        result,
        battleHistory: battleHistory.toObject(),
        rewards,
        statistics: {
          duration: durationInSeconds,
          turnsPlayed: battleState.currentTurn + 1,
          playersAlive,
          enemiesDefeated: enemyChars.filter((c) => c.stats.hp <= 0).length,
        },
      },
      message:
        result === "victory"
          ? "🎉 Victory! Battle completed successfully!"
          : result === "defeat"
          ? "💀 Defeat! Better luck next time!"
          : "⚖️ Draw! Close battle!",
    };
  } catch (error: any) {
    console.error("Error completing battle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getBattleRewards = async ({
  params,
}: {
  params: { battleId: string };
}) => {
  try {
    const battleState = await BattleService.getBattleState(params.battleId);

    if (battleState.status !== "completed") {
      return {
        success: false,
        error: "Battle is not completed yet",
      };
    }

    return {
      success: true,
      data: {
        potentialRewards: battleState.battleRewards,
        finalRewards: battleState.finalRewards,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getBattleStatistics = async ({
  params,
}: {
  params: { battleId: string };
}) => {
  try {
    const battleState = await BattleService.getBattleState(params.battleId);

    // Calculate battle statistics
    const playerChars = battleState.characters.filter((c) => c.isPlayer);
    const enemyChars = battleState.characters.filter((c) => !c.isPlayer);

    const statistics = {
      battleDuration: battleState.turn,
      playersAlive: playerChars.filter((c) => c.stats.hp > 0).length,
      enemiesDefeated: enemyChars.filter((c) => c.stats.hp <= 0).length,
      totalDamageDealt: playerChars.reduce(
        (sum, char) => sum + (char.damageDealt || 0),
        0
      ),
      totalDamageTaken: playerChars.reduce(
        (sum, char) => sum + (char.damageTaken || 0),
        0
      ),
      averagePlayerHealth:
        playerChars.reduce(
          (sum, char) => sum + char.stats.hp / char.stats.maxHp,
          0
        ) / playerChars.length,
      difficulty: battleState.difficulty,
      battleType: battleState.battleType,
      efficiency: battleState.efficiencyRating || 0,
      survivalRate: battleState.survivalRate || 0,
    };

    return {
      success: true,
      data: statistics,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// New: Get active battle sessions for a user
export const getUserBattleSessions = async ({
  user,
  query,
}: {
  user: any;
  query: {
    status?: string;
    limit?: string;
  };
}) => {
  try {
    const limit = parseInt(query.limit || "10");
    const filter: any = { userId: user.id };

    if (query.status) {
      filter.status = query.status;
    }

    const sessions = await BattleSession.find(filter)
      .sort({ lastActionAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: sessions,
    };
  } catch (error: any) {
    console.error("Error fetching battle sessions:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// New: Abandon a battle session
export const abandonBattle = async ({
  params,
  user,
}: {
  params: { battleId: string };
  user: any;
}) => {
  try {
    // Update battle session to abandoned
    await BattleSession.findOneAndUpdate(
      { battleId: params.battleId, userId: user.id },
      { status: "abandoned" }
    );

    return {
      success: true,
      message: "Battle abandoned successfully",
    };
  } catch (error: any) {
    console.error("Error abandoning battle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAvailableEnemies = async () => {
  try {
    // Get character data from database to use as enemies
    const characters = await Character.find({}).limit(12); // Get diverse characters as enemies

    const enemies = characters.map((char) => ({
      id: char.id,
      name: char.name,
      icon: char.artwork?.icon || "👾",
      level: Math.max(
        1,
        Math.floor(Math.random() * 10) + char.baseStats.attack / 20
      ), // Dynamic level based on stats
      description: `${char.element} ${
        char.characterType
      } - ${char.lore.substring(0, 50)}...`,
      hp: char.baseStats.hp,
      mp: Math.floor(char.baseStats.hp * 0.4), // Calculate MP from HP
      attack: char.baseStats.attack,
      defense: char.baseStats.defense,
      speed: char.baseStats.speed,
      critRate: char.baseStats.critRate,
      critDamage: char.baseStats.critDamage,
      element: char.element,
      characterType: char.characterType,
      rarity: char.rarity,
      skills: char.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        damage: char.baseStats.attack + (skill.manaCost || 20) * 2,
        type: skill.name.toLowerCase().includes("heal") ? "heal" : "attack",
        manaCost: skill.manaCost || 20,
        cooldown: skill.cooldown || 2,
      })),
    }));

    return {
      success: true,
      data: enemies,
    };
  } catch (error: any) {
    console.error("Error getting available enemies:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getDifficultySettings = async () => {
  try {
    const difficulties = [
      {
        id: "easy",
        name: "Easy",
        multiplier: 0.8,
        rewards: 0.8,
        description: "80% Stats | 80% Rewards",
        color: "#4CAF50",
      },
      {
        id: "normal",
        name: "Normal",
        multiplier: 1.0,
        rewards: 1.0,
        description: "100% Stats | 100% Rewards",
        color: "#2196F3",
      },
      {
        id: "hard",
        name: "Hard",
        multiplier: 1.3,
        rewards: 1.5,
        description: "130% Stats | 150% Rewards",
        color: "#ff9800",
      },
      {
        id: "nightmare",
        name: "Nightmare",
        multiplier: 1.6,
        rewards: 2.0,
        description: "160% Stats | 200% Rewards",
        color: "#f44336",
      },
    ];

    return {
      success: true,
      data: difficulties,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
