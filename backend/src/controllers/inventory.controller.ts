import { UserService } from "../services/user.service";
import { CharacterService } from "../services/character.service";
import { ItemService } from "../services/item.service";
import { PetService } from "../services/pet.service";
import { EquipmentService } from "../services/equipment.service";
import { Character } from "../models/character.model";
import { Pet } from "../models/pet.model";
import { Equipment } from "../models/equipment.model";

export class InventoryController {
  static async getUserInventory({ user }: { user: any }) {
    try {
      console.log("🎒 Getting inventory for user:", user.id);

      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Get user's characters, pets, and items from normalized tables
      console.log("🎒 Fetching characters...");
      const userCharacters = await CharacterService.getUserCharacters(user.id);
      console.log("🎒 Characters found:", userCharacters.length);

      // Get character templates for rarity information
      const characterIds = userCharacters.map((char) => char.characterId);
      const characterTemplates = await Character.find({
        id: { $in: characterIds },
      });
      const characterTemplateMap = new Map(
        characterTemplates.map((template) => [template.id, template])
      );

      console.log("🎒 Fetching pets...");
      const userPets = await PetService.getUserPets(user.id);
      console.log("🎒 Pets found:", userPets.length);
      console.log(
        "🎒 Pets data:",
        userPets.map((p) => ({ id: p.petId, level: p.level }))
      );

      // Get pet templates for rarity information
      const petIds = userPets.map((pet) => pet.petId);
      const petTemplates = await Pet.find({ id: { $in: petIds } });
      const petTemplateMap = new Map(
        petTemplates.map((template) => [template.id, template])
      );

      console.log("🎒 Fetching items...");
      const userItemsWithTemplates =
        await ItemService.getUserItemsWithTemplates(user.id);

      const items = userItemsWithTemplates.map((itemData) => ({
        id: itemData.userItem.itemId,
        name: itemData.template?.name || "Unknown Item",
        description: itemData.template?.description || "",
        rarity: itemData.template?.rarity || "R",
        type: itemData.template?.type || "consumable",
        subType: itemData.template?.subType || "other",
        quantity: itemData.userItem.quantity,
        isLocked: itemData.userItem.metadata.isLocked,
        obtainedAt: itemData.userItem.metadata.obtainedAt.toISOString(),
        obtainedFrom: itemData.userItem.metadata.obtainedFrom,
        artwork: itemData.template?.artwork || { icon: "📦", thumbnail: "📦" },
        effects: itemData.template?.effects || [],
        sellPrice: itemData.template?.sellPrice || 0,
        stackLimit: itemData.template?.stackLimit || 1,
        tradeable: itemData.template?.tradeable || false,
      }));

      console.log("🎒 Items found:", items.length);

      console.log("🎒 Fetching equipments...");
      const userEquipments = await EquipmentService.getUserEquipments(user.id);
      console.log("🎒 Equipments found:", userEquipments.length);

      // Get equipment templates for rarity information
      const equipmentIds = userEquipments.map((eq) => eq.equipmentId);
      const equipmentTemplates = await Equipment.find({
        id: { $in: equipmentIds },
      });
      const equipmentTemplateMap = new Map(
        equipmentTemplates.map((template) => [template.id, template])
      );

      const equipments = userEquipments.map((eq) => {
        const template = equipmentTemplateMap.get(eq.equipmentId);
        return {
          id: eq.equipmentId,
          _id: eq._id.toString(),
          name: template?.name || eq.equipmentId,
          description: template?.description || "",
          rarity: template?.rarity || "R",
          type: template?.type || "weapon",
          subType: template?.subType || "sword",
          enhancementLevel: eq.enhancementLevel,
          isLocked: eq.isLocked,
          equippedTo: eq.equippedTo,
          equippedSlot: eq.equippedSlot,
          obtainedAt: eq.obtainedAt?.toISOString(),
          obtainedFrom: eq.obtainedFrom,
          baseStats: template?.baseStats || {},
          allowedClasses: template?.allowedClasses || [],
        };
      });

      return {
        characters: userCharacters.map((char) => {
          // Calculate power level manually since it's a virtual property
          const stats = char.currentStats;
          const powerLevel = Math.floor(
            stats.hp * 0.3 +
              stats.attack * 0.4 +
              stats.defense * 0.2 +
              stats.speed * 0.1
          );

          // Get rarity and name from character template
          const template = characterTemplateMap.get(char.characterId);
          const rarity = template?.rarity || "R";
          const name = template?.name || char.characterId;

          return {
            id: char.characterId,
            _id: char._id.toString(),
            name: name,
            level: char.level,
            experience: char.experience,
            powerLevel: powerLevel,
            rarity: rarity,
            isFavorite: char.metadata.isFavorite,
            isLocked: char.metadata.isLocked,
            obtainedAt: char.metadata.obtainedAt,
          };
        }),
        pets: userPets.map((pet) => {
          // Get rarity and name from pet template
          const template = petTemplateMap.get(pet.petId);
          const rarity = template?.rarity || "R";
          const name = template?.name || pet.petId;

          return {
            id: pet.petId,
            name: name,
            level: pet.level,
            experience: pet.experience,
            rarity: rarity,
            isActive: pet.metadata.isActive,
            isFavorite: pet.metadata.isFavorite,
            isLocked: pet.metadata.isLocked,
            obtainedAt: pet.metadata.obtainedAt,
          };
        }),
        items: items,
        equipments: equipments,
        total: userCharacters.length + userPets.length + items.length + equipments.length,
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
        characters: characters.map((char) => {
          // Calculate power level manually since it's a virtual property
          const stats = char.currentStats;
          const powerLevel = Math.floor(
            stats.hp * 0.3 +
              stats.attack * 0.4 +
              stats.defense * 0.2 +
              stats.speed * 0.1
          );

          return {
            id: char._id,
            characterId: char.characterId,
            level: char.level,
            experience: char.experience,
            currentStats: char.currentStats,
            powerLevel: powerLevel,
            evolution: char.evolution,
            equipments: char.equipments,
            battleStats: char.battleStats,
            metadata: char.metadata,
          };
        }),
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

      const pets = await PetService.getUserPets(user.id);

      return {
        pets: pets.map((pet) => ({
          id: pet._id,
          petId: pet.petId,
          level: pet.level,
          experience: pet.experience,
          currentStats: pet.currentStats,
          skillLevels: pet.skillLevels,
          evolution: pet.evolution,
          bonusEffects: pet.bonusEffects,
          battleStats: pet.battleStats,
          metadata: pet.metadata,
        })),
        total: pets.length,
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

  // NEW: Grid View Methods (Compact Data)
  static async getInventoryGrid({ user }: { user: any }) {
    try {
      console.log("🎒 Getting inventory grid for user:", user.id);

      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Get compact data for all types
      const [charactersGrid, petsGrid, itemsGrid] = await Promise.all([
        this.getCharactersGrid({ user }),
        this.getPetsGrid({ user }),
        this.getItemsGrid({ user }),
      ]);

      return {
        characters: charactersGrid.characters,
        pets: petsGrid.pets,
        items: itemsGrid.items,
        total: charactersGrid.total + petsGrid.total + itemsGrid.total,
      };
    } catch (error) {
      console.error("Error getting inventory grid:", error);
      throw error;
    }
  }

  static async getCharactersGrid({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const userCharacters = await CharacterService.getUserCharacters(user.id);

      // Get character templates for basic info
      const characterIds = userCharacters.map((char) => char.characterId);
      const characterTemplates = await Character.find({
        id: { $in: characterIds },
      });
      const characterTemplateMap = new Map(
        characterTemplates.map((template) => [template.id, template])
      );

      return {
        characters: userCharacters.map((char) => {
          const template = characterTemplateMap.get(char.characterId);

          return {
            id: char._id.toString(),
            characterId: char.characterId,
            name: template?.name || char.characterId,
            rarity: template?.rarity || "R",
            level: char.level,
            isLocked: char.metadata.isLocked,
            isFavorite: char.metadata.isFavorite,
            artwork: template?.artwork || { icon: "👤", thumbnail: "👤" },
          };
        }),
        total: userCharacters.length,
      };
    } catch (error) {
      console.error("Error getting characters grid:", error);
      throw error;
    }
  }

  static async getPetsGrid({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const userPets = await PetService.getUserPets(user.id);

      // Get pet templates for basic info
      const petIds = userPets.map((pet) => pet.petId);
      const petTemplates = await Pet.find({ id: { $in: petIds } });
      const petTemplateMap = new Map(
        petTemplates.map((template) => [template.id, template])
      );

      return {
        pets: userPets.map((pet) => {
          const template = petTemplateMap.get(pet.petId);

          return {
            id: pet._id.toString(),
            petId: pet.petId,
            name: template?.name || pet.petId,
            rarity: template?.rarity || "R",
            level: pet.level,
            isLocked: pet.metadata.isLocked,
            isFavorite: pet.metadata.isFavorite,
            isActive: pet.metadata.isActive,
            artwork: template?.artwork || { icon: "🐾", thumbnail: "🐾" },
          };
        }),
        total: userPets.length,
      };
    } catch (error) {
      console.error("Error getting pets grid:", error);
      throw error;
    }
  }

  static async getItemsGrid({ user }: { user: any }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const userItemsWithTemplates =
        await ItemService.getUserItemsWithTemplates(user.id);

      return {
        items: userItemsWithTemplates.map(({ userItem, template }) => {
          // Get type abbreviation
          const getTypeAbbr = (type: string) => {
            switch (type) {
              case "consumable":
                return "CON";
              case "material":
                return "MAT";
              case "enhancement":
                return "ENH";
              case "currency":
                return "CUR";
              case "special":
                return "SPE";
              default:
                return "ITM";
            }
          };

          return {
            id: userItem._id.toString(),
            itemId: userItem.itemId,
            name: template?.name || "Unknown Item",
            rarity: template?.rarity || "R",
            type: template?.type || "consumable",
            typeAbbr: getTypeAbbr(template?.type || "consumable"),
            quantity: userItem.quantity,
            isLocked: userItem.metadata.isLocked,
            artwork: template?.artwork || { icon: "📦", thumbnail: "📦" },
          };
        }),
        total: userItemsWithTemplates.length,
      };
    } catch (error) {
      console.error("Error getting items grid:", error);
      throw error;
    }
  }

  // NEW: Detail View Methods (Full Data)
  static async getCharacterDetail({
    user,
    characterId,
  }: {
    user: any;
    characterId: string;
  }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const userCharacter = await CharacterService.getUserCharacterById(
        user.id,
        characterId
      );
      if (!userCharacter) {
        throw new Error("Character not found");
      }

      // Get character template for full info
      const template = await Character.findOne({
        id: userCharacter.characterId,
      });

      // Calculate power level
      const stats = userCharacter.currentStats;
      const powerLevel = Math.floor(
        stats.hp * 0.3 +
          stats.attack * 0.4 +
          stats.defense * 0.2 +
          stats.speed * 0.1
      );

      return {
        character: {
          id: userCharacter._id.toString(),
          characterId: userCharacter.characterId,
          name: template?.name || userCharacter.characterId,
          description: template?.lore || "",
          rarity: template?.rarity || "R",
          level: userCharacter.level,
          experience: userCharacter.experience,
          currentStats: userCharacter.currentStats,
          powerLevel: powerLevel,
          evolution: userCharacter.evolution,
          equipments: userCharacter.equipments,
          battleStats: userCharacter.battleStats,
          skills: template?.skills || [],
          artwork: template?.artwork || {
            icon: "👤",
            thumbnail: "👤",
            fullImage: "👤",
          },
          metadata: {
            ...userCharacter.metadata,
            obtainedAt: userCharacter.metadata.obtainedAt.toISOString(),
          },
          template: template
            ? {
                baseStats: template.baseStats,
                growthRates: template.growthRates,
                maxLevel: template.maxLevel,
                element: template.element,
              }
            : null,
        },
      };
    } catch (error) {
      console.error("Error getting character detail:", error);
      throw error;
    }
  }

  static async getPetDetail({ user, petId }: { user: any; petId: string }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Find user pet by _id instead of petId
      const userPet = await PetService.getPetWithTemplate(petId);
      if (!userPet) {
        throw new Error("Pet not found");
      }

      return {
        pet: {
          id: userPet.userPet._id.toString(),
          petId: userPet.userPet.petId,
          name: userPet.template?.name || userPet.userPet.petId,
          description: userPet.template?.lore || "",
          rarity: userPet.template?.rarity || "R",
          level: userPet.userPet.level,
          experience: userPet.userPet.experience,
          currentStats: userPet.userPet.currentStats,
          skillLevels: userPet.userPet.skillLevels,
          evolution: userPet.userPet.evolution,
          bonusEffects: userPet.userPet.bonusEffects,
          battleStats: userPet.userPet.battleStats,
          skills: userPet.template?.skills || [],
          artwork: userPet.template?.artwork || {
            icon: "🐾",
            thumbnail: "🐾",
            fullImage: "🐾",
          },
          metadata: {
            ...userPet.userPet.metadata,
            obtainedAt: userPet.userPet.metadata.obtainedAt.toISOString(),
          },
          template: userPet.template
            ? {
                baseStats: userPet.template.baseStats,
                bonuses: userPet.template.bonuses,
                maxLevel: userPet.template.maxLevel,
                element: userPet.template.element,
                petType: userPet.template.petType,
              }
            : null,
        },
      };
    } catch (error) {
      console.error("Error getting pet detail:", error);
      throw error;
    }
  }

  static async getItemDetail({ user, itemId }: { user: any; itemId: string }) {
    try {
      const currentUser = await UserService.findUserById(user.id);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Find user item by _id
      const userItem = await ItemService.getUserItems(user.id);
      const targetUserItem = userItem.find(
        (item) => item._id.toString() === itemId
      );

      if (!targetUserItem) {
        throw new Error("Item not found");
      }

      // Get item template for full info
      const template = await ItemService.getItemById(targetUserItem.itemId);

      return {
        item: {
          id: targetUserItem._id.toString(),
          itemId: targetUserItem.itemId,
          name: template?.name || "Unknown Item",
          description: template?.description || "",
          rarity: template?.rarity || "R",
          type: template?.type || "consumable",
          subType: template?.subType || "other",
          quantity: targetUserItem.quantity,
          stackLimit: template?.stackLimit || 999,
          sellPrice: template?.sellPrice || 0,
          tradeable: template?.tradeable || false,
          effects: template?.effects || [],
          artwork: template?.artwork || {
            icon: "📦",
            thumbnail: "📦",
            fullImage: "📦",
          },
          metadata: {
            ...targetUserItem.metadata,
            obtainedAt: targetUserItem.metadata.obtainedAt.toISOString(),
          },
        },
      };
    } catch (error) {
      console.error("Error getting item detail:", error);
      throw error;
    }
  }
}
