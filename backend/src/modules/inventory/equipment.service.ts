import {
  Equipment,
  IEquipment,
  UserEquipment,
  IUserEquipment,
} from "../models/equipment.model";

export class EquipmentService {
  // Get equipment template by ID
  static async getEquipmentById(
    equipmentId: string
  ): Promise<IEquipment | null> {
    try {
      return await Equipment.findOne({ id: equipmentId });
    } catch (error) {
      console.error("Error getting equipment by ID:", error);
      throw error;
    }
  }

  // Get all equipment templates
  static async getAllEquipments(): Promise<IEquipment[]> {
    try {
      return await Equipment.find({}).sort({ rarity: -1, name: 1 });
    } catch (error) {
      console.error("Error getting all equipments:", error);
      throw error;
    }
  }

  // Create user equipment from gacha
  static async createUserEquipment(
    userId: string,
    equipmentId: string,
    obtainedFrom: string = "gacha"
  ): Promise<IUserEquipment> {
    try {
      // Get equipment template
      const equipmentTemplate = await Equipment.findOne({ id: equipmentId });
      if (!equipmentTemplate) {
        throw new Error(`Equipment template not found: ${equipmentId}`);
      }

      // Create user equipment instance
      const userEquipment = new UserEquipment({
        userId,
        equipmentId,
        enhancementLevel: 0,
        substats: [],
        isLocked: false,
        obtainedFrom,
        obtainedAt: new Date(),
      });

      const savedEquipment = await userEquipment.save();
      console.log(`Created user equipment: ${equipmentId} for user: ${userId}`);

      return savedEquipment;
    } catch (error) {
      console.error("Error creating user equipment:", error);
      throw error;
    }
  }

  // Get user equipments
  static async getUserEquipments(userId: string): Promise<IUserEquipment[]> {
    try {
      const userEquipments = await UserEquipment.find({ userId })
        .populate("equipmentId")
        .sort({ obtainedAt: -1 });

      return userEquipments;
    } catch (error) {
      console.error("Error getting user equipments:", error);
      throw error;
    }
  }

  // Get user's equipment count
  static async getUserEquipmentCount(userId: string): Promise<number> {
    try {
      return await UserEquipment.countDocuments({ userId });
    } catch (error) {
      console.error("Error getting user equipment count:", error);
      throw error;
    }
  }

  // Enhance equipment
  static async enhanceEquipment(
    userId: string,
    userEquipmentId: string,
    materials: any[]
  ): Promise<IUserEquipment | null> {
    try {
      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) {
        throw new Error("User equipment not found");
      }

      // Get equipment template for enhancement requirements
      const equipmentTemplate = await Equipment.findOne({
        id: userEquipment.equipmentId,
      });
      if (!equipmentTemplate) {
        throw new Error("Equipment template not found");
      }

      const currentLevel = userEquipment.enhancementLevel;
      const maxLevel = equipmentTemplate.enhancementLevels?.maxLevel || 20;

      if (currentLevel >= maxLevel) {
        throw new Error("Equipment is already at maximum level");
      }

      // TODO: Implement material checking and consumption logic
      // For now, just increment the level
      userEquipment.enhancementLevel += 1;

      const savedEquipment = await userEquipment.save();
      console.log(
        `Enhanced equipment ${userEquipmentId} to level ${savedEquipment.enhancementLevel}`
      );

      return savedEquipment;
    } catch (error) {
      console.error("Error enhancing equipment:", error);
      throw error;
    }
  }

  // Equip equipment to character
  static async equipToCharacter(
    userId: string,
    userEquipmentId: string,
    userCharacterId: string,
    slot: string
  ): Promise<IUserEquipment | null> {
    try {
      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) {
        throw new Error("User equipment not found");
      }

      // Unequip from previous character if equipped
      if (userEquipment.equippedTo) {
        // TODO: Remove from previous character's equipment slots
      }

      // Equip to new character
      userEquipment.equippedTo = userCharacterId;
      userEquipment.equippedSlot = slot;

      const savedEquipment = await userEquipment.save();
      console.log(
        `Equipped ${userEquipmentId} to character ${userCharacterId} in slot ${slot}`
      );

      return savedEquipment;
    } catch (error) {
      console.error("Error equipping equipment:", error);
      throw error;
    }
  }

  // Unequip equipment
  static async unequipEquipment(
    userId: string,
    userEquipmentId: string
  ): Promise<IUserEquipment | null> {
    try {
      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) {
        throw new Error("User equipment not found");
      }

      userEquipment.equippedTo = undefined;
      userEquipment.equippedSlot = undefined;

      const savedEquipment = await userEquipment.save();
      console.log(`Unequipped equipment ${userEquipmentId}`);

      return savedEquipment;
    } catch (error) {
      console.error("Error unequipping equipment:", error);
      throw error;
    }
  }
}
