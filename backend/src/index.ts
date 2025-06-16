import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { ENV } from "./config/env";
import { configureRoutes } from "./config/routes";
import { app } from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
