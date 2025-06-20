import { Elysia, t } from "elysia";
import * as BattleController from "../controllers/battle.controller";
import { authMiddleware } from "../middleware/auth.middleware";

console.log("Setting up battle routes");

export const battleRoutes = new Elysia({ prefix: "/battle" })
  .use(authMiddleware)
  .post(
    "/start",
    async ({ body, user }) => {
      return BattleController.startBattle({ body, user });
    },
    {
      body: t.Object({
        characterIds: t.Array(t.String()),
      }),
    }
  )
  .get(
    "/:battleId",
    async ({ params }) => {
      return BattleController.getBattleState({ params });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
    }
  )
  .post(
    "/:battleId/action",
    async ({ params, body }) => {
      return BattleController.performAction({ params, body });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
      body: t.Object({
        type: t.Union([t.Literal("skill"), t.Literal("basic_attack")]),
        characterId: t.String(),
        targetIds: t.Array(t.String()),
        skillId: t.Optional(t.String()),
      }),
    }
  );
