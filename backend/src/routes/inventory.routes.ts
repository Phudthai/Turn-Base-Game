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
  })
  .get("/grid", async ({ user }) => {
    return InventoryController.getInventoryGrid({ user });
  })
  .get("/grid/characters", async ({ user }) => {
    return InventoryController.getCharactersGrid({ user });
  })
  .get("/grid/pets", async ({ user }) => {
    return InventoryController.getPetsGrid({ user });
  })
  .get("/grid/items", async ({ user }) => {
    return InventoryController.getItemsGrid({ user });
  })
  .get("/character/:id", async ({ user, params }) => {
    return InventoryController.getCharacterDetail({
      user,
      characterId: params.id,
    });
  })
  .get("/pet/:id", async ({ user, params }) => {
    return InventoryController.getPetDetail({ user, petId: params.id });
  })
  .get("/item/:id", async ({ user, params }) => {
    return InventoryController.getItemDetail({ user, itemId: params.id });
  });
