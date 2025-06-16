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

  // Create user equipment instance
  static async createUserEquipment(
    userId: string,
    equipmentId: string,
    obtainedFrom:
      | "gacha"
      | "event"
      | "trade"
      | "gift"
      | "craft"
      | "drop" = "gacha"
  ): Promise<IUserEquipment> {
    try {
      const equipmentTemplate = await Equipment.findOne({ id: equipmentId });
      if (!equipmentTemplate) {
        throw new Error(`Equipment template not found: ${equipmentId}`);
      }

      const userEquipment = new UserEquipment({
        userId,
        equipmentId,
        enhancementLevel: 0,
        currentStats: equipmentTemplate.baseStats,
        substats: [],
        equippedTo: null,
        metadata: {
          obtainedAt: new Date(),
          obtainedFrom,
          isLocked: false,
          isFavorite: false,
          nickname: null,
        },
      });

      return await userEquipment.save();
    } catch (error) {
      console.error("Error creating user equipment:", error);
      throw error;
    }
  }

  // Get user's equipments
  static async getUserEquipments(userId: string): Promise<IUserEquipment[]> {
    try {
      return await UserEquipment.find({ userId }).sort({
        "metadata.obtainedAt": -1,
      });
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
    materialItems: Array<{ itemId: string; quantity: number }>
  ): Promise<IUserEquipment | null> {
    try {
      const userEquipment = await UserEquipment.findOne({
        _id: userEquipmentId,
        userId,
      });

      if (!userEquipment) return null;

      const equipmentTemplate = await Equipment.findOne({
        id: userEquipment.equipmentId,
      });

      if (!equipmentTemplate) return null;

      // TODO: Implement enhancement logic
      // For now, just increment enhancement level
      if (
        userEquipment.enhancementLevel <
        equipmentTemplate.enhancementLevels.maxLevel
      ) {
        userEquipment.enhancementLevel += 1;

        // TODO: Recalculate stats based on enhancement level
        console.log(
          `🔨 Equipment enhanced to level ${userEquipment.enhancementLevel}!`
        );
      }

      return await userEquipment.save();
    } catch (error) {
      console.error("Error enhancing equipment:", error);
      throw error;
    }
  }
}
