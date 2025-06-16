import { connectDatabase } from "../config/database";
import { GachaPool } from "../models/gacha-pool.model";
import { Character } from "../models/character.model";
import { Item } from "../models/item.model";
import { Pet } from "../models/pet.model";

const seedData = async () => {
  try {
    console.log("🌱 Starting data seeding...");
    await connectDatabase();

    // Clear existing data
    await GachaPool.deleteMany({});
    await Character.deleteMany({});
    await Item.deleteMany({});
    await Pet.deleteMany({});

    console.log("🗑️ Cleared existing data");

    // Sample Characters
    const characters = [
      {
        id: "char_001",
        name: "Fire Knight",
        rarity: "SSR" as const,
        element: "fire" as const,
        characterType: "warrior" as const,
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
        rarity: "SR" as const,
        element: "water" as const,
        characterType: "mage" as const,
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
        rarity: "R" as const,
        element: "earth" as const,
        characterType: "tank" as const,
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
        rarity: "SSR" as const,
        element: "fire" as const,
        petType: "battle" as const,
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
        rarity: "SR" as const,
        element: "light" as const,
        petType: "support" as const,
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
      {
        id: "pet_003",
        name: "Lucky Cat",
        rarity: "R" as const,
        element: "neutral" as const,
        petType: "farming" as const,
        baseStats: {
          hp: 200,
          attack: 30,
          defense: 40,
          speed: 80,
        },
        bonuses: [
          {
            type: "resource_bonus",
            target: "coin_drop",
            value: 15,
            description: "Increases coin drops by 15%",
          },
        ],
        skills: [
          {
            id: "pet_skill_003",
            name: "Lucky Charm",
            description: "Increases item drop rate",
            cooldown: 5,
            effect: "luck_boost",
          },
        ],
        maxLevel: 40,
        artwork: {
          icon: "/images/pets/lucky_cat_icon.png",
          portrait: "/images/pets/lucky_cat_portrait.png",
          fullArt: "/images/pets/lucky_cat_full.png",
        },
        lore: "A charming cat that brings good fortune.",
      },
    ];

    // Sample Items
    const items = [
      {
        id: "item_001",
        name: "Health Potion",
        description: "A basic healing potion that restores 500 HP",
        rarity: "R" as const,
        type: "consumable" as const,
        subType: "potion" as const,
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
        rarity: "SR" as const,
        type: "material" as const,
        subType: "essence" as const,
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
        id: "item_003",
        name: "Legendary Essence",
        description: "An extremely rare essence for ultimate evolution",
        rarity: "SSR" as const,
        type: "material" as const,
        subType: "essence" as const,
        effects: [
          {
            type: "craft",
            value: 1,
            target: "character",
          },
        ],
        stackLimit: 10,
        sellPrice: 1000,
        tradeable: false,
        artwork: {
          icon: "/images/items/legendary_essence_icon.png",
          thumbnail: "/images/items/legendary_essence_thumb.png",
        },
      },
    ];

    // Save characters
    for (const charData of characters) {
      const character = new Character(charData);
      await character.save();
    }
    console.log(`✅ Created ${characters.length} characters`);

    // Save pets
    for (const petData of pets) {
      const pet = new Pet(petData);
      await pet.save();
    }
    console.log(`✅ Created ${pets.length} pets`);

    // Save items
    for (const itemData of items) {
      const item = new Item(itemData);
      await item.save();
    }
    console.log(`✅ Created ${items.length} items`);

    // Create Gacha Pool
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
              multiPull: 1600, // 10x for price of 10x (no discount for standard)
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
            rateUp: 0.5, // 50% chance to get featured when getting SSR
          },
          cost: {
            currency: "gems",
            amount: 160,
            discount: {
              multiPull: 1600,
            },
          },
          duration: {
            start: new Date(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
          isActive: true,
        },
        {
          id: "pet_paradise_banner",
          name: "Pet Paradise",
          type: "event",
          featured: {
            items: ["pet_001", "pet_002"],
            rateUp: 0.4,
          },
          cost: {
            currency: "gems",
            amount: 160,
            discount: {
              multiPull: 1600,
            },
          },
          duration: {
            start: new Date(),
            end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
          },
          isActive: true,
        },
      ],
      rates: {
        R: 0.85, // 85%
        SR: 0.13, // 13%
        SSR: 0.02, // 2%
      },
    });

    await gachaPool.save();
    console.log("✅ Created gacha pool with banners");

    console.log("🎉 Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
