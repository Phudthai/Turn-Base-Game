import { Character } from "../models/character.model";
import { Pet } from "../models/pet.model";
import { UserCharacter } from "../models/user-character.model";
import { UserPet } from "../models/user-pet.model";
import { User } from "../models/user.model";
import { Item, UserItem } from "../models/item.model";
import { GachaPool } from "../models/gacha-pool.model";

export const seedCharacters = async () => {
  try {
    // Check if characters already exist
    const existingCount = await Character.countDocuments();
    if (existingCount > 0) {
      console.log("✅ Characters already seeded");
      return;
    }

    const characters = [
      // SSR Characters - Legendary Heroes
      {
        id: "char_ssr_001",
        name: "Dragon Knight Aria",
        rarity: "SSR" as const,
        element: "fire" as const,
        characterType: "warrior" as const,
        baseStats: {
          hp: 1200,
          attack: 180,
          defense: 120,
          speed: 90,
          critRate: 15,
          critDamage: 200,
        },
        growthRates: {
          hp: 25,
          attack: 4,
          defense: 3,
          speed: 2,
        },
        skills: [
          {
            id: "skill_001",
            name: "🔥 Dragon Flame",
            description: "Massive fire attack that burns enemies",
            cooldown: 3,
            manaCost: 30,
          },
          {
            id: "skill_001b",
            name: "🛡️ Dragon Scale",
            description: "Increases defense dramatically",
            cooldown: 4,
            manaCost: 25,
          },
        ],
        maxLevel: 80,
        artwork: {
          icon: "🐉",
          portrait: "🐉",
          fullArt: "🐉",
        },
        lore: "A legendary knight who tamed dragons",
      },
      {
        id: "char_ssr_002",
        name: "Archmage Zephyr",
        rarity: "SSR" as const,
        element: "air" as const,
        characterType: "mage" as const,
        baseStats: {
          hp: 800,
          attack: 220,
          defense: 80,
          speed: 130,
          critRate: 20,
          critDamage: 250,
        },
        growthRates: {
          hp: 18,
          attack: 5,
          defense: 2,
          speed: 3,
        },
        skills: [
          {
            id: "skill_002",
            name: "⚡ Storm Bolt",
            description: "Lightning magic that chains between enemies",
            cooldown: 2,
            manaCost: 40,
          },
          {
            id: "skill_002b",
            name: "🌪️ Tornado",
            description: "Hits all enemies with wind magic",
            cooldown: 5,
            manaCost: 50,
          },
        ],
        maxLevel: 80,
        artwork: {
          icon: "⚡",
          portrait: "⚡",
          fullArt: "⚡",
        },
        lore: "Master of wind and lightning magic",
      },
      {
        id: "char_ssr_003",
        name: "Shadow Assassin Kage",
        rarity: "SSR" as const,
        element: "dark" as const,
        characterType: "assassin" as const,
        baseStats: {
          hp: 950,
          attack: 200,
          defense: 90,
          speed: 150,
          critRate: 35,
          critDamage: 300,
        },
        growthRates: {
          hp: 20,
          attack: 4.5,
          defense: 2,
          speed: 4,
        },
        skills: [
          {
            id: "skill_003",
            name: "🗡️ Shadow Strike",
            description: "Critical hit that ignores defense",
            cooldown: 2,
            manaCost: 35,
          },
          {
            id: "skill_003b",
            name: "👤 Shadow Clone",
            description: "Creates shadow copies for extra attacks",
            cooldown: 6,
            manaCost: 45,
          },
        ],
        maxLevel: 80,
        artwork: {
          icon: "🥷",
          portrait: "🥷",
          fullArt: "🥷",
        },
        lore: "Master assassin who controls shadows",
      },
      {
        id: "char_ssr_004",
        name: "Divine Oracle Luna",
        rarity: "SSR" as const,
        element: "light" as const,
        characterType: "healer" as const,
        baseStats: {
          hp: 1100,
          attack: 140,
          defense: 110,
          speed: 100,
          critRate: 12,
          critDamage: 150,
        },
        growthRates: {
          hp: 24,
          attack: 3,
          defense: 3.5,
          speed: 2.5,
        },
        skills: [
          {
            id: "skill_004",
            name: "✨ Divine Light",
            description: "Heals all allies and removes debuffs",
            cooldown: 3,
            manaCost: 40,
          },
          {
            id: "skill_004b",
            name: "🛡️ Sacred Barrier",
            description: "Protects all allies from next attack",
            cooldown: 5,
            manaCost: 35,
          },
        ],
        maxLevel: 80,
        artwork: {
          icon: "👼",
          portrait: "👼",
          fullArt: "👼",
        },
        lore: "Blessed oracle with divine powers",
      },
      {
        id: "char_ssr_005",
        name: "Demon Lord Bael",
        rarity: "SSR" as const,
        element: "dark" as const,
        characterType: "warrior" as const,
        baseStats: {
          hp: 1400,
          attack: 195,
          defense: 130,
          speed: 80,
          critRate: 18,
          critDamage: 220,
        },
        growthRates: {
          hp: 28,
          attack: 4.2,
          defense: 3.8,
          speed: 1.5,
        },
        skills: [
          {
            id: "skill_005",
            name: "💀 Soul Drain",
            description: "Drains enemy HP and gains power",
            cooldown: 3,
            manaCost: 35,
          },
          {
            id: "skill_005b",
            name: "🔥 Hellfire",
            description: "Dark fire that burns all enemies",
            cooldown: 4,
            manaCost: 45,
          },
        ],
        maxLevel: 80,
        artwork: {
          icon: "👹",
          portrait: "👹",
          fullArt: "👹",
        },
        lore: "Fallen angel who became a demon lord",
      },

      // SR Characters - Elite Warriors
      {
        id: "char_sr_001",
        name: "Forest Ranger Luna",
        rarity: "SR" as const,
        element: "earth" as const,
        characterType: "archer" as const,
        baseStats: {
          hp: 900,
          attack: 150,
          defense: 90,
          speed: 120,
          critRate: 25,
          critDamage: 180,
        },
        growthRates: {
          hp: 20,
          attack: 3.5,
          defense: 2.5,
          speed: 3,
        },
        skills: [
          {
            id: "skill_006",
            name: "🏹 Nature's Arrow",
            description: "Earth-infused arrow with poison effect",
            cooldown: 2,
            manaCost: 25,
          },
          {
            id: "skill_006b",
            name: "🌿 Forest Blessing",
            description: "Heals and increases team speed",
            cooldown: 4,
            manaCost: 30,
          },
        ],
        maxLevel: 70,
        artwork: {
          icon: "🏹",
          portrait: "🏹",
          fullArt: "🏹",
        },
        lore: "Guardian of the ancient forest",
      },
      {
        id: "char_sr_002",
        name: "Ice Queen Elsa",
        rarity: "SR" as const,
        element: "water" as const,
        characterType: "mage" as const,
        baseStats: {
          hp: 850,
          attack: 170,
          defense: 85,
          speed: 110,
          critRate: 15,
          critDamage: 160,
        },
        growthRates: {
          hp: 19,
          attack: 4,
          defense: 2.5,
          speed: 3,
        },
        skills: [
          {
            id: "skill_007",
            name: "❄️ Ice Blast",
            description: "Freezes enemy and deals ice damage",
            cooldown: 2,
            manaCost: 28,
          },
          {
            id: "skill_007b",
            name: "🧊 Blizzard",
            description: "Area ice attack that slows all enemies",
            cooldown: 4,
            manaCost: 40,
          },
        ],
        maxLevel: 70,
        artwork: {
          icon: "❄️",
          portrait: "❄️",
          fullArt: "❄️",
        },
        lore: "Queen who commands ice and snow",
      },
      {
        id: "char_sr_003",
        name: "Thunder Berserker Ragnar",
        rarity: "SR" as const,
        element: "air" as const,
        characterType: "warrior" as const,
        baseStats: {
          hp: 1000,
          attack: 165,
          defense: 95,
          speed: 105,
          critRate: 20,
          critDamage: 175,
        },
        growthRates: {
          hp: 22,
          attack: 3.8,
          defense: 2.8,
          speed: 2.5,
        },
        skills: [
          {
            id: "skill_008",
            name: "⚡ Thunder Punch",
            description: "Electric attack that may stun",
            cooldown: 2,
            manaCost: 24,
          },
          {
            id: "skill_008b",
            name: "💥 Berserker Rage",
            description: "Increases attack but lowers defense",
            cooldown: 5,
            manaCost: 20,
          },
        ],
        maxLevel: 70,
        artwork: {
          icon: "⚡",
          portrait: "⚡",
          fullArt: "⚡",
        },
        lore: "Viking warrior blessed by thunder gods",
      },
      {
        id: "char_sr_004",
        name: "Phoenix Summoner Pyra",
        rarity: "SR" as const,
        element: "fire" as const,
        characterType: "summoner" as const,
        baseStats: {
          hp: 880,
          attack: 160,
          defense: 80,
          speed: 115,
          critRate: 18,
          critDamage: 165,
        },
        growthRates: {
          hp: 20,
          attack: 3.8,
          defense: 2.2,
          speed: 3.2,
        },
        skills: [
          {
            id: "skill_009",
            name: "🔥 Phoenix Fire",
            description: "Fire attack that may revive fallen allies",
            cooldown: 3,
            manaCost: 35,
          },
          {
            id: "skill_009b",
            name: "🦅 Phoenix Shield",
            description: "Fire barrier that reflects damage",
            cooldown: 4,
            manaCost: 30,
          },
        ],
        maxLevel: 70,
        artwork: {
          icon: "🔥",
          portrait: "🔥",
          fullArt: "🔥",
        },
        lore: "Summoner who commands the phoenix",
      },
      {
        id: "char_sr_005",
        name: "Stone Guardian Titan",
        rarity: "SR" as const,
        element: "earth" as const,
        characterType: "tank" as const,
        baseStats: {
          hp: 1300,
          attack: 120,
          defense: 180,
          speed: 60,
          critRate: 8,
          critDamage: 130,
        },
        growthRates: {
          hp: 26,
          attack: 2.8,
          defense: 4.5,
          speed: 1,
        },
        skills: [
          {
            id: "skill_010",
            name: "🗿 Rock Smash",
            description: "Heavy attack that reduces enemy defense",
            cooldown: 3,
            manaCost: 25,
          },
          {
            id: "skill_010b",
            name: "🛡️ Stone Wall",
            description: "Protects all allies and reflects damage",
            cooldown: 5,
            manaCost: 35,
          },
        ],
        maxLevel: 70,
        artwork: {
          icon: "🗿",
          portrait: "🗿",
          fullArt: "🗿",
        },
        lore: "Ancient guardian made of living stone",
      },

      // R Characters - Common Heroes
      {
        id: "char_r_001",
        name: "Rookie Swordsman",
        rarity: "R" as const,
        element: "neutral" as const,
        characterType: "warrior" as const,
        baseStats: {
          hp: 600,
          attack: 80,
          defense: 60,
          speed: 70,
          critRate: 5,
          critDamage: 120,
        },
        growthRates: {
          hp: 15,
          attack: 2,
          defense: 2,
          speed: 1.5,
        },
        skills: [
          {
            id: "skill_011",
            name: "⚔️ Basic Slash",
            description: "Simple sword attack",
            cooldown: 1,
            manaCost: 10,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "⚔️",
          portrait: "⚔️",
          fullArt: "⚔️",
        },
        lore: "A beginner warrior with potential",
      },
      {
        id: "char_r_002",
        name: "Village Mage",
        rarity: "R" as const,
        element: "water" as const,
        characterType: "mage" as const,
        baseStats: {
          hp: 450,
          attack: 90,
          defense: 40,
          speed: 85,
          critRate: 8,
          critDamage: 130,
        },
        growthRates: {
          hp: 12,
          attack: 2.5,
          defense: 1.5,
          speed: 2,
        },
        skills: [
          {
            id: "skill_012",
            name: "💧 Water Splash",
            description: "Basic water magic",
            cooldown: 1,
            manaCost: 15,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "💧",
          portrait: "💧",
          fullArt: "💧",
        },
        lore: "A village mage learning the arts",
      },
      {
        id: "char_r_003",
        name: "Fire Sprite",
        rarity: "R" as const,
        element: "fire" as const,
        characterType: "mage" as const,
        baseStats: {
          hp: 420,
          attack: 95,
          defense: 35,
          speed: 90,
          critRate: 12,
          critDamage: 140,
        },
        growthRates: {
          hp: 11,
          attack: 2.8,
          defense: 1.2,
          speed: 2.5,
        },
        skills: [
          {
            id: "skill_013",
            name: "🔥 Fire Ball",
            description: "Basic fire spell",
            cooldown: 2,
            manaCost: 18,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "🔥",
          portrait: "🔥",
          fullArt: "🔥",
        },
        lore: "Playful fire spirit",
      },
      {
        id: "char_r_004",
        name: "Wind Scout",
        rarity: "R" as const,
        element: "air" as const,
        characterType: "archer" as const,
        baseStats: {
          hp: 520,
          attack: 85,
          defense: 45,
          speed: 110,
          critRate: 15,
          critDamage: 145,
        },
        growthRates: {
          hp: 13,
          attack: 2.3,
          defense: 1.8,
          speed: 3,
        },
        skills: [
          {
            id: "skill_014",
            name: "🏹 Wind Arrow",
            description: "Fast arrow attack",
            cooldown: 1,
            manaCost: 12,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "🏹",
          portrait: "🏹",
          fullArt: "🏹",
        },
        lore: "Swift scout with wind magic",
      },
      {
        id: "char_r_005",
        name: "Earth Golem",
        rarity: "R" as const,
        element: "earth" as const,
        characterType: "tank" as const,
        baseStats: {
          hp: 750,
          attack: 65,
          defense: 95,
          speed: 45,
          critRate: 3,
          critDamage: 110,
        },
        growthRates: {
          hp: 18,
          attack: 1.5,
          defense: 3,
          speed: 0.8,
        },
        skills: [
          {
            id: "skill_015",
            name: "👊 Rock Punch",
            description: "Heavy earth attack",
            cooldown: 2,
            manaCost: 15,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "🗿",
          portrait: "🗿",
          fullArt: "🗿",
        },
        lore: "Animated rock creature",
      },
      {
        id: "char_r_006",
        name: "Light Cleric",
        rarity: "R" as const,
        element: "light" as const,
        characterType: "healer" as const,
        baseStats: {
          hp: 580,
          attack: 70,
          defense: 55,
          speed: 75,
          critRate: 6,
          critDamage: 115,
        },
        growthRates: {
          hp: 14,
          attack: 1.8,
          defense: 2.2,
          speed: 2,
        },
        skills: [
          {
            id: "skill_016",
            name: "✨ Minor Heal",
            description: "Basic healing spell",
            cooldown: 2,
            manaCost: 16,
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "✨",
          portrait: "✨",
          fullArt: "✨",
        },
        lore: "Novice healer of the light",
      },
    ];

    await Character.insertMany(characters);
    console.log("✅ Characters seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding characters:", error);
  }
};

export const seedPets = async () => {
  try {
    // Check if pets already exist
    const existingCount = await Pet.countDocuments();
    if (existingCount > 0) {
      console.log("✅ Pets already seeded");
      return;
    }

    const pets = [
      // SSR Pets
      {
        id: "pet_ssr_001",
        name: "Phoenix Companion",
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
            type: "stat_boost" as const,
            target: "fire_damage",
            value: 25,
            description: "Increases fire damage by 25%",
          },
        ],
        skills: [
          {
            id: "pet_skill_001",
            name: "Phoenix Fire",
            description: "Deals fire damage to enemies",
            cooldown: 3,
            effect: "fire_damage",
          },
        ],
        maxLevel: 60,
        artwork: {
          icon: "🔥",
          portrait: "🔥",
          fullArt: "🔥",
        },
        lore: "A legendary phoenix that aids in battle",
      },

      // SR Pets
      {
        id: "pet_sr_001",
        name: "Crystal Wolf",
        rarity: "SR" as const,
        element: "earth" as const,
        petType: "support" as const,
        baseStats: {
          hp: 300,
          attack: 60,
          defense: 80,
          speed: 70,
        },
        bonuses: [
          {
            type: "experience_boost" as const,
            target: "all",
            value: 15,
            description: "Increases EXP gain by 15%",
          },
        ],
        skills: [
          {
            id: "pet_skill_002",
            name: "Crystal Shield",
            description: "Provides defense boost",
            cooldown: 4,
            effect: "defense_boost",
          },
        ],
        maxLevel: 50,
        artwork: {
          icon: "🐺",
          portrait: "🐺",
          fullArt: "🐺",
        },
        lore: "A mystical wolf with crystal fur",
      },

      // R Pets
      {
        id: "pet_r_001",
        name: "Forest Sprite",
        rarity: "R" as const,
        element: "earth" as const,
        petType: "farming" as const,
        baseStats: {
          hp: 200,
          attack: 30,
          defense: 40,
          speed: 60,
        },
        bonuses: [
          {
            type: "resource_bonus" as const,
            target: "materials",
            value: 10,
            description: "Increases material drop rate by 10%",
          },
        ],
        skills: [
          {
            id: "pet_skill_003",
            name: "Nature's Blessing",
            description: "Increases resource gathering",
            cooldown: 5,
            effect: "resource_boost",
          },
        ],
        maxLevel: 40,
        artwork: {
          icon: "🧚",
          portrait: "🧚",
          fullArt: "🧚",
        },
        lore: "A helpful sprite that aids in gathering",
      },
      {
        id: "pet_r_002",
        name: "Wind Rabbit",
        rarity: "R" as const,
        element: "air" as const,
        petType: "passive" as const,
        baseStats: {
          hp: 150,
          attack: 25,
          defense: 30,
          speed: 100,
        },
        bonuses: [
          {
            type: "stat_boost" as const,
            target: "speed",
            value: 5,
            description: "Increases speed by 5%",
          },
        ],
        skills: [
          {
            id: "pet_skill_004",
            name: "Wind Dash",
            description: "Increases movement speed",
            cooldown: 2,
            effect: "speed_boost",
          },
        ],
        maxLevel: 40,
        artwork: {
          icon: "🐰",
          portrait: "🐰",
          fullArt: "🐰",
        },
        lore: "A swift rabbit that loves the wind",
      },
    ];

    await Pet.insertMany(pets);
    console.log("✅ Pets seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding pets:", error);
  }
};

export const seedItems = async () => {
  try {
    // Check if items already exist
    const existingCount = await Item.countDocuments();
    if (existingCount > 0) {
      console.log("✅ Items already seeded");
      return;
    }

    const items = [
      // SSR Items
      {
        id: "item_ssr_001",
        name: "Legendary Enhancement Crystal",
        description: "A rare crystal that greatly enhances character abilities",
        rarity: "SSR" as const,
        type: "enhancement" as const,
        subType: "gem" as const,
        effects: [
          {
            type: "buff" as const,
            value: 50,
            duration: 3600,
            target: "character" as const,
          },
        ],
        stackLimit: 10,
        sellPrice: 5000,
        tradeable: true,
        artwork: {
          icon: "💎",
          thumbnail: "💎",
        },
      },
      {
        id: "item_ssr_002",
        name: "Phoenix Feather",
        description: "A mystical feather that grants resurrection power",
        rarity: "SSR" as const,
        type: "special" as const,
        subType: "essence" as const,
        effects: [
          {
            type: "heal" as const,
            value: 100,
            target: "character" as const,
          },
        ],
        stackLimit: 5,
        sellPrice: 8000,
        tradeable: false,
        artwork: {
          icon: "🪶",
          thumbnail: "🪶",
        },
      },

      // SR Items
      {
        id: "item_sr_001",
        name: "Magic Enhancement Potion",
        description: "A powerful potion that boosts magical abilities",
        rarity: "SR" as const,
        type: "consumable" as const,
        subType: "potion" as const,
        effects: [
          {
            type: "buff" as const,
            value: 25,
            duration: 1800,
            target: "character" as const,
          },
        ],
        stackLimit: 50,
        sellPrice: 1000,
        tradeable: true,
        artwork: {
          icon: "🧪",
          thumbnail: "🧪",
        },
      },
      {
        id: "item_sr_002",
        name: "Experience Scroll",
        description: "A scroll that grants bonus experience points",
        rarity: "SR" as const,
        type: "consumable" as const,
        subType: "scroll" as const,
        effects: [
          {
            type: "experience" as const,
            value: 1000,
            target: "character" as const,
          },
        ],
        stackLimit: 99,
        sellPrice: 500,
        tradeable: true,
        artwork: {
          icon: "📜",
          thumbnail: "📜",
        },
      },
      {
        id: "item_sr_003",
        name: "Mystic Ore",
        description: "Rare ore used for crafting powerful equipment",
        rarity: "SR" as const,
        type: "material" as const,
        subType: "ore" as const,
        effects: [
          {
            type: "craft" as const,
            value: 1,
            target: "user" as const,
          },
        ],
        stackLimit: 999,
        sellPrice: 750,
        tradeable: true,
        artwork: {
          icon: "⛏️",
          thumbnail: "⛏️",
        },
      },

      // R Items
      {
        id: "item_r_001",
        name: "Health Potion",
        description: "A basic potion that restores health",
        rarity: "R" as const,
        type: "consumable" as const,
        subType: "potion" as const,
        effects: [
          {
            type: "heal" as const,
            value: 50,
            target: "character" as const,
          },
        ],
        stackLimit: 99,
        sellPrice: 100,
        tradeable: true,
        artwork: {
          icon: "🍶",
          thumbnail: "🍶",
        },
      },
      {
        id: "item_r_002",
        name: "Energy Drink",
        description: "A refreshing drink that restores energy",
        rarity: "R" as const,
        type: "consumable" as const,
        subType: "potion" as const,
        effects: [
          {
            type: "buff" as const,
            value: 10,
            duration: 600,
            target: "character" as const,
          },
        ],
        stackLimit: 99,
        sellPrice: 50,
        tradeable: true,
        artwork: {
          icon: "🥤",
          thumbnail: "🥤",
        },
      },
      {
        id: "item_r_003",
        name: "Iron Ore",
        description: "Common ore used for basic crafting",
        rarity: "R" as const,
        type: "material" as const,
        subType: "ore" as const,
        effects: [
          {
            type: "craft" as const,
            value: 1,
            target: "user" as const,
          },
        ],
        stackLimit: 999,
        sellPrice: 25,
        tradeable: true,
        artwork: {
          icon: "🪨",
          thumbnail: "🪨",
        },
      },
      {
        id: "item_r_004",
        name: "Gem Token",
        description: "A token that can be exchanged for gems",
        rarity: "R" as const,
        type: "currency" as const,
        subType: "token" as const,
        effects: [
          {
            type: "currency" as const,
            value: 100,
            target: "user" as const,
          },
        ],
        stackLimit: 999,
        sellPrice: 10,
        tradeable: true,
        artwork: {
          icon: "🎫",
          thumbnail: "🎫",
        },
      },
    ];

    await Item.insertMany(items);
    console.log("✅ Items seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding items:", error);
  }
};

export const seedGachaPool = async () => {
  try {
    // Check if gacha pool already exists
    const existingPool = await GachaPool.countDocuments();
    if (existingPool > 0) {
      console.log("✅ Gacha pool already exists");
      return;
    }

    // Get all templates
    const characters = await Character.find({});
    const pets = await Pet.find({});
    const items = await Item.find({});

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
          type: pet.bonuses[0]?.target || "character",
          value: pet.bonuses[0]?.value || 0,
        },
      })),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        effect:
          item.effects[0]?.type + " " + item.effects[0]?.value || "unknown",
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
            items: ["char_fire_001"],
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
            items: ["pet_dragon_001", "pet_phoenix_001"],
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
        {
          id: "treasure_hunt_banner",
          name: "Treasure Hunt - Items Galore!",
          type: "event",
          featured: {
            items: ["item_ssr_001", "item_ssr_002", "item_sr_001"],
            rateUp: 0.6, // Higher rate for items
          },
          cost: {
            currency: "gems",
            amount: 120, // Cheaper for item banner
            discount: {
              multiPull: 1200,
            },
          },
          duration: {
            start: new Date(),
            end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
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
    console.log(
      `✅ Gacha pool created with ${characters.length} characters, ${pets.length} pets, ${items.length} items, and 4 banners`
    );
  } catch (error) {
    console.error("❌ Error seeding gacha pool:", error);
  }
};

export const seedUserInventory = async () => {
  try {
    // Find test user
    const testUser = await User.findOne({ username: "testuser" });
    if (!testUser) {
      console.log("⚠️ Test user not found, skipping inventory seeding");
      return;
    }

    // Check if user already has characters
    const existingCharacters = await UserCharacter.countDocuments({
      userId: testUser._id.toString(),
    });
    if (existingCharacters > 0) {
      console.log("✅ User inventory already seeded");
      return;
    }

    // Get all character and pet templates
    const characters = await Character.find({});
    const pets = await Pet.find({});

    // Create user characters with different levels for testing
    const userCharacters = [];
    for (const char of characters) {
      // Create multiple instances with different levels
      const levels =
        char.rarity === "SSR"
          ? [1, 25, 50]
          : char.rarity === "SR"
          ? [1, 15, 30]
          : [1, 10];

      for (const level of levels) {
        const stats = {
          hp: char.baseStats.hp + char.growthRates.hp * level,
          attack: char.baseStats.attack + char.growthRates.attack * level,
          defense: char.baseStats.defense + char.growthRates.defense * level,
          speed: char.baseStats.speed + char.growthRates.speed * level,
          critRate: char.baseStats.critRate,
          critDamage: char.baseStats.critDamage,
        };

        userCharacters.push({
          userId: testUser._id.toString(),
          characterId: char.id,
          level: level,
          experience: level * 100,
          currentStats: stats,
          skillLevels: char.skills.map((skill) => ({
            skillId: skill.id,
            level: 1,
          })),
          evolution: { stage: 0, materials: [] },
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
            obtainedFrom: "gacha",
            isLocked: Math.random() > 0.8, // 20% chance to be locked
            isFavorite: Math.random() > 0.7, // 30% chance to be favorite
            nickname: null,
          },
        });
      }
    }

    // Create user pets with different levels
    const userPets = [];
    for (const pet of pets) {
      const levels =
        pet.rarity === "SSR"
          ? [1, 20, 40]
          : pet.rarity === "SR"
          ? [1, 15, 30]
          : [1, 10, 20];

      for (const level of levels) {
        const stats = {
          hp: pet.baseStats.hp + Math.floor(pet.baseStats.hp * 0.05 * level),
          attack:
            pet.baseStats.attack +
            Math.floor(pet.baseStats.attack * 0.05 * level),
          defense:
            pet.baseStats.defense +
            Math.floor(pet.baseStats.defense * 0.05 * level),
          speed:
            pet.baseStats.speed +
            Math.floor(pet.baseStats.speed * 0.05 * level),
        };

        userPets.push({
          userId: testUser._id.toString(),
          petId: pet.id,
          level: level,
          experience: level * 80,
          currentStats: stats,
          skillLevels: pet.skills.map((skill) => ({
            skillId: skill.id,
            level: 1,
          })),
          evolution: { stage: 0, materials: [] },
          bonusEffects: pet.bonuses.map((bonus) => ({
            type: bonus.type,
            target: bonus.target,
            value: bonus.value,
            isActive: true,
          })),
          battleStats: {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            lastUsed: new Date(),
          },
          metadata: {
            obtainedAt: new Date(),
            obtainedFrom: "gacha",
            isActive: false,
            isLocked: Math.random() > 0.8, // 20% chance to be locked
            isFavorite: Math.random() > 0.7, // 30% chance to be favorite
            nickname: null,
          },
        });
      }
    }

    // Insert user characters and pets
    await UserCharacter.insertMany(userCharacters);
    await UserPet.insertMany(userPets);

    console.log(
      `✅ User inventory seeded: ${userCharacters.length} characters, ${userPets.length} pets`
    );
  } catch (error) {
    console.error("❌ Error seeding user inventory:", error);
  }
};

export const seedUserItems = async () => {
  try {
    // Find test user
    const testUser = await User.findOne({ username: "testuser" });
    if (!testUser) {
      console.log("⚠️ Test user not found, skipping user items seeding");
      return;
    }

    // Check if user already has items
    const existingItems = await UserItem.countDocuments({
      userId: testUser._id.toString(),
    });
    if (existingItems > 0) {
      console.log("✅ User items already seeded");
      return;
    }

    // Get all item templates
    const items = await Item.find({});

    // Create user items with different quantities
    const userItems = [];
    for (const item of items) {
      let quantity;

      // Different quantities based on rarity
      switch (item.rarity) {
        case "SSR":
          quantity = Math.floor(Math.random() * 3) + 1; // 1-3
          break;
        case "SR":
          quantity = Math.floor(Math.random() * 10) + 5; // 5-14
          break;
        case "R":
          quantity = Math.floor(Math.random() * 50) + 20; // 20-69
          break;
        default:
          quantity = 1;
      }

      userItems.push({
        userId: testUser._id.toString(),
        itemId: item.id,
        quantity: quantity,
        metadata: {
          obtainedAt: new Date(),
          obtainedFrom: Math.random() > 0.5 ? "gacha" : "event",
          isLocked: Math.random() > 0.9, // 10% chance to be locked
          lastUsed: null,
        },
      });
    }

    // Insert user items
    await UserItem.insertMany(userItems);

    console.log(`✅ User items seeded: ${userItems.length} different items`);
  } catch (error) {
    console.error("❌ Error seeding user items:", error);
  }
};

export const seedDatabase = async () => {
  console.log("🌱 Starting database seeding...");
  await seedCharacters();
  await seedPets();
  await seedItems();
  await seedGachaPool();
  // ไม่ seed user data
  // await seedUserInventory();
  // await seedUserItems();
  console.log("🌱 Database seeding completed!");
};
