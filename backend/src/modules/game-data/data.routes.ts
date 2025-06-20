import { Elysia } from "elysia";
import { DataController } from "../controllers/data.controller";

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
  .post("/items/bulk", DataController.bulkAddItems);
