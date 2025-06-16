import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../config/env";
import type { User } from "../models/user.model";

export const generateToken = async (payload: Omit<User, "password">) => {
  const secret = new TextEncoder().encode(ENV.JWT_SECRET);
  return await new SignJWT({
    ...payload,
    // Add any additional claims here
    iss: "idle-picoen",
    aud: "game-client",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  const secret = new TextEncoder().encode(ENV.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
};
