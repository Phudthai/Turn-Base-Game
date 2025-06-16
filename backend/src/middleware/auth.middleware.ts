import { Elysia } from "elysia";
import { verifyToken } from "../utils/auth";

// Create Elysia middleware using derive with scoped option
export const authMiddleware = new Elysia().derive(
  { as: "scoped" },
  async ({ headers: { authorization }, set }): Promise<{ user: any }> => {
    console.log("Auth middleware executing");

    if (!authorization) {
      set.status = 401;
      throw new Error("No token provided");
    }

    console.log("Raw Authorization:", authorization);

    // Extract token more robustly
    let token = authorization;
    if (authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    }

    console.log("Extracted Token:", token);

    try {
      const payload = await verifyToken(token);
      console.log("Token payload:", payload);

      // Return the user object directly
      return { user: payload };
    } catch (error) {
      console.error("Token verification failed:", error);
      set.status = 401;
      throw new Error("Invalid token");
    }
  }
);
