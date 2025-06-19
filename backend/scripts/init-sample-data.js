import { DataController } from "../src/controllers/data.controller.js";
import { connectDatabase } from "../src/config/database.js";

async function initSampleData() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDatabase();

    console.log("🧹 Initializing sample data...");
    const result = await DataController.initializeSampleData();

    if (result.success) {
      console.log("✅ Sample data initialized successfully!");
      console.log("\n📊 Summary:");
      console.log(`Characters: ${result.summary.charactersAdded}`);
      console.log(`Pets: ${result.summary.petsAdded}`);
      console.log(`Items: ${result.summary.itemsAdded}`);
      console.log(`Equipments: ${result.summary.equipmentsAdded || 0}`);
      console.log(
        `Gacha Pool: ${result.summary.gachaPoolCreated ? "Created" : "Failed"}`
      );

      if (result.summary.breakdown) {
        console.log("\n🎯 Breakdown:");
        console.log("Characters:", result.summary.breakdown.characters);
        console.log("Pets:", result.summary.breakdown.pets);
        console.log("Items:", result.summary.breakdown.items);
        if (result.summary.breakdown.equipments) {
          console.log("Equipments:", result.summary.breakdown.equipments);
        }
      }
    } else {
      console.error("❌ Failed to initialize sample data:", result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Error during initialization:", error);
    process.exit(1);
  } finally {
    console.log("🏁 Initialization complete. Exiting...");
    process.exit(0);
  }
}

// Run the initialization
initSampleData();
 