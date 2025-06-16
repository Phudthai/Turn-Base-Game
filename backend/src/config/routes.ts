import { Elysia } from "elysia";
import { authRoutes } from "../routes/auth.routes";
import { gachaRoutes } from "../routes/gacha.routes";
import { battleRoutes } from "../routes/battle.routes";
import { inventoryRoutes } from "../routes/inventory.routes";
import { dataRoutes } from "../routes/data.routes";

export const configureRoutes = (app: Elysia) => {
  return app
    .get("/", () => "Welcome to Idle: Picoen API")
    .get("/health", () => ({
      status: "OK",
      timestamp: new Date().toISOString(),
    }))
    .group("/api", (app) => {
      return app
        .use(authRoutes)
        .use(gachaRoutes)
        .use(battleRoutes)
        .use(inventoryRoutes)
        .use(dataRoutes);
    });
};
