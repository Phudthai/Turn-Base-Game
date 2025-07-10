import { Elysia, t } from "elysia";
import * as BattleController from "../controllers/battle.controller";
import { authMiddleware } from "../middleware/auth.middleware";

console.log("Setting up enhanced battle routes");

export const battleRoutes = new Elysia({ prefix: "/battle" })
  // Public routes (no auth required)
  .get("/enemies", async () => {
    return BattleController.getAvailableEnemies();
  })
  .get("/difficulties", async () => {
    return BattleController.getDifficultySettings();
  })

  // Protected routes (auth required)
  .use(authMiddleware)
  .post(
    "/start",
    async ({ body, user }) => {
      return BattleController.startBattle({ body, user });
    },
    {
      body: t.Object({
        characterIds: t.Array(t.String()),
        difficulty: t.Optional(
          t.Union([
            t.Literal("easy"),
            t.Literal("normal"),
            t.Literal("hard"),
            t.Literal("nightmare"),
          ])
        ),
        battleType: t.Optional(
          t.Union([
            t.Literal("pve"),
            t.Literal("pvp"),
            t.Literal("boss"),
            t.Literal("dungeon"),
          ])
        ),
        selectedEnemy: t.Optional(t.String()),
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
        type: t.Union([
          t.Literal("skill"),
          t.Literal("basic_attack"),
          t.Literal("defend"),
          t.Literal("item"),
        ]),
        characterId: t.String(),
        targetIds: t.Array(t.String()),
        skillId: t.Optional(t.String()),
        itemId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/:battleId/complete",
    async ({ params, user }) => {
      return BattleController.completeBattle({ params, user });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
    }
  )
  .get(
    "/:battleId/rewards",
    async ({ params }) => {
      return BattleController.getBattleRewards({ params });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
    }
  )
  .get(
    "/:battleId/statistics",
    async ({ params }) => {
      return BattleController.getBattleStatistics({ params });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
    }
  )

  // New: Get user's battle sessions
  .get(
    "/sessions",
    async ({ user, query }) => {
      return BattleController.getUserBattleSessions({ user, query });
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )

  // New: Abandon a battle
  .post(
    "/:battleId/abandon",
    async ({ params, user }) => {
      return BattleController.abandonBattle({ params, user });
    },
    {
      params: t.Object({
        battleId: t.String(),
      }),
    }
  );
