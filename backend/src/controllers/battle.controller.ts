import { BattleService } from "../services/battle.service";
import { BattleAction } from "../types/battle.types";

export const startBattle = async ({
  body,
  user,
}: {
  body: {
    characterIds: string[];
    difficulty?: "easy" | "normal" | "hard" | "nightmare";
    battleType?: "pve" | "pvp" | "boss" | "dungeon";
  };
  user: any;
}) => {
  try {
    const battleState = await BattleService.createBattle(
      user.id,
      body.characterIds
    );

    // Set optional battle parameters
    if (body.difficulty) {
      battleState.difficulty = body.difficulty;
    }
    if (body.battleType) {
      battleState.battleType = body.battleType;
    }

    return {
      success: true,
      data: battleState,
      message: `🎮 Battle started with ${
        battleState.characters.filter((c) => !c.isPlayer).length
      } enemies!`,
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
    const rewards = await BattleService.completeBattle(
      params.battleId,
      user.id
    );

    if (!rewards) {
      return {
        success: false,
        error: "No rewards to distribute",
      };
    }

    return {
      success: true,
      data: rewards,
      message: `🎉 Battle completed! Gained ${rewards.experience} EXP and ${rewards.coins} coins!`,
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
      totalDamageDealt: 0, // Would be tracked during battle
      averagePlayerHealth:
        playerChars.reduce(
          (sum, char) => sum + char.stats.hp / char.stats.maxHp,
          0
        ) / playerChars.length,
      difficulty: battleState.difficulty,
      battleType: battleState.battleType,
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
