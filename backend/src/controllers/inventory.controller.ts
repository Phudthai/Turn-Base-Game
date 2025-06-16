import { UserService } from "../services/user.service";
import { CharacterService } from "../services/character.service";
import { ItemService } from "../services/item.service";

export class InventoryController {
  static async getUserInventory({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Get user's characters, pets, and items from normalized tables
      const characters = await CharacterService.getUserCharacters(user.id);
      const items = await ItemService.getUserItems(user.id);
      // TODO: Add pets when PetService is implemented

      return {
        characters: characters.map((char) => ({
          id: char.characterId,
          level: char.level,
          experience: char.experience,
          powerLevel: char.powerLevel,
          isFavorite: char.metadata.isFavorite,
          obtainedAt: char.metadata.obtainedAt,
        })),
        pets: [], // TODO: Implement when PetService is ready
        items: items.map((item) => ({
          id: item.itemId,
          quantity: item.quantity,
          isLocked: item.metadata.isLocked,
          obtainedAt: item.metadata.obtainedAt,
        })),
        total: characters.length + items.length,
      };
    } catch (error) {
      console.error("Error getting user inventory:", error);
      throw error;
    }
  }

  static async getCharacters({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const characters = await CharacterService.getUserCharacters(user.id);

      return {
        characters: characters.map((char) => ({
          id: char._id,
          characterId: char.characterId,
          level: char.level,
          experience: char.experience,
          currentStats: char.currentStats,
          powerLevel: char.powerLevel,
          evolution: char.evolution,
          equipments: char.equipments,
          battleStats: char.battleStats,
          metadata: char.metadata,
        })),
        total: characters.length,
      };
    } catch (error) {
      console.error("Error getting user characters:", error);
      throw error;
    }
  }

  static async getPets({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // TODO: Implement PetService
      return {
        pets: [],
        total: 0,
      };
    } catch (error) {
      console.error("Error getting user pets:", error);
      throw error;
    }
  }

  static async getItems({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const itemsWithTemplates = await ItemService.getUserItemsWithTemplates(
        user.id
      );

      return {
        items: itemsWithTemplates.map(({ userItem, template }) => ({
          id: userItem._id,
          itemId: userItem.itemId,
          name: template?.name || "Unknown Item",
          description: template?.description || "",
          rarity: template?.rarity || "R",
          type: template?.type || "other",
          quantity: userItem.quantity,
          stackLimit: template?.stackLimit || 999,
          sellPrice: template?.sellPrice || 0,
          tradeable: template?.tradeable || false,
          artwork: template?.artwork || { icon: "", thumbnail: "" },
          metadata: userItem.metadata,
        })),
        total: itemsWithTemplates.length,
      };
    } catch (error) {
      console.error("Error getting user items:", error);
      throw error;
    }
  }
}
