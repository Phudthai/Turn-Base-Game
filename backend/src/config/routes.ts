import { Elysia } from "elysia";
import {
  authRoutes,
  gachaRoutes,
  battleRoutes,
  inventoryRoutes,
  dataRoutes,
} from "../routes";

export const configureRoutes = (app: Elysia) => {
  return app
    .get("/", () => "Welcome to Idle: Picoen API")
    .get("/health", () => ({
      status: "OK",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
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
