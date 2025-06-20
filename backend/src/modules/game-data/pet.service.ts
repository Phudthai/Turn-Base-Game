import { Pet, IPet } from "../models/pet.model";
import { UserPet, IUserPet } from "../models/user-pet.model";

export class PetService {
  // Get pet template by ID
  static async getPetById(petId: string): Promise<IPet | null> {
    try {
      return await Pet.findOne({ id: petId });
    } catch (error) {
      console.error("Error getting pet by ID:", error);
      throw error;
    }
  }

  // Get all pet templates
  static async getAllPets(): Promise<IPet[]> {
    try {
      return await Pet.find({}).sort({ rarity: -1, name: 1 });
    } catch (error) {
      console.error("Error getting all pets:", error);
      throw error;
    }
  }

  // Get pets by rarity
  static async getPetsByRarity(rarity: "R" | "SR" | "SSR"): Promise<IPet[]> {
    try {
      return await Pet.find({ rarity }).sort({ name: 1 });
    } catch (error) {
      console.error("Error getting pets by rarity:", error);
      throw error;
    }
  }

  // Create user pet instance from gacha
  static async createUserPet(
    userId: string,
    petId: string,
    obtainedFrom: "gacha" | "event" | "trade" | "gift" | "breeding" = "gacha"
  ): Promise<IUserPet> {
    try {
      // Get pet template
      const petTemplate = await Pet.findOne({ id: petId });
      if (!petTemplate) {
        throw new Error(`Pet template not found: ${petId}`);
      }

      // Calculate initial stats based on level 1
      const initialStats = {
        hp: petTemplate.baseStats.hp,
        attack: petTemplate.baseStats.attack,
        defense: petTemplate.baseStats.defense,
        speed: petTemplate.baseStats.speed,
      };

      // Initialize skill levels
      const skillLevels = petTemplate.skills.map((skill) => ({
        skillId: skill.id,
        level: 1,
      }));

      // Initialize bonus effects
      const bonusEffects = petTemplate.bonuses.map((bonus) => ({
        type: bonus.type,
        target: bonus.target,
        value: bonus.value,
        isActive: true,
      }));

      // Create user pet instance
      const userPet = new UserPet({
        userId,
        petId,
        level: 1,
        experience: 0,
        currentStats: initialStats,
        skillLevels,
        evolution: {
          stage: 0,
          materials: [],
        },
        bonusEffects,
        battleStats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          lastUsed: new Date(),
        },
        metadata: {
          obtainedAt: new Date(),
          obtainedFrom,
          isActive: false,
          isLocked: false,
          isFavorite: false,
          nickname: null,
        },
      });

      return await userPet.save();
    } catch (error) {
      console.error("Error creating user pet:", error);
      throw error;
    }
  }

  // Get user's pets
  static async getUserPets(userId: string): Promise<IUserPet[]> {
    try {
      return await UserPet.find({ userId }).sort({ "metadata.obtainedAt": -1 });
    } catch (error) {
      console.error("Error getting user pets:", error);
      throw error;
    }
  }

  // Get user's active pet
  static async getActivePet(userId: string): Promise<IUserPet | null> {
    try {
      return await UserPet.findOne({ userId, "metadata.isActive": true });
    } catch (error) {
      console.error("Error getting active pet:", error);
      throw error;
    }
  }

  // Set active pet
  static async setActivePet(
    userId: string,
    userPetId: string
  ): Promise<IUserPet> {
    try {
      // Deactivate all pets
      await UserPet.updateMany(
        { userId, "metadata.isActive": true },
        { $set: { "metadata.isActive": false } }
      );

      // Activate the selected pet
      const activePet = await UserPet.findByIdAndUpdate(
        userPetId,
        { $set: { "metadata.isActive": true } },
        { new: true }
      );

      if (!activePet) {
        throw new Error("Pet not found");
      }

      return activePet;
    } catch (error) {
      console.error("Error setting active pet:", error);
      throw error;
    }
  }

  // Level up pet
  static async levelUpPet(
    userPetId: string,
    experienceGained: number
  ): Promise<IUserPet> {
    try {
      const userPet = await UserPet.findById(userPetId);
      if (!userPet) {
        throw new Error("User pet not found");
      }

      const petTemplate = await Pet.findOne({ id: userPet.petId });
      if (!petTemplate) {
        throw new Error("Pet template not found");
      }

      // Add experience
      userPet.experience += experienceGained;

      // Calculate new level (simple formula)
      const experienceNeeded = userPet.level * 100;
      let newLevel = userPet.level;

      while (
        userPet.experience >= experienceNeeded &&
        newLevel < petTemplate.maxLevel
      ) {
        userPet.experience -= experienceNeeded;
        newLevel++;
      }

      // Update stats if leveled up
      if (newLevel > userPet.level) {
        const levelDiff = newLevel - userPet.level;
        userPet.level = newLevel;

        // Increase stats (simple growth)
        userPet.currentStats.hp += Math.floor(
          petTemplate.baseStats.hp * 0.05 * levelDiff
        );
        userPet.currentStats.attack += Math.floor(
          petTemplate.baseStats.attack * 0.05 * levelDiff
        );
        userPet.currentStats.defense += Math.floor(
          petTemplate.baseStats.defense * 0.05 * levelDiff
        );
        userPet.currentStats.speed += Math.floor(
          petTemplate.baseStats.speed * 0.05 * levelDiff
        );
      }

      return await userPet.save();
    } catch (error) {
      console.error("Error leveling up pet:", error);
      throw error;
    }
  }

  // Get pet with template data
  static async getPetWithTemplate(userPetId: string): Promise<{
    userPet: IUserPet;
    template: IPet;
  } | null> {
    try {
      const userPet = await UserPet.findById(userPetId);
      if (!userPet) return null;

      const template = await Pet.findOne({ id: userPet.petId });
      if (!template) return null;

      return { userPet, template };
    } catch (error) {
      console.error("Error getting pet with template:", error);
      throw error;
    }
  }
}
