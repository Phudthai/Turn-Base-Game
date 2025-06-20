import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { ENV, connectDatabase } from "./core";
import { configureRoutes } from "./api";
import { seedDatabase } from "./data";
import { app } from "./app";
import { APP_CONFIG } from "./shared/constants";

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    console.log(`🎮 Starting ${APP_CONFIG.NAME} v${APP_CONFIG.VERSION}...`);

    // Connect to MongoDB first
    await connectDatabase();
    console.log("✅ Database connected successfully");

    // Seed database with initial data
    await seedDatabase();
    console.log("✅ Database seeded with initial data");

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🎯 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
