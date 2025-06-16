import { BattleService } from "../services/battle.service";
import { BattleAction } from "../types/battle.types";

export const startBattle = async ({
  body,
}: {
  body: { characterIds: string[] };
}) => {
  try {
    const battleState = await BattleService.createBattle(body.characterIds);
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
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
