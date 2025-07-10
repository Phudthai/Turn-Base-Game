import { Achievement, AchievementCategory } from "../models/achievement.model";

// Achievement Categories
export const achievementCategories = [
  {
    id: "battle",
    name: "Battle Master",
    description: "Achievements related to combat and battles",
    icon: "⚔️",
    color: "#e74c3c",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "collection",
    name: "Collector",
    description: "Achievements for collecting characters, items, and equipment",
    icon: "📦",
    color: "#3498db",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "progression",
    name: "Progression",
    description: "Achievements for leveling up and character development",
    icon: "📈",
    color: "#2ecc71",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "special",
    name: "Special",
    description: "Rare and unique achievements",
    icon: "🌟",
    color: "#f39c12",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "daily",
    name: "Daily Tasks",
    description: "Daily repeatable achievements",
    icon: "📅",
    color: "#9b59b6",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "weekly",
    name: "Weekly Challenges",
    description: "Weekly repeatable achievements",
    icon: "📊",
    color: "#1abc9c",
    sortOrder: 6,
    isActive: true,
  },
];

// Sample Achievements
export const sampleAchievements = [
  // Battle Achievements
  {
    id: "first_victory",
    name: "First Victory",
    description: "Win your first battle",
    category: "battle",
    tier: "bronze",
    requirements: {
      type: "battle_wins",
      target: 1,
    },
    rewards: {
      experience: 100,
      coins: 50,
      gems: 10,
      items: [{ itemId: "health_potion", quantity: 3 }],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "🏆",
      badge: "victory_bronze",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "easy",
      estimatedTime: "5 minutes",
      completionRate: 95,
    },
  },
  {
    id: "battle_veteran",
    name: "Battle Veteran",
    description: "Win 50 battles",
    category: "battle",
    tier: "silver",
    requirements: {
      type: "battle_wins",
      target: 50,
    },
    rewards: {
      experience: 500,
      coins: 250,
      gems: 50,
      items: [
        { itemId: "enhancement_stone", quantity: 5 },
        { itemId: "mana_potion", quantity: 10 },
      ],
      equipments: [{ equipmentId: "veteran_sword", quantity: 1 }],
      characters: [],
    },
    artwork: {
      icon: "🛡️",
      badge: "veteran_silver",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: ["first_victory"],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "medium",
      estimatedTime: "1 week",
      completionRate: 45,
    },
  },
  {
    id: "perfect_warrior",
    name: "Perfect Warrior",
    description: "Win 10 battles without losing any characters",
    category: "battle",
    tier: "gold",
    requirements: {
      type: "perfect_battles",
      target: 10,
    },
    rewards: {
      experience: 1000,
      coins: 500,
      gems: 100,
      items: [{ itemId: "perfect_crystal", quantity: 1 }],
      equipments: [],
      characters: [],
      title: "Perfect Warrior",
      badge: "perfect_gold",
    },
    artwork: {
      icon: "💎",
      badge: "perfect_gold",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: ["battle_veteran"],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "hard",
      estimatedTime: "2 weeks",
      completionRate: 15,
    },
  },

  // Collection Achievements
  {
    id: "first_character",
    name: "First Companion",
    description: "Obtain your first character",
    category: "collection",
    tier: "bronze",
    requirements: {
      type: "character_collection",
      target: 1,
    },
    rewards: {
      experience: 50,
      coins: 25,
      gems: 5,
      items: [{ itemId: "character_upgrade_token", quantity: 1 }],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "👥",
      badge: "collector_bronze",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "easy",
      estimatedTime: "1 minute",
      completionRate: 99,
    },
  },
  {
    id: "rare_collector",
    name: "Rare Collector",
    description: "Collect 10 SR or higher rarity characters",
    category: "collection",
    tier: "gold",
    requirements: {
      type: "character_collection",
      target: 10,
      parameters: {
        characterType: ["SR", "SSR"],
      },
    },
    rewards: {
      experience: 750,
      coins: 400,
      gems: 75,
      items: [
        { itemId: "rare_summon_ticket", quantity: 3 },
        { itemId: "evolution_material", quantity: 5 },
      ],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "🌟",
      badge: "rare_gold",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: ["first_character"],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "hard",
      estimatedTime: "2 months",
      completionRate: 25,
    },
  },

  // Progression Achievements
  {
    id: "level_up",
    name: "Growing Stronger",
    description: "Reach user level 10",
    category: "progression",
    tier: "bronze",
    requirements: {
      type: "level_reached",
      target: 10,
    },
    rewards: {
      experience: 200,
      coins: 100,
      gems: 20,
      items: [{ itemId: "experience_boost", quantity: 1 }],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "📊",
      badge: "level_bronze",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "easy",
      estimatedTime: "1 day",
      completionRate: 80,
    },
  },
  {
    id: "master_level",
    name: "Master Trainer",
    description: "Reach user level 50",
    category: "progression",
    tier: "platinum",
    requirements: {
      type: "level_reached",
      target: 50,
    },
    rewards: {
      experience: 2000,
      coins: 1000,
      gems: 200,
      items: [
        { itemId: "master_token", quantity: 1 },
        { itemId: "legendary_summon_ticket", quantity: 1 },
      ],
      equipments: [{ equipmentId: "master_ring", quantity: 1 }],
      characters: [],
      title: "Master Trainer",
    },
    artwork: {
      icon: "👑",
      badge: "master_platinum",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: ["level_up"],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "extreme",
      estimatedTime: "6 months",
      completionRate: 5,
    },
  },

  // Special Achievements
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Win a battle in under 30 seconds",
    category: "special",
    tier: "gold",
    requirements: {
      type: "speed_clear",
      target: 1,
      parameters: {
        timeLimit: 30,
      },
    },
    rewards: {
      experience: 800,
      coins: 400,
      gems: 80,
      items: [{ itemId: "speed_boots", quantity: 1 }],
      equipments: [],
      characters: [],
      title: "Speed Demon",
    },
    artwork: {
      icon: "⚡",
      badge: "speed_gold",
    },
    isHidden: true,
    isRepeatable: false,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "hard",
      estimatedTime: "varies",
      completionRate: 8,
    },
  },
  {
    id: "critical_master",
    name: "Critical Master",
    description: "Land 100 critical hits in battles",
    category: "special",
    tier: "silver",
    requirements: {
      type: "critical_hits",
      target: 100,
    },
    rewards: {
      experience: 600,
      coins: 300,
      gems: 60,
      items: [{ itemId: "critical_gem", quantity: 3 }],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "🎯",
      badge: "critical_silver",
    },
    isHidden: false,
    isRepeatable: false,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "medium",
      estimatedTime: "2 weeks",
      completionRate: 35,
    },
  },

  // Daily Achievements
  {
    id: "daily_warrior",
    name: "Daily Warrior",
    description: "Win 3 battles in a single day",
    category: "daily",
    tier: "bronze",
    requirements: {
      type: "battle_wins",
      target: 3,
      parameters: {
        timeLimit: 86400, // 24 hours in seconds
      },
    },
    rewards: {
      experience: 100,
      coins: 50,
      gems: 10,
      items: [{ itemId: "daily_bonus_chest", quantity: 1 }],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "🌅",
      badge: "daily_bronze",
    },
    isHidden: false,
    isRepeatable: true,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "easy",
      estimatedTime: "1 day",
      completionRate: 60,
    },
  },

  // Weekly Achievements
  {
    id: "weekly_champion",
    name: "Weekly Champion",
    description: "Win 25 battles in a single week",
    category: "weekly",
    tier: "silver",
    requirements: {
      type: "battle_wins",
      target: 25,
      parameters: {
        timeLimit: 604800, // 7 days in seconds
      },
    },
    rewards: {
      experience: 500,
      coins: 250,
      gems: 50,
      items: [
        { itemId: "weekly_bonus_chest", quantity: 1 },
        { itemId: "enhancement_stone", quantity: 3 },
      ],
      equipments: [],
      characters: [],
    },
    artwork: {
      icon: "🏅",
      badge: "weekly_silver",
    },
    isHidden: false,
    isRepeatable: true,
    prerequisiteAchievements: [],
    metadata: {
      addedInVersion: "1.0.0",
      difficulty: "medium",
      estimatedTime: "1 week",
      completionRate: 25,
    },
  },
];

// Function to seed achievements
export async function seedAchievements() {
  try {
    console.log("🌱 Seeding achievement categories...");

    // Clear existing data
    await AchievementCategory.deleteMany({});
    await Achievement.deleteMany({});

    // Insert categories
    await AchievementCategory.insertMany(achievementCategories);
    console.log(
      `✅ Inserted ${achievementCategories.length} achievement categories`
    );

    // Insert achievements
    await Achievement.insertMany(sampleAchievements);
    console.log(`✅ Inserted ${sampleAchievements.length} achievements`);

    console.log("🎉 Achievement seeding completed successfully!");

    return {
      success: true,
      categories: achievementCategories.length,
      achievements: sampleAchievements.length,
    };
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    throw error;
  }
}
