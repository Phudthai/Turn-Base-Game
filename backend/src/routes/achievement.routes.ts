import { Elysia, t } from "elysia";
import * as AchievementController from "../controllers/achievement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const achievementRoutes = new Elysia({ prefix: "/achievements" })
  .use(authMiddleware)

  // Get achievement categories
  .get("/categories", async () => {
    return AchievementController.getAchievementCategories();
  })

  // Get all achievements (public data)
  .get(
    "/",
    async ({ query }) => {
      return AchievementController.getAllAchievements({ query });
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        tier: t.Optional(t.String()),
        includeHidden: t.Optional(t.String()),
      }),
    }
  )

  // Get user's achievement progress
  .get(
    "/my",
    async ({ user, query }) => {
      return AchievementController.getUserAchievements({ user, query });
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        completed: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    }
  )

  // Get specific achievement progress
  .get(
    "/:achievementId/progress",
    async ({ user, params }) => {
      return AchievementController.getAchievementProgress({ user, params });
    },
    {
      params: t.Object({
        achievementId: t.String(),
      }),
    }
  )

  // Claim achievement reward
  .post(
    "/:achievementId/claim",
    async ({ user, params }) => {
      return AchievementController.claimAchievementReward({ user, params });
    },
    {
      params: t.Object({
        achievementId: t.String(),
      }),
    }
  )

  // Get achievement leaderboard
  .get(
    "/leaderboard",
    async ({ query }) => {
      return AchievementController.getAchievementLeaderboard({ query });
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  );
