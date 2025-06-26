import { Character } from "../models/character.model";
import { Pet } from "../models/pet.model";
import { Item } from "../models/item.model";
import { Equipment } from "../models/equipment.model";
import { GachaPool } from "../models/gacha-pool.model";
import { User } from "../models/user.model";
import { UserCharacter } from "../models/user-character.model";
import { UserPet } from "../models/user-pet.model";

export class DataController {
  // Add Character
  static async addCharacter({ body }: { body: any }) {
    try {
      const character = new Character(body);
      await character.save();

      return {
        success: true,
        message: "Character added successfully",
        character: character,
      };
    } catch (error: any) {
      console.error("Error adding character:", error);
      return {
        success: false,
        message: error.message || "Failed to add character",
      };
    }
  }

  // Add Pet
  static async addPet({ body }: { body: any }) {
    try {
      const pet = new Pet(body);
      await pet.save();

      return {
        success: true,
        message: "Pet added successfully",
        pet: pet,
      };
    } catch (error: any) {
      console.error("Error adding pet:", error);
      return {
        success: false,
        message: error.message || "Failed to add pet",
      };
    }
  }

  // Add Item
  static async addItem({ body }: { body: any }) {
    try {
      const item = new Item(body);
      await item.save();

      return {
        success: true,
        message: "Item added successfully",
        item: item,
      };
    } catch (error: any) {
      console.error("Error adding item:", error);
      return {
        success: false,
        message: error.message || "Failed to add item",
      };
    }
  }

  // Create/Update Gacha Pool
  static async createGachaPool({ body }: { body: any }) {
    try {
      // Remove existing gacha pool
      await GachaPool.deleteMany({});

      const gachaPool = new GachaPool(body);
      await gachaPool.save();

      return {
        success: true,
        message: "Gacha pool created successfully",
        gachaPool: gachaPool,
      };
    } catch (error: any) {
      console.error("Error creating gacha pool:", error);
      return {
        success: false,
        message: error.message || "Failed to create gacha pool",
      };
    }
  }

  // Bulk add characters
  static async bulkAddCharacters({ body }: { body: { characters: any[] } }) {
    try {
      const { characters } = body;
      const results = [];

      for (const charData of characters) {
        const character = new Character(charData);
        const saved = await character.save();
        results.push(saved);
      }

      return {
        success: true,
        message: `${results.length} characters added successfully`,
        characters: results,
      };
    } catch (error: any) {
      console.error("Error bulk adding characters:", error);
      return {
        success: false,
        message: error.message || "Failed to bulk add characters",
      };
    }
  }

  // Bulk add pets
  static async bulkAddPets({ body }: { body: { pets: any[] } }) {
    try {
      const { pets } = body;
      const results = [];

      for (const petData of pets) {
        const pet = new Pet(petData);
        const saved = await pet.save();
        results.push(saved);
      }

      return {
        success: true,
        message: `${results.length} pets added successfully`,
        pets: results,
      };
    } catch (error: any) {
      console.error("Error bulk adding pets:", error);
      return {
        success: false,
        message: error.message || "Failed to bulk add pets",
      };
    }
  }

  // Bulk add items
  static async bulkAddItems({ body }: { body: { items: any[] } }) {
    try {
      const { items } = body;
      const results = [];

      for (const itemData of items) {
        const item = new Item(itemData);
        const saved = await item.save();
        results.push(saved);
      }

      return {
        success: true,
        message: `${results.length} items added successfully`,
        items: results,
      };
    } catch (error: any) {
      console.error("Error bulk adding items:", error);
      return {
        success: false,
        message: error.message || "Failed to bulk add items",
      };
    }
  }

  // Get all data
  static async getAllData() {
    try {
      const characters = await Character.find({}).sort({ rarity: -1, name: 1 });
      const pets = await Pet.find({}).sort({ rarity: -1, name: 1 });
      const items = await Item.find({}).sort({ rarity: -1, name: 1 });
      const gachaPool = await GachaPool.findOne({}).sort({ createdAt: -1 });

      return {
        success: true,
        data: {
          characters: characters,
          pets: pets,
          items: items,
          gachaPool: gachaPool,
          summary: {
            charactersCount: characters.length,
            petsCount: pets.length,
            itemsCount: items.length,
            hasGachaPool: !!gachaPool,
          },
        },
      };
    } catch (error: any) {
      console.error("Error getting all data:", error);
      return {
        success: false,
        message: error.message || "Failed to get all data",
      };
    }
  }

  // Clear all data
  static async clearAllData() {
    try {
      // Clear all template data
      await Character.deleteMany({});
      await Pet.deleteMany({});
      await Item.deleteMany({});
      await Equipment.deleteMany({});
      await GachaPool.deleteMany({});

      // Clear all user data
      await User.deleteMany({});
      await UserCharacter.deleteMany({});
      await UserPet.deleteMany({});

      return {
        success: true,
        message:
          "All data cleared successfully (including users and inventories)",
      };
    } catch (error: any) {
      console.error("Error clearing data:", error);
      return {
        success: false,
        message: error.message || "Failed to clear data",
      };
    }
  }

