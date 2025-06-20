import { Elysia } from "elysia";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", async ({ body }) => {
    return AuthController.register(body);
  })
  .post("/login", async ({ body }) => {
    return AuthController.login(body);
  })
  .use(authMiddleware)
  .get("/profile", async ({ user }) => {
    return AuthController.getProfile({ user });
  })
  .put("/profile", async ({ user, body }) => {
    return AuthController.updateProfile({ user, body });
  })
  .post("/change-password", async ({ user, body }) => {
    return AuthController.changePassword({ user, body });
  })
  .post("/add-currency", async ({ user, body }) => {
    return AuthController.addCurrency({ user, body });
  });
