import { Character } from "../models/character.model";
import { Pet } from "../models/pet.model";
import { Item } from "../models/item.model";
import { GachaPool } from "../models/gacha-pool.model";

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
      await Character.deleteMany({});
      await Pet.deleteMany({});
      await Item.deleteMany({});
      await GachaPool.deleteMany({});

      return {
        success: true,
        message: "All data cleared successfully",
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
      // Clear existing data first
      await Character.deleteMany({});
      await Pet.deleteMany({});
      await Item.deleteMany({});
      await GachaPool.deleteMany({});

      // Sample Characters
      const characters = [
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
            icon: "/images/characters/fire_knight_icon.png",
            portrait: "/images/characters/fire_knight_portrait.png",
            fullArt: "/images/characters/fire_knight_full.png",
          },
          lore: "A noble knight wielding the power of flames.",
        },
        {
          id: "char_002",
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
              id: "skill_002",
              name: "Ice Shard",
              description: "Deals water damage and may freeze",
              cooldown: 2,
              manaCost: 25,
            },
          ],
          maxLevel: 60,
          artwork: {
            icon: "/images/characters/water_mage_icon.png",
            portrait: "/images/characters/water_mage_portrait.png",
            fullArt: "/images/characters/water_mage_full.png",
          },
          lore: "A wise mage controlling the flow of water.",
        },
        {
          id: "char_003",
          name: "Earth Guard",
          rarity: "R",
          element: "earth",
          characterType: "tank",
          baseStats: {
            hp: 1400,
            attack: 100,
            defense: 180,
            speed: 70,
            critRate: 8,
            critDamage: 120,
          },
          growthRates: {
            hp: 55,
            attack: 4,
            defense: 9,
            speed: 1,
          },
          skills: [
            {
              id: "skill_003",
              name: "Rock Shield",
              description: "Increases defense for all allies",
              cooldown: 3,
              manaCost: 30,
            },
          ],
          maxLevel: 60,
          artwork: {
            icon: "/images/characters/earth_guard_icon.png",
            portrait: "/images/characters/earth_guard_portrait.png",
            fullArt: "/images/characters/earth_guard_full.png",
          },
          lore: "A sturdy guardian protecting with earth's strength.",
        },
      ];

      // Sample Pets
      const pets = [
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
              id: "pet_skill_002",
              name: "Healing Light",
              description: "Restores HP to all allies",
              cooldown: 4,
              effect: "party_heal",
            },
          ],
          maxLevel: 40,
          artwork: {
            icon: "/images/pets/healing_fairy_icon.png",
            portrait: "/images/pets/healing_fairy_portrait.png",
            fullArt: "/images/pets/healing_fairy_full.png",
          },
          lore: "A mystical fairy that brings hope and healing.",
        },
      ];

      // Sample Items
      const items = [
        {
          id: "item_001",
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
          id: "item_002",
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
      ];

      // Save all data
      for (const charData of characters) {
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

      // Create gacha pool
      const gachaPool = new GachaPool({
        version: "1.0.0",
        characters: characters.map((char) => ({
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
          charactersAdded: characters.length,
          petsAdded: pets.length,
          itemsAdded: items.length,
          gachaPoolCreated: true,
        },
      };
    } catch (error: any) {
      console.error("Error initializing sample data:", error);
      return {
        success: false,
        message: error.message || "Failed to initialize sample data",
      };
    }
  }
}