  // Initialize with sample data
  static async initializeSampleData() {
    try {
      // Check if data already exists
      const existingCharacters = await Character.countDocuments();
      if (existingCharacters > 0) {
        console.log("✅ Characters already seeded");
      } else {
        console.log("🌱 Seeding characters...");

        const characters = [
          // SSR Characters (5)
          {
            id: "char_001",
            name: "Fire Knight",
            rarity: "SSR",
            element: "fire",
            characterType: "warrior",
            baseStats: {
              hp: 1200,
              attack: 180,
              defense: 120,
              speed: 95,
              critRate: 15,
              critDamage: 150,
            },
            growthRates: {
              hp: 45,
              attack: 8,
              defense: 6,
              speed: 2,
            },
            skills: [
              {
                id: "skill_001",
                name: "Flame Slash",
                description: "Deals fire damage to one enemy",
                cooldown: 1,
                manaCost: 20,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("fire", "warrior"),
              portrait: DataController.getCharacterEmoji("fire", "warrior"),
              fullArt: DataController.getCharacterEmoji("fire", "warrior"),
            },
            lore: "A noble knight wielding the power of flames.",
          },
          {
            id: "char_002",
            name: "Ice Queen",
            rarity: "SSR",
            element: "water",
            characterType: "mage",
            baseStats: {
              hp: 1000,
              attack: 200,
              defense: 100,
              speed: 110,
              critRate: 20,
              critDamage: 160,
            },
            growthRates: {
              hp: 40,
              attack: 9,
              defense: 5,
              speed: 3,
            },
            skills: [
              {
                id: "skill_002",
                name: "Absolute Zero",
                description: "Freezes all enemies and deals massive ice damage",
                cooldown: 4,
                manaCost: 40,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("water", "mage"),
              portrait: DataController.getCharacterEmoji("water", "mage"),
              fullArt: DataController.getCharacterEmoji("water", "mage"),
            },
            lore: "The ruler of the frozen realm.",
          },
          {
            id: "char_003",
            name: "Thunder Dragon",
            rarity: "SSR",
            element: "air",
            characterType: "warrior",
            baseStats: {
              hp: 1100,
              attack: 190,
              defense: 110,
              speed: 120,
              critRate: 18,
              critDamage: 155,
            },
            growthRates: {
              hp: 42,
              attack: 8,
              defense: 5,
              speed: 3,
            },
            skills: [
              {
                id: "skill_003",
                name: "Lightning Strike",
                description: "Strikes all enemies with thunder",
                cooldown: 3,
                manaCost: 35,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("air", "warrior"),
              portrait: DataController.getCharacterEmoji("air", "warrior"),
              fullArt: DataController.getCharacterEmoji("air", "warrior"),
            },
            lore: "A legendary dragon that commands lightning.",
          },
          {
            id: "char_004",
            name: "Shadow Assassin",
            rarity: "SSR",
            element: "dark",
            characterType: "archer",
            baseStats: {
              hp: 900,
              attack: 220,
              defense: 80,
              speed: 140,
              critRate: 25,
              critDamage: 180,
            },
            growthRates: {
              hp: 35,
              attack: 10,
              defense: 4,
              speed: 4,
            },
            skills: [
              {
                id: "skill_004",
                name: "Shadow Strike",
                description: "Critical hit that ignores defense",
                cooldown: 2,
                manaCost: 30,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("dark", "archer"),
              portrait: DataController.getCharacterEmoji("dark", "archer"),
              fullArt: DataController.getCharacterEmoji("dark", "archer"),
            },
            lore: "A master of stealth and deadly precision.",
          },
          {
            id: "char_005",
            name: "Divine Priest",
            rarity: "SSR",
            element: "light",
            characterType: "healer",
            baseStats: {
              hp: 1050,
              attack: 140,
              defense: 130,
              speed: 100,
              critRate: 12,
              critDamage: 140,
            },
            growthRates: {
              hp: 45,
              attack: 6,
              defense: 7,
              speed: 2,
            },
            skills: [
              {
                id: "skill_005",
                name: "Divine Blessing",
                description: "Heals all allies and grants immunity",
                cooldown: 5,
                manaCost: 45,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("light", "healer"),
              portrait: DataController.getCharacterEmoji("light", "healer"),
              fullArt: DataController.getCharacterEmoji("light", "healer"),
            },
            lore: "A holy priest blessed by divine power.",
          },

          // SR Characters (10)
          {
            id: "char_006",
            name: "Water Mage",
            rarity: "SR",
            element: "water",
            characterType: "mage",
            baseStats: {
              hp: 900,
              attack: 160,
              defense: 80,
              speed: 110,
              critRate: 12,
              critDamage: 140,
            },
            growthRates: {
              hp: 35,
              attack: 7,
              defense: 4,
              speed: 3,
            },
            skills: [
              {
                id: "skill_006",
                name: "Ice Shard",
                description: "Deals water damage and may freeze",
                cooldown: 2,
                manaCost: 25,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("water", "mage"),
              portrait: DataController.getCharacterEmoji("water", "mage"),
              fullArt: DataController.getCharacterEmoji("water", "mage"),
            },
            lore: "A wise mage controlling the flow of water.",
          },
          {
            id: "char_007",
            name: "Wind Archer",
            rarity: "SR",
            element: "air",
            characterType: "archer",
            baseStats: {
              hp: 850,
              attack: 170,
              defense: 70,
              speed: 130,
              critRate: 18,
              critDamage: 150,
            },
            growthRates: {
              hp: 32,
              attack: 7,
              defense: 3,
              speed: 4,
            },
            skills: [
              {
                id: "skill_007",
                name: "Wind Arrow",
                description: "Multi-hit arrow attack",
                cooldown: 2,
                manaCost: 22,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("air", "archer"),
              portrait: DataController.getCharacterEmoji("air", "archer"),
              fullArt: DataController.getCharacterEmoji("air", "archer"),
            },
            lore: "An agile archer who commands the wind.",
          },
          {
            id: "char_008",
            name: "Earth Guardian",
            rarity: "SR",
            element: "earth",
            characterType: "tank",
            baseStats: {
              hp: 1100,
              attack: 120,
              defense: 150,
              speed: 80,
              critRate: 8,
              critDamage: 130,
            },
            growthRates: {
              hp: 45,
              attack: 5,
              defense: 8,
              speed: 1,
            },
            skills: [
              {
                id: "skill_008",
                name: "Stone Wall",
                description: "Creates a barrier that absorbs damage",
                cooldown: 4,
                manaCost: 30,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("earth", "tank"),
              portrait: DataController.getCharacterEmoji("earth", "tank"),
              fullArt: DataController.getCharacterEmoji("earth", "tank"),
            },
            lore: "A guardian who protects with earth's might.",
          },
          {
            id: "char_009",
            name: "Fire Berserker",
            rarity: "SR",
            element: "fire",
            characterType: "warrior",
            baseStats: {
              hp: 950,
              attack: 175,
              defense: 85,
              speed: 105,
              critRate: 16,
              critDamage: 155,
            },
            growthRates: {
              hp: 38,
              attack: 8,
              defense: 4,
              speed: 3,
            },
            skills: [
              {
                id: "skill_009",
                name: "Rage Strike",
                description: "Attack power increases when HP is low",
                cooldown: 2,
                manaCost: 20,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("fire", "warrior"),
              portrait: DataController.getCharacterEmoji("fire", "warrior"),
              fullArt: DataController.getCharacterEmoji("fire", "warrior"),
            },
            lore: "A fierce warrior consumed by battle fury.",
          },
          {
            id: "char_010",
            name: "Light Mage",
            rarity: "SR",
            element: "light",
            characterType: "mage",
            baseStats: {
              hp: 880,
              attack: 165,
              defense: 75,
              speed: 115,
              critRate: 14,
              critDamage: 145,
            },
            growthRates: {
              hp: 34,
              attack: 7,
              defense: 3,
              speed: 4,
            },
            skills: [
              {
                id: "skill_010",
                name: "Light Beam",
                description: "Piercing light attack that hits multiple enemies",
                cooldown: 3,
                manaCost: 28,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("light", "mage"),
              portrait: DataController.getCharacterEmoji("light", "mage"),
              fullArt: DataController.getCharacterEmoji("light", "mage"),
            },
            lore: "A mage who channels pure light energy.",
          },
          {
            id: "char_011",
            name: "Dark Knight",
            rarity: "SR",
            element: "dark",
            characterType: "warrior",
            baseStats: {
              hp: 1000,
              attack: 150,
              defense: 110,
              speed: 90,
              critRate: 12,
              critDamage: 142,
            },
            growthRates: {
              hp: 40,
              attack: 7,
              defense: 6,
              speed: 2,
            },
            skills: [
              {
                id: "skill_011",
                name: "Dark Slash",
                description: "Drains enemy HP and heals self",
                cooldown: 2,
                manaCost: 24,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("dark", "warrior"),
              portrait: DataController.getCharacterEmoji("dark", "warrior"),
              fullArt: DataController.getCharacterEmoji("dark", "warrior"),
            },
            lore: "A fallen knight who embraced darkness.",
          },
          {
            id: "char_012",
            name: "Light Paladin",
            rarity: "SR",
            element: "light",
            characterType: "tank",
            baseStats: {
              hp: 1050,
              attack: 130,
              defense: 140,
              speed: 85,
              critRate: 10,
              critDamage: 135,
            },
            growthRates: {
              hp: 42,
              attack: 6,
              defense: 7,
              speed: 2,
            },
            skills: [
              {
                id: "skill_012",
                name: "Holy Shield",
                description: "Reflects damage back to attacker",
                cooldown: 4,
                manaCost: 32,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("light", "tank"),
              portrait: DataController.getCharacterEmoji("light", "tank"),
              fullArt: DataController.getCharacterEmoji("light", "tank"),
            },
            lore: "A righteous paladin blessed by light.",
          },
          {
            id: "char_013",
            name: "Forest Ranger",
            rarity: "SR",
            element: "earth",
            characterType: "archer",
            baseStats: {
              hp: 870,
              attack: 160,
              defense: 85,
              speed: 125,
              critRate: 16,
              critDamage: 150,
            },
            growthRates: {
              hp: 33,
              attack: 7,
              defense: 4,
              speed: 4,
            },
            skills: [
              {
                id: "skill_013",
                name: "Nature's Call",
                description: "Summons forest spirits to aid in battle",
                cooldown: 4,
                manaCost: 35,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("earth", "archer"),
              portrait: DataController.getCharacterEmoji("earth", "archer"),
              fullArt: DataController.getCharacterEmoji("earth", "archer"),
            },
            lore: "A guardian of the ancient forests.",
          },
          {
            id: "char_014",
            name: "Ice Warrior",
            rarity: "SR",
            element: "water",
            characterType: "warrior",
            baseStats: {
              hp: 920,
              attack: 158,
              defense: 95,
              speed: 100,
              critRate: 13,
              critDamage: 143,
            },
            growthRates: {
              hp: 36,
              attack: 7,
              defense: 5,
              speed: 3,
            },
            skills: [
              {
                id: "skill_014",
                name: "Frost Strike",
                description: "Slows enemy and deals ice damage",
                cooldown: 2,
                manaCost: 23,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("water", "warrior"),
              portrait: DataController.getCharacterEmoji("water", "warrior"),
              fullArt: DataController.getCharacterEmoji("water", "warrior"),
            },
            lore: "A warrior forged in the heart of winter.",
          },
          {
            id: "char_015",
            name: "Storm Shaman",
            rarity: "SR",
            element: "air",
            characterType: "healer",
            baseStats: {
              hp: 900,
              attack: 135,
              defense: 90,
              speed: 110,
              critRate: 11,
              critDamage: 138,
            },
            growthRates: {
              hp: 36,
              attack: 6,
              defense: 5,
              speed: 3,
            },
            skills: [
              {
                id: "skill_015",
                name: "Wind Heal",
                description: "Heals allies and increases their speed",
                cooldown: 3,
                manaCost: 28,
              },
            ],
            maxLevel: 60,
            artwork: {
              icon: DataController.getCharacterEmoji("air", "healer"),
              portrait: DataController.getCharacterEmoji("air", "healer"),
              fullArt: DataController.getCharacterEmoji("air", "healer"),
            },
            lore: "A shaman who speaks with the winds.",
          },
        ];

        // Add R Characters (15)
        const rCharacters = [
          {
            id: "char_016",
            name: "Earth Guard",
            rarity: "R",
            element: "earth",
            characterType: "tank",
            baseStats: {
              hp: 800,
              attack: 100,
              defense: 120,
              speed: 70,
              critRate: 8,
              critDamage: 120,
            },
            growthRates: {
              hp: 30,
              attack: 4,
              defense: 6,
              speed: 1,
            },
            skills: [
              {
                id: "skill_016",
                name: "Rock Shield",
                description: "Increases defense for all allies",
                cooldown: 3,
                manaCost: 20,
              },
            ],
            maxLevel: 50,
            artwork: {
              icon: DataController.getCharacterEmoji("earth", "tank"),
              portrait: DataController.getCharacterEmoji("earth", "tank"),
              fullArt: DataController.getCharacterEmoji("earth", "tank"),
            },
            lore: "A sturdy guardian protecting with earth's strength.",
          },
          {
            id: "char_017",
            name: "Fire Scout",
            rarity: "R",
            element: "fire",
            characterType: "archer",
            baseStats: {
              hp: 700,
              attack: 110,
              defense: 60,
              speed: 100,
              critRate: 12,
              critDamage: 130,
            },
            growthRates: {
              hp: 25,
              attack: 5,
              defense: 3,
              speed: 3,
            },
            skills: [
              {
                id: "skill_017",
                name: "Fire Arrow",
                description: "Basic fire damage attack",
                cooldown: 1,
                manaCost: 15,
              },
            ],
            maxLevel: 50,
            artwork: {
              icon: DataController.getCharacterEmoji("fire", "archer"),
              portrait: DataController.getCharacterEmoji("fire", "archer"),
              fullArt: DataController.getCharacterEmoji("fire", "archer"),
            },
            lore: "A rookie archer learning fire magic.",
          },
          {
            id: "char_018",
            name: "Water Healer",
            rarity: "R",
            element: "water",
            characterType: "healer",
            baseStats: {
              hp: 750,
              attack: 90,
              defense: 80,
              speed: 90,
              critRate: 6,
              critDamage: 115,
            },
            growthRates: {
              hp: 28,
              attack: 4,
              defense: 4,
              speed: 2,
            },
            skills: [
              {
                id: "skill_018",
                name: "Healing Water",
                description: "Restores HP to one ally",
                cooldown: 2,
                manaCost: 18,
              },
            ],
            maxLevel: 50,
            artwork: {
              icon: DataController.getCharacterEmoji("water", "healer"),
              portrait: DataController.getCharacterEmoji("water", "healer"),
              fullArt: DataController.getCharacterEmoji("water", "healer"),
            },
            lore: "A novice healer with water magic.",
          },
          {
            id: "char_019",
            name: "Wind Runner",
            rarity: "R",
            element: "air",
            characterType: "archer",
            baseStats: {
              hp: 650,
              attack: 125,
              defense: 50,
              speed: 120,
              critRate: 15,
              critDamage: 140,
            },
            growthRates: {
              hp: 23,
              attack: 5,
              defense: 2,
              speed: 4,
            },
            skills: [
              {
                id: "skill_019",
                name: "Quick Strike",
                description: "Fast attack with high crit chance",
                cooldown: 1,
                manaCost: 12,
              },
            ],
            maxLevel: 50,
            artwork: {
              icon: DataController.getCharacterEmoji("air", "archer"),
              portrait: DataController.getCharacterEmoji("air", "archer"),
              fullArt: DataController.getCharacterEmoji("air", "archer"),
            },
            lore: "A swift runner who moves like the wind.",
          },
          {
            id: "char_020",
            name: "Stone Warrior",
            rarity: "R",
            element: "earth",
            characterType: "warrior",
            baseStats: {
              hp: 780,
              attack: 105,
              defense: 110,
              speed: 75,
              critRate: 9,
              critDamage: 125,
            },
            growthRates: {
              hp: 29,
              attack: 4,
              defense: 5,
              speed: 2,
            },
            skills: [
              {
                id: "skill_020",
                name: "Stone Punch",
                description: "Heavy attack that may stun",
                cooldown: 2,
                manaCost: 16,
              },
            ],
            maxLevel: 50,
            artwork: {
              icon: DataController.getCharacterEmoji("earth", "warrior"),
              portrait: DataController.getCharacterEmoji("earth", "warrior"),
              fullArt: DataController.getCharacterEmoji("earth", "warrior"),
            },
            lore: "A warrior as solid as stone.",
          },
        ];

        // Combine all characters
        const allCharacters = [...characters, ...rCharacters];

        // Sample Pets (various rarities)
        const pets = [
          // SSR Pets (3)
          {
            id: "pet_001",
            name: "Fire Drake",
            rarity: "SSR",
            element: "fire",
            petType: "battle",
            baseStats: {
              hp: 400,
              attack: 80,
              defense: 60,
              speed: 90,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "fire_damage",
                value: 25,
                description: "Increases fire damage by 25%",
              },
            ],
            skills: [
              {
                id: "pet_skill_001",
                name: "Fire Breath",
                description: "Deals fire damage to all enemies",
                cooldown: 3,
                effect: "aoe_fire_damage",
              },
            ],
            maxLevel: 40,
            artwork: {
              icon: "/images/pets/fire_drake_icon.png",
              portrait: "/images/pets/fire_drake_portrait.png",
              fullArt: "/images/pets/fire_drake_full.png",
            },
            lore: "A young dragon companion with fierce loyalty.",
          },
          {
            id: "pet_002",
            name: "Ice Phoenix",
            rarity: "SSR",
            element: "water",
            petType: "battle",
            baseStats: {
              hp: 350,
              attack: 85,
              defense: 55,
              speed: 100,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "ice_damage",
                value: 30,
                description: "Increases ice damage by 30%",
              },
            ],
            skills: [
              {
                id: "pet_skill_002",
                name: "Frost Storm",
                description: "Freezes all enemies for 2 turns",
                cooldown: 5,
                effect: "aoe_freeze",
              },
            ],
            maxLevel: 40,
            artwork: {
              icon: "/images/pets/ice_phoenix_icon.png",
              portrait: "/images/pets/ice_phoenix_portrait.png",
              fullArt: "/images/pets/ice_phoenix_full.png",
            },
            lore: "A legendary phoenix of eternal winter.",
          },
          {
            id: "pet_003",
            name: "Thunder Wolf",
            rarity: "SSR",
            element: "air",
            petType: "battle",
            baseStats: {
              hp: 380,
              attack: 88,
              defense: 65,
              speed: 95,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "thunder_damage",
                value: 28,
                description: "Increases thunder damage by 28%",
              },
            ],
            skills: [
              {
                id: "pet_skill_003",
                name: "Lightning Howl",
                description: "Paralyzes enemies and boosts ally speed",
                cooldown: 4,
                effect: "paralyze_speed_boost",
              },
            ],
            maxLevel: 40,
            artwork: {
              icon: "/images/pets/thunder_wolf_icon.png",
              portrait: "/images/pets/thunder_wolf_portrait.png",
              fullArt: "/images/pets/thunder_wolf_full.png",
            },
            lore: "A mystical wolf that commands lightning.",
          },
          // SR Pets (5)
          {
            id: "pet_004",
            name: "Healing Fairy",
            rarity: "SR",
            element: "light",
            petType: "support",
            baseStats: {
              hp: 300,
              attack: 40,
              defense: 50,
              speed: 120,
            },
            bonuses: [
              {
                type: "resource_bonus",
                target: "healing_potency",
                value: 20,
                description: "Increases healing by 20%",
              },
            ],
            skills: [
              {
                id: "pet_skill_004",
                name: "Healing Light",
                description: "Restores HP to all allies",
                cooldown: 4,
                effect: "party_heal",
              },
            ],
            maxLevel: 35,
            artwork: {
              icon: "/images/pets/healing_fairy_icon.png",
              portrait: "/images/pets/healing_fairy_portrait.png",
              fullArt: "/images/pets/healing_fairy_full.png",
            },
            lore: "A mystical fairy that brings hope and healing.",
          },
          {
            id: "pet_005",
            name: "Wind Eagle",
            rarity: "SR",
            element: "air",
            petType: "support",
            baseStats: {
              hp: 280,
              attack: 60,
              defense: 45,
              speed: 110,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "speed",
                value: 15,
                description: "Increases party speed by 15%",
              },
            ],
            skills: [
              {
                id: "pet_skill_005",
                name: "Wind Boost",
                description: "Increases all allies' speed and accuracy",
                cooldown: 3,
                effect: "speed_accuracy_boost",
              },
            ],
            maxLevel: 35,
            artwork: {
              icon: "/images/pets/wind_eagle_icon.png",
              portrait: "/images/pets/wind_eagle_portrait.png",
              fullArt: "/images/pets/wind_eagle_full.png",
            },
            lore: "A majestic eagle that soars through storms.",
          },
          {
            id: "pet_006",
            name: "Earth Turtle",
            rarity: "SR",
            element: "earth",
            petType: "support",
            baseStats: {
              hp: 450,
              attack: 35,
              defense: 80,
              speed: 60,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "defense",
                value: 20,
                description: "Increases party defense by 20%",
              },
            ],
            skills: [
              {
                id: "pet_skill_006",
                name: "Shell Guard",
                description: "Reduces damage taken by all allies",
                cooldown: 4,
                effect: "damage_reduction",
              },
            ],
            maxLevel: 35,
            artwork: {
              icon: "/images/pets/earth_turtle_icon.png",
              portrait: "/images/pets/earth_turtle_portrait.png",
              fullArt: "/images/pets/earth_turtle_full.png",
            },
            lore: "An ancient turtle with impenetrable defense.",
          },
          {
            id: "pet_007",
            name: "Water Spirit",
            rarity: "SR",
            element: "water",
            petType: "support",
            baseStats: {
              hp: 320,
              attack: 50,
              defense: 55,
              speed: 85,
            },
            bonuses: [
              {
                type: "resource_bonus",
                target: "mana_recovery",
                value: 25,
                description: "Increases mana recovery by 25%",
              },
            ],
            skills: [
              {
                id: "pet_skill_007",
                name: "Mana Flow",
                description: "Restores mana to all allies",
                cooldown: 3,
                effect: "mana_restore",
              },
            ],
            maxLevel: 35,
            artwork: {
              icon: "/images/pets/water_spirit_icon.png",
              portrait: "/images/pets/water_spirit_portrait.png",
              fullArt: "/images/pets/water_spirit_full.png",
            },
            lore: "A gentle spirit that flows like water.",
          },
          {
            id: "pet_008",
            name: "Shadow Cat",
            rarity: "SR",
            element: "dark",
            petType: "battle",
            baseStats: {
              hp: 250,
              attack: 70,
              defense: 40,
              speed: 130,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "crit_rate",
                value: 18,
                description: "Increases critical hit rate by 18%",
              },
            ],
            skills: [
              {
                id: "pet_skill_008",
                name: "Shadow Claw",
                description: "High critical hit chance attack",
                cooldown: 2,
                effect: "high_crit_attack",
              },
            ],
            maxLevel: 35,
            artwork: {
              icon: "/images/pets/shadow_cat_icon.png",
              portrait: "/images/pets/shadow_cat_portrait.png",
              fullArt: "/images/pets/shadow_cat_full.png",
            },
            lore: "A mysterious cat that walks in shadows.",
          },
          // R Pets (7)
          {
            id: "pet_009",
            name: "Fire Salamander",
            rarity: "R",
            element: "fire",
            petType: "battle",
            baseStats: {
              hp: 200,
              attack: 45,
              defense: 35,
              speed: 70,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "fire_damage",
                value: 10,
                description: "Increases fire damage by 10%",
              },
            ],
            skills: [
              {
                id: "pet_skill_009",
                name: "Ember",
                description: "Small fire attack",
                cooldown: 2,
                effect: "fire_damage",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/fire_salamander_icon.png",
              portrait: "/images/pets/fire_salamander_portrait.png",
              fullArt: "/images/pets/fire_salamander_full.png",
            },
            lore: "A small lizard with a fiery heart.",
          },
          {
            id: "pet_010",
            name: "Water Slime",
            rarity: "R",
            element: "water",
            petType: "support",
            baseStats: {
              hp: 250,
              attack: 30,
              defense: 40,
              speed: 60,
            },
            bonuses: [
              {
                type: "resource_bonus",
                target: "healing_potency",
                value: 8,
                description: "Increases healing by 8%",
              },
            ],
            skills: [
              {
                id: "pet_skill_010",
                name: "Water Drop",
                description: "Minor healing to one ally",
                cooldown: 3,
                effect: "single_heal",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/water_slime_icon.png",
              portrait: "/images/pets/water_slime_portrait.png",
              fullArt: "/images/pets/water_slime_full.png",
            },
            lore: "A cute slime that loves to help.",
          },
          {
            id: "pet_011",
            name: "Wind Pixie",
            rarity: "R",
            element: "air",
            petType: "support",
            baseStats: {
              hp: 180,
              attack: 35,
              defense: 25,
              speed: 90,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "speed",
                value: 8,
                description: "Increases speed by 8%",
              },
            ],
            skills: [
              {
                id: "pet_skill_011",
                name: "Speed Up",
                description: "Increases one ally's speed",
                cooldown: 3,
                effect: "speed_boost",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/wind_pixie_icon.png",
              portrait: "/images/pets/wind_pixie_portrait.png",
              fullArt: "/images/pets/wind_pixie_full.png",
            },
            lore: "A playful pixie dancing in the wind.",
          },
          {
            id: "pet_012",
            name: "Earth Mole",
            rarity: "R",
            element: "earth",
            petType: "support",
            baseStats: {
              hp: 300,
              attack: 25,
              defense: 50,
              speed: 40,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "defense",
                value: 12,
                description: "Increases defense by 12%",
              },
            ],
            skills: [
              {
                id: "pet_skill_012",
                name: "Dig",
                description: "Avoids next attack and counters",
                cooldown: 4,
                effect: "dodge_counter",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/earth_mole_icon.png",
              portrait: "/images/pets/earth_mole_portrait.png",
              fullArt: "/images/pets/earth_mole_full.png",
            },
            lore: "A hardworking mole that digs deep.",
          },
          {
            id: "pet_013",
            name: "Light Butterfly",
            rarity: "R",
            element: "light",
            petType: "support",
            baseStats: {
              hp: 160,
              attack: 25,
              defense: 20,
              speed: 100,
            },
            bonuses: [
              {
                type: "resource_bonus",
                target: "healing_potency",
                value: 6,
                description: "Increases healing by 6%",
              },
            ],
            skills: [
              {
                id: "pet_skill_013",
                name: "Healing Dust",
                description: "Gradually heals all allies",
                cooldown: 4,
                effect: "regen_heal",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/light_butterfly_icon.png",
              portrait: "/images/pets/light_butterfly_portrait.png",
              fullArt: "/images/pets/light_butterfly_full.png",
            },
            lore: "A delicate butterfly that brings peace.",
          },
          {
            id: "pet_014",
            name: "Thunder Mouse",
            rarity: "R",
            element: "air",
            petType: "battle",
            baseStats: {
              hp: 150,
              attack: 50,
              defense: 20,
              speed: 110,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "crit_rate",
                value: 10,
                description: "Increases critical hit rate by 10%",
              },
            ],
            skills: [
              {
                id: "pet_skill_014",
                name: "Shock",
                description: "Quick electric attack",
                cooldown: 2,
                effect: "thunder_damage",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/thunder_mouse_icon.png",
              portrait: "/images/pets/thunder_mouse_portrait.png",
              fullArt: "/images/pets/thunder_mouse_full.png",
            },
            lore: "A speedy mouse crackling with electricity.",
          },
          {
            id: "pet_015",
            name: "Dark Bat",
            rarity: "R",
            element: "dark",
            petType: "battle",
            baseStats: {
              hp: 170,
              attack: 40,
              defense: 25,
              speed: 95,
            },
            bonuses: [
              {
                type: "stat_boost",
                target: "dark_damage",
                value: 8,
                description: "Increases dark damage by 8%",
              },
            ],
            skills: [
              {
                id: "pet_skill_015",
                name: "Shadow Bite",
                description: "Drains enemy HP",
                cooldown: 3,
                effect: "hp_drain",
              },
            ],
            maxLevel: 30,
            artwork: {
              icon: "/images/pets/dark_bat_icon.png",
              portrait: "/images/pets/dark_bat_portrait.png",
              fullArt: "/images/pets/dark_bat_full.png",
            },
            lore: "A nocturnal bat dwelling in darkness.",
          },
        ];

        // Sample Items (various rarities)
        const items = [
          // SSR Items (3)
          {
            id: "item_001",
            name: "Legendary Sword",
            description:
              "A legendary weapon that increases attack power dramatically",
            rarity: "SSR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 100,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 10000,
            tradeable: false,
            artwork: {
              icon: "/images/items/legendary_sword_icon.png",
              thumbnail: "/images/items/legendary_sword_thumb.png",
            },
          },
          {
            id: "item_002",
            name: "Divine Armor",
            description: "Holy armor blessed by the gods",
            rarity: "SSR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 150,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 8000,
            tradeable: false,
            artwork: {
              icon: "/images/items/divine_armor_icon.png",
              thumbnail: "/images/items/divine_armor_thumb.png",
            },
          },
          {
            id: "item_003",
            name: "Phoenix Feather",
            description: "A rare feather that grants resurrection",
            rarity: "SSR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "heal",
                value: 100,
                target: "character",
              },
            ],
            stackLimit: 5,
            sellPrice: 5000,
            tradeable: true,
            artwork: {
              icon: "/images/items/phoenix_feather_icon.png",
              thumbnail: "/images/items/phoenix_feather_thumb.png",
            },
          },
          // SR Items (8)
          {
            id: "item_004",
            name: "Magic Staff",
            description: "A staff that amplifies magical power",
            rarity: "SR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 60,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 2000,
            tradeable: true,
            artwork: {
              icon: "/images/items/magic_staff_icon.png",
              thumbnail: "/images/items/magic_staff_thumb.png",
            },
          },
          {
            id: "item_005",
            name: "Steel Armor",
            description: "Sturdy armor made from finest steel",
            rarity: "SR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 80,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 1500,
            tradeable: true,
            artwork: {
              icon: "/images/items/steel_armor_icon.png",
              thumbnail: "/images/items/steel_armor_thumb.png",
            },
          },
          {
            id: "item_006",
            name: "Power Crystal",
            description: "A glowing crystal containing magical power",
            rarity: "SR",
            type: "material",
            subType: "essence",
            effects: [
              {
                type: "craft",
                value: 1,
                target: "character",
              },
            ],
            stackLimit: 50,
            sellPrice: 100,
            tradeable: true,
            artwork: {
              icon: "/images/items/power_crystal_icon.png",
              thumbnail: "/images/items/power_crystal_thumb.png",
            },
          },
          {
            id: "item_007",
            name: "Greater Health Potion",
            description: "A powerful healing potion that restores 2000 HP",
            rarity: "SR",
            type: "consumable",
            subType: "potion",
            effects: [
              {
                type: "heal",
                value: 2000,
                target: "character",
              },
            ],
            stackLimit: 50,
            sellPrice: 200,
            tradeable: true,
            artwork: {
              icon: "/images/items/greater_health_potion_icon.png",
              thumbnail: "/images/items/greater_health_potion_thumb.png",
            },
          },
          {
            id: "item_008",
            name: "Mana Elixir",
            description: "Restores all mana instantly",
            rarity: "SR",
            type: "consumable",
            subType: "potion",
            effects: [
              {
                type: "buff",
                value: 100,
                target: "character",
              },
            ],
            stackLimit: 30,
            sellPrice: 300,
            tradeable: true,
            artwork: {
              icon: "/images/items/mana_elixir_icon.png",
              thumbnail: "/images/items/mana_elixir_thumb.png",
            },
          },
          {
            id: "item_009",
            name: "Speed Boots",
            description: "Magical boots that increase movement speed",
            rarity: "SR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 40,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 1200,
            tradeable: true,
            artwork: {
              icon: "/images/items/speed_boots_icon.png",
              thumbnail: "/images/items/speed_boots_thumb.png",
            },
          },
          {
            id: "item_010",
            name: "Critical Ring",
            description: "A ring that increases critical hit rate",
            rarity: "SR",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 15,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 1800,
            tradeable: true,
            artwork: {
              icon: "/images/items/critical_ring_icon.png",
              thumbnail: "/images/items/critical_ring_thumb.png",
            },
          },
          {
            id: "item_011",
            name: "Rare Gem",
            description: "A precious gem used for crafting",
            rarity: "SR",
            type: "material",
            subType: "gem",
            effects: [
              {
                type: "craft",
                value: 5,
                target: "character",
              },
            ],
            stackLimit: 20,
            sellPrice: 500,
            tradeable: true,
            artwork: {
              icon: "/images/items/rare_gem_icon.png",
              thumbnail: "/images/items/rare_gem_thumb.png",
            },
          },
          // R Items (12)
          {
            id: "item_012",
            name: "Health Potion",
            description: "A basic healing potion that restores 500 HP",
            rarity: "R",
            type: "consumable",
            subType: "potion",
            effects: [
              {
                type: "heal",
                value: 500,
                target: "character",
              },
            ],
            stackLimit: 99,
            sellPrice: 10,
            tradeable: true,
            artwork: {
              icon: "/images/items/health_potion_icon.png",
              thumbnail: "/images/items/health_potion_thumb.png",
            },
          },
          {
            id: "item_013",
            name: "Mana Potion",
            description: "Restores 50 mana points",
            rarity: "R",
            type: "consumable",
            subType: "potion",
            effects: [
              {
                type: "buff",
                value: 50,
                target: "character",
              },
            ],
            stackLimit: 99,
            sellPrice: 15,
            tradeable: true,
            artwork: {
              icon: "/images/items/mana_potion_icon.png",
              thumbnail: "/images/items/mana_potion_thumb.png",
            },
          },
          {
            id: "item_014",
            name: "Iron Sword",
            description: "A reliable sword made of iron",
            rarity: "R",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 25,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 150,
            tradeable: true,
            artwork: {
              icon: "/images/items/iron_sword_icon.png",
              thumbnail: "/images/items/iron_sword_thumb.png",
            },
          },
          {
            id: "item_015",
            name: "Leather Armor",
            description: "Basic protection made from leather",
            rarity: "R",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 20,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 100,
            tradeable: true,
            artwork: {
              icon: "/images/items/leather_armor_icon.png",
              thumbnail: "/images/items/leather_armor_thumb.png",
            },
          },
          {
            id: "item_016",
            name: "Copper Coin",
            description: "Basic currency for trading",
            rarity: "R",
            type: "currency",
            subType: "token",
            effects: [
              {
                type: "currency",
                value: 1,
                target: "user",
              },
            ],
            stackLimit: 9999,
            sellPrice: 1,
            tradeable: true,
            artwork: {
              icon: "/images/items/copper_coin_icon.png",
              thumbnail: "/images/items/copper_coin_thumb.png",
            },
          },
          {
            id: "item_017",
            name: "Wooden Shield",
            description: "A simple shield made of wood",
            rarity: "R",
            type: "special",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 15,
                target: "character",
              },
            ],
            stackLimit: 1,
            sellPrice: 80,
            tradeable: true,
            artwork: {
              icon: "/images/items/wooden_shield_icon.png",
              thumbnail: "/images/items/wooden_shield_thumb.png",
            },
          },
          {
            id: "item_018",
            name: "Experience Orb",
            description: "Grants experience points when used",
            rarity: "R",
            type: "enhancement",
            subType: "other",
            effects: [
              {
                type: "experience",
                value: 100,
                target: "character",
              },
            ],
            stackLimit: 50,
            sellPrice: 25,
            tradeable: true,
            artwork: {
              icon: "/images/items/experience_orb_icon.png",
              thumbnail: "/images/items/experience_orb_thumb.png",
            },
          },
          {
            id: "item_019",
            name: "Magic Scroll",
            description: "A scroll containing basic magic",
            rarity: "R",
            type: "consumable",
            subType: "scroll",
            effects: [
              {
                type: "buff",
                value: 1,
                target: "character",
              },
            ],
            stackLimit: 20,
            sellPrice: 50,
            tradeable: true,
            artwork: {
              icon: "/images/items/magic_scroll_icon.png",
              thumbnail: "/images/items/magic_scroll_thumb.png",
            },
          },
          {
            id: "item_020",
            name: "Repair Kit",
            description: "Repairs damaged equipment",
            rarity: "R",
            type: "consumable",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 100,
                target: "character",
              },
            ],
            stackLimit: 10,
            sellPrice: 75,
            tradeable: true,
            artwork: {
              icon: "/images/items/repair_kit_icon.png",
              thumbnail: "/images/items/repair_kit_thumb.png",
            },
          },
          {
            id: "item_021",
            name: "Lucky Charm",
            description: "Increases drop rate temporarily",
            rarity: "R",
            type: "consumable",
            subType: "other",
            effects: [
              {
                type: "buff",
                value: 25,
                target: "user",
              },
            ],
            stackLimit: 5,
            sellPrice: 200,
            tradeable: true,
            artwork: {
              icon: "/images/items/lucky_charm_icon.png",
              thumbnail: "/images/items/lucky_charm_thumb.png",
            },
          },
          {
            id: "item_022",
            name: "Food Ration",
            description: "Restores a small amount of HP over time",
            rarity: "R",
            type: "consumable",
            subType: "other",
            effects: [
              {
                type: "heal",
                value: 50,
                target: "character",
              },
            ],
            stackLimit: 99,
            sellPrice: 5,
            tradeable: true,
            artwork: {
              icon: "/images/items/food_ration_icon.png",
              thumbnail: "/images/items/food_ration_thumb.png",
            },
          },
          {
            id: "item_023",
            name: "Common Herb",
            description: "A basic herb used for crafting potions",
            rarity: "R",
            type: "material",
            subType: "other",
            effects: [
              {
                type: "craft",
                value: 1,
                target: "character",
              },
            ],
            stackLimit: 100,
            sellPrice: 3,
            tradeable: true,
            artwork: {
              icon: "/images/items/common_herb_icon.png",
              thumbnail: "/images/items/common_herb_thumb.png",
            },
          },
        ];

        // Sample Equipment (various types and rarities)
        const equipments = [
          // SSR Weapons (3)
          {
            id: "weapon_001",
            name: "Dragon Slayer Sword",
            description: "A legendary sword forged from dragon scales",
            rarity: "SSR",
            type: "weapon",
            subType: "sword",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 200,
              attack: 150,
              defense: 50,
              speed: 20,
              critRate: 12,
              critDamage: 30,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 2 },
                    { itemId: "item_016", quantity: 1000 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/dragon_slayer_icon.png",
              preview: "/images/equipment/dragon_slayer_preview.png",
            },
            lore: "Once wielded by the legendary hero who defeated the ancient dragon",
            tradeable: false,
          },
          {
            id: "weapon_002",
            name: "Arcane Staff of Eternity",
            description: "A staff that channels infinite magical power",
            rarity: "SSR",
            type: "weapon",
            subType: "staff",
            allowedClasses: ["mage", "healer"],
            baseStats: {
              hp: 100,
              attack: 180,
              defense: 30,
              speed: 15,
              critRate: 15,
              critDamage: 40,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 2 },
                    { itemId: "item_016", quantity: 1000 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/arcane_staff_icon.png",
              preview: "/images/equipment/arcane_staff_preview.png",
            },
            lore: "Created by the most powerful mages of the ancient era",
            tradeable: false,
          },
          {
            id: "weapon_003",
            name: "Heaven Piercing Bow",
            description: "A bow that can shoot arrows to the heavens",
            rarity: "SSR",
            type: "weapon",
            subType: "bow",
            allowedClasses: ["archer"],
            baseStats: {
              hp: 80,
              attack: 170,
              defense: 25,
              speed: 40,
              critRate: 20,
              critDamage: 50,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 2 },
                    { itemId: "item_016", quantity: 1000 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/heaven_bow_icon.png",
              preview: "/images/equipment/heaven_bow_preview.png",
            },
            lore: "Blessed by celestial beings with divine accuracy",
            tradeable: false,
          },
          // SR Equipment (6)
          {
            id: "weapon_004",
            name: "Steel Warrior Blade",
            description: "A well-crafted steel sword for experienced warriors",
            rarity: "SR",
            type: "weapon",
            subType: "sword",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 120,
              attack: 90,
              defense: 35,
              speed: 15,
              critRate: 8,
              critDamage: 20,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 1 },
                    { itemId: "item_016", quantity: 500 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/steel_blade_icon.png",
              preview: "/images/equipment/steel_blade_preview.png",
            },
            lore: "Forged by master smiths with the finest steel",
            tradeable: true,
          },
          {
            id: "armor_001",
            name: "Dragon Scale Armor",
            description: "Armor made from the scales of ancient dragons",
            rarity: "SSR",
            type: "armor",
            subType: "chestplate",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 300,
              attack: 20,
              defense: 180,
              speed: 0,
              critRate: 0,
              critDamage: 0,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 3 },
                    { itemId: "item_016", quantity: 1500 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/dragon_armor_icon.png",
              preview: "/images/equipment/dragon_armor_preview.png",
            },
            lore: "Provides unmatched protection against all forms of attack",
            tradeable: false,
          },
          {
            id: "armor_002",
            name: "Mystic Robes",
            description: "Robes imbued with powerful magical enchantments",
            rarity: "SR",
            type: "armor",
            subType: "chestplate",
            allowedClasses: ["mage", "healer"],
            baseStats: {
              hp: 150,
              attack: 40,
              defense: 80,
              speed: 20,
              critRate: 5,
              critDamage: 15,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 2 },
                    { itemId: "item_016", quantity: 800 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/mystic_robes_icon.png",
              preview: "/images/equipment/mystic_robes_preview.png",
            },
            lore: "Woven with threads of pure magic energy",
            tradeable: true,
          },
          {
            id: "accessory_001",
            name: "Ring of Power",
            description: "A ring that amplifies the wearer's abilities",
            rarity: "SSR",
            type: "accessory",
            subType: "ring",
            allowedClasses: [],
            baseStats: {
              hp: 100,
              attack: 80,
              defense: 40,
              speed: 30,
              critRate: 10,
              critDamage: 25,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 1 },
                    { itemId: "item_016", quantity: 800 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/power_ring_icon.png",
              preview: "/images/equipment/power_ring_preview.png",
            },
            lore: "Contains the essence of multiple legendary heroes",
            tradeable: true,
          },
          {
            id: "accessory_002",
            name: "Speed Boots",
            description: "Boots that greatly increase movement speed",
            rarity: "SR",
            type: "accessory",
            subType: "boots",
            allowedClasses: [],
            baseStats: {
              hp: 50,
              attack: 30,
              defense: 20,
              speed: 60,
              critRate: 8,
              critDamage: 10,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 1 },
                    { itemId: "item_016", quantity: 400 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/speed_boots_icon.png",
              preview: "/images/equipment/speed_boots_preview.png",
            },
            lore: "Crafted with wind magic for ultimate agility",
            tradeable: true,
          },
          // R Equipment (6)
          {
            id: "weapon_005",
            name: "Iron Sword",
            description: "A basic iron sword for beginning warriors",
            rarity: "R",
            type: "weapon",
            subType: "sword",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 50,
              attack: 40,
              defense: 15,
              speed: 5,
              critRate: 3,
              critDamage: 10,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 5 },
                    { itemId: "item_016", quantity: 100 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/iron_sword_icon.png",
              preview: "/images/equipment/iron_sword_preview.png",
            },
            lore: "A reliable weapon for those just starting their journey",
            tradeable: true,
          },
          {
            id: "armor_003",
            name: "Leather Armor",
            description: "Basic leather armor offering modest protection",
            rarity: "R",
            type: "armor",
            subType: "chestplate",
            allowedClasses: [],
            baseStats: {
              hp: 80,
              attack: 5,
              defense: 30,
              speed: 0,
              critRate: 0,
              critDamage: 0,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 3 },
                    { itemId: "item_016", quantity: 80 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/leather_armor_icon.png",
              preview: "/images/equipment/leather_armor_preview.png",
            },
            lore: "Simple but effective protection for adventurers",
            tradeable: true,
          },
          {
            id: "accessory_003",
            name: "Health Amulet",
            description: "An amulet that boosts the wearer's vitality",
            rarity: "R",
            type: "accessory",
            subType: "necklace",
            allowedClasses: [],
            baseStats: {
              hp: 100,
              attack: 10,
              defense: 20,
              speed: 5,
              critRate: 2,
              critDamage: 5,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 2 },
                    { itemId: "item_016", quantity: 50 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/health_amulet_icon.png",
              preview: "/images/equipment/health_amulet_preview.png",
            },
            lore: "A charm blessed by village healers",
            tradeable: true,
          },
          // Additional Equipment Templates for more variety
          // More SSR Equipment
          {
            id: "weapon_006",
            name: "Moonlight Blade",
            description: "A blade that glows with ethereal moonlight",
            rarity: "SSR",
            type: "weapon",
            subType: "sword",
            allowedClasses: ["warrior", "assassin"],
            baseStats: {
              hp: 150,
              attack: 165,
              defense: 40,
              speed: 35,
              critRate: 18,
              critDamage: 45,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 2 },
                    { itemId: "item_016", quantity: 1200 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/moonlight_blade_icon.png",
              preview: "/images/equipment/moonlight_blade_preview.png",
            },
            lore: "Forged under a blood moon by celestial smiths",
            tradeable: false,
          },
          {
            id: "weapon_007",
            name: "Phoenix Staff",
            description: "A staff containing the power of a reborn phoenix",
            rarity: "SSR",
            type: "weapon",
            subType: "staff",
            allowedClasses: ["mage", "healer"],
            baseStats: {
              hp: 120,
              attack: 175,
              defense: 35,
              speed: 25,
              critRate: 16,
              critDamage: 38,
            },
            enhancementLevels: {
              maxLevel: 20,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_006", quantity: 2 },
                    { itemId: "item_016", quantity: 1100 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/phoenix_staff_icon.png",
              preview: "/images/equipment/phoenix_staff_preview.png",
            },
            lore: "Contains the eternal flame of rebirth",
            tradeable: false,
          },
          // More SR Equipment
          {
            id: "weapon_008",
            name: "Crystal Bow",
            description: "A bow carved from pure crystal that never misses",
            rarity: "SR",
            type: "weapon",
            subType: "bow",
            allowedClasses: ["archer"],
            baseStats: {
              hp: 90,
              attack: 95,
              defense: 25,
              speed: 45,
              critRate: 12,
              critDamage: 28,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 1 },
                    { itemId: "item_016", quantity: 600 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/crystal_bow_icon.png",
              preview: "/images/equipment/crystal_bow_preview.png",
            },
            lore: "Carved by master artisans from a single crystal",
            tradeable: true,
          },
          {
            id: "armor_004",
            name: "Knight's Plate",
            description: "Heavy armor worn by elite knights",
            rarity: "SR",
            type: "armor",
            subType: "chestplate",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 200,
              attack: 15,
              defense: 120,
              speed: -10,
              critRate: 0,
              critDamage: 0,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 2 },
                    { itemId: "item_016", quantity: 700 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/knight_plate_icon.png",
              preview: "/images/equipment/knight_plate_preview.png",
            },
            lore: "Forged for the kingdom's most trusted defenders",
            tradeable: true,
          },
          {
            id: "armor_005",
            name: "Shadow Cloak",
            description: "A cloak that grants stealth and agility",
            rarity: "SR",
            type: "armor",
            subType: "chestplate",
            allowedClasses: ["assassin", "archer"],
            baseStats: {
              hp: 100,
              attack: 30,
              defense: 60,
              speed: 40,
              critRate: 8,
              critDamage: 20,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 1 },
                    { itemId: "item_016", quantity: 550 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/shadow_cloak_icon.png",
              preview: "/images/equipment/shadow_cloak_preview.png",
            },
            lore: "Woven from shadows of the void",
            tradeable: true,
          },
          {
            id: "accessory_004",
            name: "Dragon Eye Pendant",
            description: "A pendant containing a real dragon's eye",
            rarity: "SR",
            type: "accessory",
            subType: "necklace",
            allowedClasses: [],
            baseStats: {
              hp: 80,
              attack: 50,
              defense: 30,
              speed: 20,
              critRate: 12,
              critDamage: 25,
            },
            enhancementLevels: {
              maxLevel: 15,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_011", quantity: 1 },
                    { itemId: "item_016", quantity: 450 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/dragon_eye_icon.png",
              preview: "/images/equipment/dragon_eye_preview.png",
            },
            lore: "The eye of an ancient dragon, still burning with power",
            tradeable: true,
          },
          // More R Equipment
          {
            id: "weapon_009",
            name: "Training Sword",
            description: "A practice sword for new recruits",
            rarity: "R",
            type: "weapon",
            subType: "sword",
            allowedClasses: ["warrior", "tank"],
            baseStats: {
              hp: 40,
              attack: 35,
              defense: 10,
              speed: 5,
              critRate: 2,
              critDamage: 8,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 3 },
                    { itemId: "item_016", quantity: 80 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/training_sword_icon.png",
              preview: "/images/equipment/training_sword_preview.png",
            },
            lore: "Every warrior's first companion",
            tradeable: true,
          },
          {
            id: "weapon_010",
            name: "Hunter's Bow",
            description: "A simple bow used by forest hunters",
            rarity: "R",
            type: "weapon",
            subType: "bow",
            allowedClasses: ["archer"],
            baseStats: {
              hp: 30,
              attack: 45,
              defense: 5,
              speed: 20,
              critRate: 5,
              critDamage: 12,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 4 },
                    { itemId: "item_016", quantity: 90 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/hunter_bow_icon.png",
              preview: "/images/equipment/hunter_bow_preview.png",
            },
            lore: "Crafted from the finest forest wood",
            tradeable: true,
          },
          {
            id: "armor_006",
            name: "Cloth Robe",
            description: "Basic robes for aspiring mages",
            rarity: "R",
            type: "armor",
            subType: "chestplate",
            allowedClasses: ["mage", "healer"],
            baseStats: {
              hp: 60,
              attack: 10,
              defense: 25,
              speed: 15,
              critRate: 2,
              critDamage: 5,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 2 },
                    { itemId: "item_016", quantity: 60 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/cloth_robe_icon.png",
              preview: "/images/equipment/cloth_robe_preview.png",
            },
            lore: "Simple robes for magical beginners",
            tradeable: true,
          },
          {
            id: "accessory_005",
            name: "Iron Ring",
            description: "A simple iron ring with minor enchantments",
            rarity: "R",
            type: "accessory",
            subType: "ring",
            allowedClasses: [],
            baseStats: {
              hp: 30,
              attack: 15,
              defense: 10,
              speed: 8,
              critRate: 3,
              critDamage: 8,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 1 },
                    { itemId: "item_016", quantity: 40 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/iron_ring_icon.png",
              preview: "/images/equipment/iron_ring_preview.png",
            },
            lore: "A beginner's first magical accessory",
            tradeable: true,
          },
          {
            id: "accessory_006",
            name: "Traveler's Boots",
            description: "Comfortable boots for long journeys",
            rarity: "R",
            type: "accessory",
            subType: "boots",
            allowedClasses: [],
            baseStats: {
              hp: 40,
              attack: 5,
              defense: 15,
              speed: 25,
              critRate: 1,
              critDamage: 3,
            },
            enhancementLevels: {
              maxLevel: 10,
              materials: [
                {
                  level: 1,
                  requirements: [
                    { itemId: "item_023", quantity: 2 },
                    { itemId: "item_016", quantity: 50 },
                  ],
                },
              ],
            },
            artwork: {
              icon: "/images/equipment/traveler_boots_icon.png",
              preview: "/images/equipment/traveler_boots_preview.png",
            },
            lore: "Worn by countless adventurers across the lands",
            tradeable: true,
          },
        ];

        // Save all data
        for (const charData of allCharacters) {
          const character = new Character(charData);
          await character.save();
        }

        for (const petData of pets) {
          const pet = new Pet(petData);
          await pet.save();
        }

        for (const itemData of items) {
          const item = new Item(itemData);
          await item.save();
        }

        for (const equipData of equipments) {
          const equipment = new Equipment(equipData);
          await equipment.save();
        }

        // Create gacha pool
        const gachaPool = new GachaPool({
          version: "1.0.0",
          characters: allCharacters.map((char) => ({
            id: char.id,
            name: char.name,
            rarity: char.rarity,
            stats: {
              hp: char.baseStats.hp,
              attack: char.baseStats.attack,
              defense: char.baseStats.defense,
            },
          })),
          pets: pets.map((pet) => ({
            id: pet.id,
            name: pet.name,
            rarity: pet.rarity,
            bonus: {
              type: pet.bonuses[0].target,
              value: pet.bonuses[0].value,
            },
          })),
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            effect: item.effects[0].type + " " + item.effects[0].value,
          })),
          equipments: equipments.map((equip) => ({
            id: equip.id,
            name: equip.name,
            rarity: equip.rarity,
            type: equip.type,
            stats: {
              hp: equip.baseStats.hp || 0,
              attack: equip.baseStats.attack || 0,
              defense: equip.baseStats.defense || 0,
              speed: equip.baseStats.speed || 0,
              critRate: (equip.baseStats.critRate || 0) / 100, // Convert percentage to decimal
              critDamage: (equip.baseStats.critDamage || 0) / 100, // Convert percentage to decimal
            },
          })),
          banners: [
            {
              id: "standard_banner",
              name: "Standard Summon",
              type: "standard",
              featured: {
                items: [],
                rateUp: 0,
              },
              cost: {
                currency: "gems",
                amount: 160,
                discount: {
                  multiPull: 0,
                },
              },
              isActive: true,
            },
            {
              id: "fire_knight_banner",
              name: "Fire Knight Rate UP!",
              type: "event",
              featured: {
                items: ["char_001"],
                rateUp: 0.5,
              },
              cost: {
                currency: "gems",
                amount: 160,
                discount: {
                  multiPull: 0,
                },
              },
              duration: {
                start: new Date(),
                end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
              isActive: true,
            },
          ],
          rates: {
            R: 0.85,
            SR: 0.13,
            SSR: 0.02,
          },
        });

        await gachaPool.save();

        return {
          success: true,
          message: "Sample data initialized successfully",
          summary: {
            charactersAdded: allCharacters.length,
            petsAdded: pets.length,
            itemsAdded: items.length,
            equipmentsAdded: equipments.length,
            gachaPoolCreated: true,
            breakdown: {
              characters: {
                SSR: 5,
                SR: 10,
                R: 5,
                total: allCharacters.length,
              },
              pets: {
                SSR: 3,
                SR: 5,
                R: 7,
                total: pets.length,
              },
              items: {
                SSR: 3,
                SR: 8,
                R: 12,
                total: items.length,
              },
              equipments: {
                SSR: 4,
                SR: 4,
                R: 3,
                total: equipments.length,
              },
            },
          },
        };
      }
    } catch (error: any) {
      console.error("Error initializing sample data:", error);
      return {
        success: false,
        message: error.message || "Failed to initialize sample data",
      };
    }
  }

  // Helper function to get emoji based on element and character type
  private static getCharacterEmoji(
    element: string,
    characterType: string
  ): string {
    const emojiMap: { [key: string]: { [key: string]: string } } = {
      fire: {
        warrior: "🔥",
        mage: "🔥",
        archer: "🔥",
        healer: "🔥",
        tank: "🔥",
      },
      water: {
        warrior: "💧",
        mage: "💧",
        archer: "💧",
        healer: "💧",
        tank: "💧",
      },
      earth: {
        warrior: "🌍",
        mage: "🌍",
        archer: "🌍",
        healer: "🌍",
        tank: "🌍",
      },
      air: {
        warrior: "⚡",
        mage: "⚡",
        archer: "⚡",
        healer: "⚡",
        tank: "⚡",
      },
      light: {
        warrior: "✨",
        mage: "✨",
        archer: "✨",
        healer: "✨",
        tank: "✨",
      },
      dark: {
        warrior: "🌑",
        mage: "🌑",
        archer: "🌑",
        healer: "🌑",
        tank: "🌑",
      },
      neutral: {
        warrior: "⚔️",
        mage: "🔮",
        archer: "🏹",
        healer: "💊",
        tank: "🛡️",
      },
    };

    return emojiMap[element]?.[characterType] || "👤";
  }
}
