import { connectDatabase } from "../config/database";
import { seedDatabase } from "../data/seed-data";
import mongoose from "mongoose";

// Import all models to ensure they're registered
import { User } from "../models/user.model";
import { Character } from "../models/character.model";
import { Pet } from "../models/pet.model";
import { UserCharacter } from "../models/user-character.model";
import { UserPet } from "../models/user-pet.model";
import { UserItem } from "../models/user-item.model";

async function resetDatabase() {
  try {
    console.log("🔄 Starting database reset...");

    // Connect to database
    await connectDatabase();

    // Get all collection names
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📋 Found ${collections.length} collections to drop`);

    // Drop all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🗑️ Dropping collection: ${collectionName}`);
      await mongoose.connection.db.dropCollection(collectionName);
    }

    console.log("✅ All collections dropped successfully");

    // Create test user first
    console.log("👤 Creating test user...");
    const testUser = new User({
      username: "testuser",
      password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      level: 25,
      experience: 12500,
      currency: {
        gems: 275000,
        coins: 150000,
      },
      pity: {
        standardPity: 0,
        eventPity: 0,
        totalPulls: 0,
      },
      settings: {
        notifications: true,
        soundEnabled: true,
      },
    });

    await testUser.save();
    console.log("✅ Test user created successfully");

    // Seed fresh data
    console.log("🌱 Seeding fresh data...");
    await seedDatabase();

    console.log("🎉 Database reset and seeding completed successfully!");
    console.log("📊 Summary:");

    // Show counts
    const userCount = await User.countDocuments();
    const characterCount = await Character.countDocuments();
    const petCount = await Pet.countDocuments();
    // ไม่แสดง user data count เพราะไม่ได้ seed แล้ว
    // const userCharacterCount = await UserCharacter.countDocuments();
    // const userPetCount = await UserPet.countDocuments();

    console.log(`   👥 Users: ${userCount}`);
    console.log(`   ⚔️ Character Templates: ${characterCount}`);
    console.log(`   🐾 Pet Templates: ${petCount}`);
    // console.log(`   🎭 User Characters: ${userCharacterCount}`);
    // console.log(`   🐕 User Pets: ${userPetCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
