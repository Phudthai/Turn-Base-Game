import { Equipment } from "../models/equipment.model";
import { UserEquipment } from "../models/equipment.model";
import { UserCharacter } from "../models/user-character.model";

export class EquipmentController {
  // Get all equipment templates
  static async getAllEquipments() {
    try {
      const equipments = await Equipment.find({}).sort({ rarity: -1, name: 1 });

      return {
        success: true,
        equipments: equipments,
        summary: {
          total: equipments.length,
          byRarity: {
            SSR: equipments.filter((e) => e.rarity === "SSR").length,
            SR: equipments.filter((e) => e.rarity === "SR").length,
            R: equipments.filter((e) => e.rarity === "R").length,
          },
          byType: {
            weapon: equipments.filter((e) => e.type === "weapon").length,
            armor: equipments.filter((e) => e.type === "armor").length,
            accessory: equipments.filter((e) => e.type === "accessory").length,
          },
        },
      };
    } catch (error: any) {
      console.error("Error getting equipments:", error);
      return {
        success: false,
        message: error.message || "Failed to get equipments",
      };
    }
  }

  // Get user's equipment inventory
  static async getUserEquipments({ params }: { params: { userId: string } }) {
    try {
      const { userId } = params;

      const userEquipments = await UserEquipment.find({ userId }).sort({
        "metadata.obtainedAt": -1,
      });

      // Group by equipment type for easier management
      const groupedEquipments = {
        weapons: userEquipments.filter((e) =>
          e.equipmentId.startsWith("weapon_")
        ),
        armors: userEquipments.filter((e) =>
          e.equipmentId.startsWith("armor_")
        ),
        accessories: userEquipments.filter((e) =>
          e.equipmentId.startsWith("accessory_")
        ),
      };

      return {
        success: true,
        equipments: userEquipments,
        grouped: groupedEquipments,
        summary: {
          total: userEquipments.length,
          equipped: userEquipments.filter((e) => e.equippedTo).length,
          unequipped: userEquipments.filter((e) => !e.equippedTo).length,
        },
      };
    } catch (error: any) {
      console.error("Error getting user equipments:", error);
      return {
        success: false,
        message: error.message || "Failed to get user equipments",
      };
    }
  }

  // Equip item to character
  static async equipToCharacter({
    body,
  }: {
    body: { userId: string; userEquipmentId: string; userCharacterId: string };
  }) {
    try {
      const { userId, userEquipmentId, userCharacterId } = body;

      // Get the equipment and character
      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      const userCharacter = await UserCharacter.findOne({
        _id: userCharacterId,
        userId,
      });

      if (!userEquipment) {
        return {
          success: false,
          message: "Equipment not found",
        };
      }

      if (!userCharacter) {
        return {
          success: false,
          message: "Character not found",
        };
      }

      // Get equipment template to determine slot
      const equipmentTemplate = await Equipment.findOne({
        id: userEquipment.equipmentId,
      });
      if (!equipmentTemplate) {
        return {
          success: false,
          message: "Equipment template not found",
        };
      }

      // Determine which slot to equip to
      let slotToEquip: string;
      switch (equipmentTemplate.type) {
        case "weapon":
          slotToEquip = "weapon";
          break;
        case "armor":
          slotToEquip = "armor";
          break;
        case "accessory":
          // Find first available accessory slot
          if (!userCharacter.equipments.accessory1) {
            slotToEquip = "accessory1";
          } else if (!userCharacter.equipments.accessory2) {
            slotToEquip = "accessory2";
          } else {
            return {
              success: false,
              message: "All accessory slots are occupied",
            };
          }
          break;
        default:
          return {
            success: false,
            message: "Invalid equipment type",
          };
      }

      // Check if there's already equipment in that slot
      const currentEquippedId =
        userCharacter.equipments[
          slotToEquip as keyof typeof userCharacter.equipments
        ];
      if (currentEquippedId) {
        // Unequip current equipment
        await UserEquipment.findByIdAndUpdate(currentEquippedId, {
          equippedTo: null,
        });
      }

      // Equip new equipment
      await UserEquipment.findByIdAndUpdate(userEquipmentId, {
        equippedTo: userCharacterId,
      });

      // Update character's equipment slot
      const updateObj = { [`equipments.${slotToEquip}`]: userEquipmentId };
      await UserCharacter.findByIdAndUpdate(userCharacterId, updateObj);

      // Recalculate character stats
      await this.recalculateCharacterStats(userCharacterId);

      return {
        success: true,
        message: "Equipment equipped successfully",
        slotUsed: slotToEquip,
      };
    } catch (error: any) {
      console.error("Error equipping item:", error);
      return {
        success: false,
        message: error.message || "Failed to equip item",
      };
    }
  }

