import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { InventoryController } from "../controllers/inventory.controller";

export const inventoryRoutes = new Elysia({ prefix: "/inventory" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    return InventoryController.getUserInventory({ user });
  })
  .get("/characters", async ({ user }) => {
    return InventoryController.getCharacters({ user });
  })
  .get("/pets", async ({ user }) => {
    return InventoryController.getPets({ user });
  })
  .get("/items", async ({ user }) => {
    return InventoryController.getItems({ user });
  });
