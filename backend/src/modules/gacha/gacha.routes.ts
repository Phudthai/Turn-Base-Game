import { Elysia, t } from "elysia";
import * as GachaController from "../controllers/gacha.controller";
import { authMiddleware } from "../middleware/auth.middleware";

// Add debug logs
console.log("Setting up gacha routes");

export const gachaRoutes = new Elysia({ prefix: "/gacha" })
  // Banner management (no auth required for viewing)
  .get("/banners", GachaController.getAllBanners)
  .get("/banners/active", GachaController.getActiveBanners)
  .get("/banners/:id", GachaController.getBanner)
  // Gacha pulls (require auth)
  .use(authMiddleware)
  .get(
    "/pull",
    async ({ query, user }) => {
      console.log("Route handler executing");
      console.log("User authenticated:", user);
      return GachaController.pull({ query, user });
    },
    {
      query: t.Object({
        bannerId: t.String(),
        multi: t.Optional(t.Boolean()),
      }),
    }
  );
