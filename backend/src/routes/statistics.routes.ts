import { Elysia, t } from "elysia";
import * as StatisticsController from "../controllers/statistics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const statisticsRoutes = new Elysia({ prefix: "/statistics" })
  .use(authMiddleware)

  // Get user's overall statistics
  .get("/", async ({ user }) => {
    return StatisticsController.getUserStatistics({ user });
  })

  // Get battle statistics with filters
  .get(
    "/battles",
    async ({ user, query }) => {
      return StatisticsController.getBattleStatistics({ user, query });
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        battleType: t.Optional(t.String()),
      }),
    }
  )

  // Get battle history
  .get(
    "/battles/history",
    async ({ user, query }) => {
      return StatisticsController.getBattleHistory({ user, query });
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        battleType: t.Optional(t.String()),
        result: t.Optional(t.String()),
      }),
    }
  )

  // Get performance analytics
  .get(
    "/analytics",
    async ({ user, query }) => {
      return StatisticsController.getPerformanceAnalytics({ user, query });
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
        groupBy: t.Optional(t.String()),
      }),
    }
  )

  // Get leaderboards (public)
  .get(
    "/leaderboards",
    async ({ query }) => {
      return StatisticsController.getLeaderboards({ query });
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        period: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  );
