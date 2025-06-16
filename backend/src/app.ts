import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { configureRoutes } from "./config/routes";

export const app = new Elysia().use(cors()).onError(({ code, error }) => {
  if (error instanceof Error) {
    return {
      status: code === "NOT_FOUND" ? 404 : 500,
      error: error.message,
    };
  }
  return {
    status: 500,
    error: "Internal Server Error",
  };
});

// Configure all routes
configureRoutes(app);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
