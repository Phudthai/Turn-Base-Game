import { Character, ICharacter } from "../models/character.model";
import { UserCharacter, IUserCharacter } from "../models/user-character.model";

export class CharacterService {
  // Get character template by ID
  static async getCharacterById(
    characterId: string
  ): Promise<ICharacter | null> {
    try {
      return await Character.findOne({ id: characterId });
    } catch (error) {
      console.error("Error getting character by ID:", error);
      throw error;
    }
  }

  // Get all character templates
  static async getAllCharacters(): Promise<ICharacter[]> {
    try {
      return await Character.find({}).sort({ rarity: -1, name: 1 });
    } catch (error) {
      console.error("Error getting all characters:", error);
      throw error;
    }
  }

  // Create user character instance from gacha
  static async createUserCharacter(
    userId: string,
    characterId: string,
    obtainedFrom: "gacha" | "event" | "trade" | "gift" = "gacha"
  ): Promise<IUserCharacter> {
    try {
      // Get character template
      const characterTemplate = await Character.findOne({ id: characterId });
      if (!characterTemplate) {
        throw new Error(`Character template not found: ${characterId}`);
      }

      // Calculate initial stats based on level 1
      const initialStats = {
        hp: characterTemplate.baseStats.hp,
        attack: characterTemplate.baseStats.attack,
        defense: characterTemplate.baseStats.defense,
        speed: characterTemplate.baseStats.speed,
        critRate: characterTemplate.baseStats.critRate,
        critDamage: characterTemplate.baseStats.critDamage,
      };

      // Initialize skill levels
      const skillLevels = characterTemplate.skills.map((skill) => ({
        skillId: skill.id,
        level: 1,
      }));

      // Create user character instance
      const userCharacter = new UserCharacter({
        userId,
        characterId,
        level: 1,
        experience: 0,
        currentStats: initialStats,
        skillLevels,
        evolution: {
          stage: 0,
          materials: [],
        },
        equipments: {
          weapon: null,
          armor: null,
          accessory1: null,
          accessory2: null,
        },
        runes: [
          { slot: 1, runeId: null },
          { slot: 2, runeId: null },
          { slot: 3, runeId: null },
          { slot: 4, runeId: null },
          { slot: 5, runeId: null },
          { slot: 6, runeId: null },
        ],
        battleStats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          lastUsed: new Date(),
        },
        metadata: {
          obtainedAt: new Date(),
          obtainedFrom,
          isLocked: false,
          isFavorite: false,
          nickname: null,
        },
      });

      return await userCharacter.save();
    } catch (error) {
      console.error("Error creating user character:", error);
      throw error;
    }
  }

  // Get user's characters
  static async getUserCharacters(userId: string): Promise<IUserCharacter[]> {
    try {
      return await UserCharacter.find({ userId }).sort({
        "metadata.obtainedAt": -1,
      });
    } catch (error) {
      console.error("Error getting user characters:", error);
      throw error;
    }
  }

  // Get user character by ID
  static async getUserCharacterById(
    userId: string,
    userCharacterId: string
  ): Promise<IUserCharacter | null> {
    try {
      return await UserCharacter.findOne({
        _id: userCharacterId,
        userId,
      });
    } catch (error) {
      console.error("Error getting user character by ID:", error);
      throw error;
    }
  }

  // Level up character
  static async levelUpCharacter(
    userId: string,
    userCharacterId: string,
    expGain: number
  ): Promise<IUserCharacter | null> {
    try {
      const userCharacter = await UserCharacter.findOne({
        _id: userCharacterId,
        userId,
      });

      if (!userCharacter) return null;

      const characterTemplate = await Character.findOne({
        id: userCharacter.characterId,
      });

      if (!characterTemplate) return null;

      // Add experience
      userCharacter.experience += expGain;

      // Calculate new level (simple formula: 100 exp per level)
      const newLevel = Math.min(
        Math.floor(userCharacter.experience / 100) + 1,
        characterTemplate.maxLevel
      );

      if (newLevel > userCharacter.level) {
        userCharacter.level = newLevel;

        // Recalculate stats based on new level
        const levelMultiplier = userCharacter.level;
        userCharacter.currentStats = {
          hp: Math.floor(
            characterTemplate.baseStats.hp +
              characterTemplate.growthRates.hp * levelMultiplier
          ),
          attack: Math.floor(
            characterTemplate.baseStats.attack +
              characterTemplate.growthRates.attack * levelMultiplier
          ),
          defense: Math.floor(
            characterTemplate.baseStats.defense +
              characterTemplate.growthRates.defense * levelMultiplier
          ),
          speed: Math.floor(
            characterTemplate.baseStats.speed +
              characterTemplate.growthRates.speed * levelMultiplier
          ),
          critRate: characterTemplate.baseStats.critRate,
          critDamage: characterTemplate.baseStats.critDamage,
        };

        console.log(
          `🎉 Character ${userCharacter.characterId} leveled up to ${newLevel}!`
        );
      }

      return await userCharacter.save();
    } catch (error) {
      console.error("Error leveling up character:", error);
      throw error;
    }
  }

  // Get character with template details (populated)
  static async getUserCharacterWithTemplate(
    userId: string,
    userCharacterId: string
  ) {
    try {
      const userCharacter = await UserCharacter.findOne({
        _id: userCharacterId,
        userId,
      });

      if (!userCharacter) return null;

      const characterTemplate = await Character.findOne({
        id: userCharacter.characterId,
      });

      return {
        userCharacter,
        template: characterTemplate,
      };
    } catch (error) {
      console.error("Error getting user character with template:", error);
      throw error;
    }
  }

  // Update character metadata (favorite, nickname, etc.)
  static async updateCharacterMetadata(
    userId: string,
    userCharacterId: string,
    updates: {
      isFavorite?: boolean;
      isLocked?: boolean;
      nickname?: string;
    }
  ): Promise<IUserCharacter | null> {
    try {
      return await UserCharacter.findOneAndUpdate(
        { _id: userCharacterId, userId },
        {
          $set: {
            ...(updates.isFavorite !== undefined && {
              "metadata.isFavorite": updates.isFavorite,
            }),
            ...(updates.isLocked !== undefined && {
              "metadata.isLocked": updates.isLocked,
            }),
            ...(updates.nickname !== undefined && {
              "metadata.nickname": updates.nickname,
            }),
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating character metadata:", error);
      throw error;
    }
  }

  // Get user's character count
  static async getUserCharacterCount(userId: string): Promise<number> {
    try {
      return await UserCharacter.countDocuments({ userId });
    } catch (error) {
      console.error("Error getting user character count:", error);
      throw error;
    }
  }

  // Add experience to user character (for battle rewards)
  static async addExperience(
    userId: string,
    userCharacterId: string,
    expGain: number
  ): Promise<IUserCharacter | null> {
    try {
      return await this.levelUpCharacter(userId, userCharacterId, expGain);
    } catch (error) {
      console.error("Error adding experience:", error);
      throw error;
    }
  }
}