  // Unequip item from character
  static async unequipFromCharacter({
    body,
  }: {
    body: { userId: string; userEquipmentId: string };
  }) {
    try {
      const { userId, userEquipmentId } = body;

      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) {
        return {
          success: false,
          message: "Equipment not found",
        };
      }

      if (!userEquipment.equippedTo) {
        return {
          success: false,
          message: "Equipment is not equipped",
        };
      }

      const userCharacterId = userEquipment.equippedTo;

      // Remove equipment from character
      const userCharacter = await UserCharacter.findById(userCharacterId);
      if (userCharacter) {
        // Find which slot has this equipment
        const equipments = userCharacter.equipments;
        let slotToUpdate = "";

        if (equipments.weapon === userEquipmentId)
          slotToUpdate = "equipments.weapon";
        else if (equipments.armor === userEquipmentId)
          slotToUpdate = "equipments.armor";
        else if (equipments.accessory1 === userEquipmentId)
          slotToUpdate = "equipments.accessory1";
        else if (equipments.accessory2 === userEquipmentId)
          slotToUpdate = "equipments.accessory2";

        if (slotToUpdate) {
          await UserCharacter.findByIdAndUpdate(userCharacterId, {
            [slotToUpdate]: null,
          });
        }
      }

      // Unequip the equipment
      await UserEquipment.findByIdAndUpdate(userEquipmentId, {
        equippedTo: null,
      });

      // Recalculate character stats
      await this.recalculateCharacterStats(userCharacterId);

      return {
        success: true,
        message: "Equipment unequipped successfully",
      };
    } catch (error: any) {
      console.error("Error unequipping item:", error);
      return {
        success: false,
        message: error.message || "Failed to unequip item",
      };
    }
  }

  // Enhance equipment
  static async enhanceEquipment({
    body,
  }: {
    body: {
      userId: string;
      userEquipmentId: string;
      materialItemIds: string[];
    };
  }) {
    try {
      const { userId, userEquipmentId, materialItemIds } = body;

      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) {
        return {
          success: false,
          message: "Equipment not found",
        };
      }

      const equipmentTemplate = await Equipment.findOne({
        id: userEquipment.equipmentId,
      });
      if (!equipmentTemplate) {
        return {
          success: false,
          message: "Equipment template not found",
        };
      }

      const currentLevel = userEquipment.enhancementLevel;
      const nextLevel = currentLevel + 1;

      if (nextLevel > equipmentTemplate.enhancementLevels.maxLevel) {
        return {
          success: false,
          message: "Equipment is already at max level",
        };
      }

      // Find required materials for next level
      const levelRequirement =
        equipmentTemplate.enhancementLevels.materials.find(
          (m) => m.level === nextLevel
        );

      if (!levelRequirement) {
        return {
          success: false,
          message: "Enhancement requirements not found",
        };
      }

      // TODO: Check if user has required materials and consume them
      // For now, just enhance the equipment

      // Calculate new stats (simple formula: +10% per level)
      const baseStats = equipmentTemplate.baseStats;
      const enhancementMultiplier = 1 + nextLevel * 0.1;

      const newStats = {
        hp: Math.floor((baseStats.hp || 0) * enhancementMultiplier),
        attack: Math.floor((baseStats.attack || 0) * enhancementMultiplier),
        defense: Math.floor((baseStats.defense || 0) * enhancementMultiplier),
        speed: Math.floor((baseStats.speed || 0) * enhancementMultiplier),
        critRate: Math.floor((baseStats.critRate || 0) * enhancementMultiplier),
        critDamage: Math.floor(
          (baseStats.critDamage || 0) * enhancementMultiplier
        ),
      };

      // Update equipment
      await UserEquipment.findByIdAndUpdate(userEquipmentId, {
        enhancementLevel: nextLevel,
        currentStats: newStats,
      });

      // Recalculate character stats if equipped
      if (userEquipment.equippedTo) {
        await this.recalculateCharacterStats(userEquipment.equippedTo);
      }

      return {
        success: true,
        message: `Equipment enhanced to level ${nextLevel}`,
        newLevel: nextLevel,
        newStats: newStats,
      };
    } catch (error: any) {
      console.error("Error enhancing equipment:", error);
      return {
        success: false,
        message: error.message || "Failed to enhance equipment",
      };
    }
  }

  // Helper method to recalculate character stats
  private static async recalculateCharacterStats(userCharacterId: string) {
    try {
      const userCharacter = await UserCharacter.findById(userCharacterId);
      if (!userCharacter) return;

      const characterTemplate = await Equipment.findOne({
        id: userCharacter.characterId,
      });
      if (!characterTemplate) return;

      // Get base stats from character template
      // Note: This would need to be implemented in character.model.ts
      let totalStats = {
        hp: 100, // Base from character
        attack: 50,
        defense: 30,
        speed: 40,
        critRate: 5,
        critDamage: 100,
      };

      // Add equipment stats
      const equipmentIds = [
        userCharacter.equipments.weapon,
        userCharacter.equipments.armor,
        userCharacter.equipments.accessory1,
        userCharacter.equipments.accessory2,
      ].filter(Boolean);

      for (const equipmentId of equipmentIds) {
        const userEquipment = await UserEquipment.findById(equipmentId);
        if (userEquipment) {
          totalStats.hp += userEquipment.currentStats.hp;
          totalStats.attack += userEquipment.currentStats.attack;
          totalStats.defense += userEquipment.currentStats.defense;
          totalStats.speed += userEquipment.currentStats.speed;
          totalStats.critRate += userEquipment.currentStats.critRate;
          totalStats.critDamage += userEquipment.currentStats.critDamage;
        }
      }

      // Update character stats
      await UserCharacter.findByIdAndUpdate(userCharacterId, {
        currentStats: totalStats,
      });
    } catch (error) {
      console.error("Error recalculating character stats:", error);
    }
  }
}
