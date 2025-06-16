import { User, IUser, UserResponse } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CharacterService } from "./character.service";
import { ItemService } from "./item.service";
import { EquipmentService } from "./equipment.service";

export class UserService {
  // Create new user
  static async createUser(
    username: string,
    password: string
  ): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        username,
        password: hashedPassword,
        level: 1,
        experience: 0,
        inventory: {
          characters: [],
          pets: [],
          items: [],
        },
        currency: {
          gems: 0, // No starting gems - use postman to add
          coins: 0, // No starting coins - use postman to add
        },
        pity: {
          standardPity: 0,
          eventPity: 0,
          totalPulls: 0,
        },
        settings: {
          notifications: true,
          soundEnabled: true,
        },
      });

      const savedUser = await newUser.save();
      return savedUser.toJSON() as UserResponse;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Find user by username
  static async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error("Error finding user by username:", error);
      throw error;
    }
  }

  // Find user by ID
  static async findUserById(id: string): Promise<UserResponse | null> {
    try {
      const user = await User.findById(id);
      return user ? (user.toJSON() as UserResponse) : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  // Verify user password
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Error verifying password:", error);
      throw error;
    }
  }

  static generateToken(user: IUser): string {
    return jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );
  }

  // Update user currency
  static async updateUserCurrency(
    userId: string,
    gems: number = 0,
    coins: number = 0
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.currency.gems = Math.max(0, user.currency.gems + gems);
      user.currency.coins = Math.max(0, user.currency.coins + coins);

      return await user.save();
    } catch (error) {
      console.error("Error updating user currency:", error);
      throw error;
    }
  }

  // Update user pity
  static async updateUserPity(
    userId: string,
    bannerType: "standard" | "event",
    newPity: number,
    incrementTotalPulls: number = 0
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      if (bannerType === "standard") {
        user.pity.standardPity = newPity;
      } else {
        user.pity.eventPity = newPity;
      }

      user.pity.totalPulls += incrementTotalPulls;
      user.statistics.totalGachaPulls += incrementTotalPulls;

      return await user.save();
    } catch (error) {
      console.error("Error updating user pity:", error);
      throw error;
    }
  }

  // Get all users (admin function)
  static async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find({}).select("-password");
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  // Update user level and experience
  static async updateUserExperience(
    userId: string,
    expGain: number
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.experience += expGain;

      // Level up logic (simple: every 1000 exp = 1 level)
      const newLevel = Math.floor(user.experience / 1000) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
        console.log(`🎉 User ${user.username} leveled up to ${newLevel}!`);
      }

      return await user.save();
    } catch (error) {
      console.error("Error updating user experience:", error);
      throw error;
    }
  }

  // Delete user (admin function)
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async updateUserLevel(
    userId: string,
    expGain: number
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.experience += expGain;

      // Calculate new level (simple formula: 100 exp per level)
      const newLevel = Math.floor(user.experience / 100) + 1;

      if (newLevel > user.level) {
        user.level = newLevel;
        console.log(`🎉 User ${user.username} leveled up to ${newLevel}!`);
      }

      return await user.save();
    } catch (error) {
      console.error("Error updating user level:", error);
      throw error;
    }
  }

  static async updateUserSettings(
    userId: string,
    settings: {
      notifications?: boolean;
      soundEnabled?: boolean;
      language?: string;
      timezone?: string;
    }
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: { settings } },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }

  static async updateUserStatistics(userId: string): Promise<IUser | null> {
    try {
      // Get counts from normalized tables
      const charactersOwned = await CharacterService.getUserCharacterCount(
        userId
      );
      const itemsOwned = await ItemService.getUserItemCount(userId);
      const equipmentsOwned = await EquipmentService.getUserEquipmentCount(
        userId
      );

      return await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "statistics.charactersOwned": charactersOwned,
            "statistics.itemsOwned": itemsOwned,
            "statistics.equipmentsOwned": equipmentsOwned,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user statistics:", error);
      throw error;
    }
  }

  static async incrementUserStatistic(
    userId: string,
    statistic: keyof IUser["statistics"],
    increment: number = 1
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { [`statistics.${statistic}`]: increment } },
        { new: true }
      );
    } catch (error) {
      console.error(`Error incrementing user statistic ${statistic}:`, error);
      throw error;
    }
  }

  static async updateGameProgress(
    userId: string,
    progress: {
      storyChapter?: number;
      arenaRank?: number;
      guildId?: string;
      totalPlayTime?: number;
    }
  ): Promise<IUser | null> {
    try {
      const updates: any = {};

      if (progress.storyChapter !== undefined) {
        updates["gameProgress.storyChapter"] = progress.storyChapter;
      }
      if (progress.arenaRank !== undefined) {
        updates["gameProgress.arenaRank"] = progress.arenaRank;
      }
      if (progress.guildId !== undefined) {
        updates["gameProgress.guildId"] = progress.guildId;
      }
      if (progress.totalPlayTime !== undefined) {
        updates["gameProgress.totalPlayTime"] = progress.totalPlayTime;
      }

      // Always update last login
      updates["gameProgress.lastLogin"] = new Date();

      return await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating game progress:", error);
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      // Update statistics before returning profile
      await this.updateUserStatistics(userId);

      // Get updated user
      const updatedUser = await User.findById(userId);

      return updatedUser?.toJSON();
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const isValidOldPassword = await this.verifyPassword(
        oldPassword,
        user.password
      );
      if (!isValidOldPassword) return false;

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  static async addCurrency(userId: string, gems: number, coins: number) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      user.currency.gems += gems;
      user.currency.coins += coins;

      await user.save();

      return user;
    } catch (error) {
      console.error("Error adding currency:", error);
      throw error;
    }
  }
}
