import { Elysia } from "elysia";
import { DataController } from "../controllers/data.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";

export const dataRoutes = new Elysia({ prefix: "/data" })
  // Get all data
  .get("/", DataController.getAllData)

  // Initialize sample data
  .post("/init", DataController.initializeSampleData)

  // Clear all data
  .delete("/clear", DataController.clearAllData)

  // Add individual items
  .post("/characters", DataController.addCharacter)
  .post("/pets", DataController.addPet)
  .post("/items", DataController.addItem)
  .post("/gacha-pool", DataController.createGachaPool)

  // Bulk operations
  .post("/characters/bulk", DataController.bulkAddCharacters)
  .post("/pets/bulk", DataController.bulkAddPets)
  .post("/items/bulk", DataController.bulkAddItems)

  // Test endpoints
  .use(authMiddleware)
  .post("/add-gems", async ({ user, body }) => {
    const { gems = 1000 } = body as { gems?: number };
    await UserService.addCurrency(user.id, gems, 0);
    return {
      success: true,
      message: `Added ${gems} gems to user ${user.username}`,
    };
  });
