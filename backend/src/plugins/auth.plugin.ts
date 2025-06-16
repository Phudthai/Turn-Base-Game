import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";

// Define user type
export type User = {
  id: string;
  username: string;
  inventory: {
    characters: Array<{ id: string; count: number }>;
    pets: Array<{ id: string; count: number }>;
    items: Array<{ id: string; count: number }>;
  };
  currency: {
    gems: number;
    coins: number;
  };
  pity: {
    standardPity: number;
    eventPity: number;
    totalPulls: number;
  };
};

// Define store type
type AuthStore = {
  user: User;
};

// Define auth context type
export type AuthContext = {
  getUser: () => Promise<User>;
};

// Create auth plugin that uses the authMiddleware
export const authPlugin = authMiddleware;
