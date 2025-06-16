import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../config/env";

export const generateToken = async (payload: {
  id: string;
  username: string;
  level?: number;
  experience?: number;
  currency?: any;
}) => {
  const secret = new TextEncoder().encode(ENV.JWT_SECRET);
  return await new SignJWT({
    id: payload.id,
    username: payload.username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  })
    .setProtectedHeader({ alg: "HS256" })
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
