import { Context } from "elysia";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";

export class AuthController {
  static async register(body: { username: string; password: string }) {
    try {
      const { username, password } = body;

      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if user already exists
      const existingUser = await UserService.findUserByUsername(username);
      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Create new user
      const newUser = await UserService.createUser(username, password);

      // Find the created user to get proper type for token generation
      const userForToken = await UserService.findUserByUsername(username);
      if (!userForToken) {
        throw new Error("Failed to create user");
      }

      // Generate token
      const token = await UserService.generateToken(userForToken);

      return {
        success: true,
        message: "User registered successfully",
        token,
        user: newUser,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  static async login(body: { username: string; password: string }) {
    try {
      const { username, password } = body;

      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Find user
      const user = await UserService.findUserByUsername(username);
      if (!user) {
        throw new Error("Invalid username or password");
      }

      // Verify password
      const isValidPassword = await UserService.verifyPassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid username or password");
      }

      // Generate token
      const token = await UserService.generateToken(user);

      // Update last login
      await UserService.updateGameProgress(user._id, {});

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          level: user.level,
          currency: user.currency,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  static async getProfile({ user }: { user: any }) {
    try {
      const profile = await UserService.getUserProfile(user.id);
      if (!profile) {
        throw new Error("User not found");
      }

      return {
        success: true,
        user: profile,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get profile",
      };
    }
  }

  static async updateProfile({
    user,
    body,
  }: {
    user: any;
    body: {
      settings?: {
        notifications?: boolean;
        soundEnabled?: boolean;
        language?: string;
        timezone?: string;
      };
    };
  }) {
    try {
      if (body.settings) {
        await UserService.updateUserSettings(user.id, body.settings);
      }

      const updatedProfile = await UserService.getUserProfile(user.id);

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedProfile,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  }

  static async changePassword({
    user,
    body,
  }: {
    user: any;
    body: { oldPassword: string; newPassword: string };
  }) {
    try {
      const { oldPassword, newPassword } = body;

      if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required");
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      const success = await UserService.changePassword(
        user.id,
        oldPassword,
        newPassword
      );

      if (!success) {
        throw new Error("Invalid old password");
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to change password",
      };
    }
  }

  static async addCurrency({
    user,
    body,
  }: {
    user: any;
    body: { gems: number; coins: number };
  }) {
    try {
      const { gems, coins } = body;
      console.log(user);
      if (!gems || !coins) {
        throw new Error("Gems and coins are required");
      }

      await UserService.addCurrency(user.id, gems, coins);

      return {
        success: true,
        message: "Currency added successfully",
      };
    } catch (error) {
      console.error("Add currency error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to add currency",
      };
    }
  }
}
