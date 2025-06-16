import { config } from "dotenv";

// Load environment variables
config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

// Validate required environment variables
const requiredEnvs: (keyof typeof ENV)[] = [];
for (const key of requiredEnvs) {
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
