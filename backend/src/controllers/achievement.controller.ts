import { Achievement, UserAchievement, AchievementCategory } from "../models";
import { UserService } from "../services/user.service";
import { ItemService } from "../services/item.service";

export const getAchievementCategories = async () => {
  try {
    const categories = await AchievementCategory.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    return {
      success: true,
      data: categories,
    };
  } catch (error: any) {
    console.error("Error fetching achievement categories:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAllAchievements = async ({
  query,
}: {
  query: {
    category?: string;
    tier?: string;
    includeHidden?: string;
  };
}) => {
  try {
    const filter: any = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.tier) {
      filter.tier = query.tier;
    }

    if (query.includeHidden !== "true") {
      filter.isHidden = false;
    }

    const achievements = await Achievement.find(filter)
      .sort({ category: 1, tier: 1, name: 1 })
      .lean();

    return {
      success: true,
      data: achievements,
      count: achievements.length,
    };
  } catch (error: any) {
    console.error("Error fetching achievements:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getUserAchievements = async ({
  user,
  query,
}: {
  user: any;
  query: {
    category?: string;
    completed?: string;
    limit?: string;
    offset?: string;
  };
}) => {
  try {
    const userId = user.id;
    const limit = parseInt(query.limit || "50");
    const offset = parseInt(query.offset || "0");

    // Build filter
    const achievementFilter: any = {};
    if (query.category) {
      achievementFilter.category = query.category;
    }

    // Get all achievements with filter
    const allAchievements = await Achievement.find(achievementFilter).lean();
    const achievementIds = allAchievements.map((a) => a.id);

    // Build user achievement filter
    const userFilter: any = { userId };
    if (achievementIds.length > 0) {
      userFilter.achievementId = { $in: achievementIds };
    }

    if (query.completed === "true") {
      userFilter.isCompleted = true;
    } else if (query.completed === "false") {
      userFilter.isCompleted = false;
    }

    // Get user achievements
    const userAchievements = await UserAchievement.find(userFilter)
      .sort({ lastProgressAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Combine with achievement data
    const achievementsWithProgress = [];

    for (const achievement of allAchievements) {
      const userProgress = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      achievementsWithProgress.push({
        ...achievement,
        userProgress: userProgress || {
          currentProgress: 0,
          targetProgress: achievement.requirements.target,
          isCompleted: false,
          completionPercentage: 0,
        },
      });
    }

    // Apply pagination
    const paginatedResults = achievementsWithProgress.slice(
      offset,
      offset + limit
    );

    return {
      success: true,
      data: paginatedResults,
      pagination: {
        total: achievementsWithProgress.length,
        limit,
        offset,
        hasMore: offset + limit < achievementsWithProgress.length,
      },
    };
  } catch (error: any) {
    console.error("Error fetching user achievements:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAchievementProgress = async ({
  user,
  params,
}: {
  user: any;
  params: { achievementId: string };
}) => {
  try {
    const userId = user.id;
    const { achievementId } = params;

    // Get achievement details
    const achievement = await Achievement.findOne({ id: achievementId }).lean();
    if (!achievement) {
      return {
        success: false,
        error: "Achievement not found",
      };
    }

    // Get user progress
    const userProgress = await UserAchievement.findOne({
      userId,
      achievementId,
    }).lean();

    return {
      success: true,
      data: {
        achievement,
        progress: userProgress || {
          currentProgress: 0,
          targetProgress: achievement.requirements.target,
          isCompleted: false,
          completionPercentage: 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching achievement progress:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const claimAchievementReward = async ({
  user,
  params,
}: {
  user: any;
  params: { achievementId: string };
}) => {
  try {
    const userId = user.id;
    const { achievementId } = params;

    // Get achievement and user progress
    const [achievement, userProgress] = await Promise.all([
      Achievement.findOne({ id: achievementId }).lean(),
      UserAchievement.findOne({ userId, achievementId }),
    ]);

    if (!achievement) {
      return {
        success: false,
        error: "Achievement not found",
      };
    }

    if (!userProgress || !userProgress.isCompleted) {
      return {
        success: false,
        error: "Achievement not completed yet",
      };
    }

    // Check if already claimed for non-repeatable achievements
    if (
      !achievement.isRepeatable &&
      userProgress.completionHistory.length > 0
    ) {
      return {
        success: false,
        error: "Rewards already claimed for this achievement",
      };
    }

    // Distribute rewards
    const rewards = achievement.rewards;

    // Add experience and currency
    if (rewards.experience > 0) {
      await UserService.addExperience(userId, rewards.experience);
    }

    if (rewards.coins > 0) {
      await UserService.addCurrency(userId, "coins", rewards.coins);
    }

    if (rewards.gems > 0) {
      await UserService.addCurrency(userId, "gems", rewards.gems);
    }

    // Add items
    for (const item of rewards.items) {
      await ItemService.addItemToUser(userId, item.itemId, item.quantity);
    }

    // Add equipments
    for (const equipment of rewards.equipments) {
      await ItemService.addItemToUser(
        userId,
        equipment.equipmentId,
        equipment.quantity
      );
    }

    // Update completion history
    const completionRecord = {
      completedAt: new Date(),
      progressAtCompletion: userProgress.currentProgress,
      rewardsReceived: {
        experience: rewards.experience,
        coins: rewards.coins,
        gems: rewards.gems,
        items: rewards.items,
        equipments: rewards.equipments,
      },
    };

    userProgress.completionHistory.push(completionRecord);

    // Reset progress if repeatable
    if (achievement.isRepeatable) {
      userProgress.currentProgress = 0;
      userProgress.isCompleted = false;
    }

    await userProgress.save();

    return {
      success: true,
      data: {
        rewards: completionRecord.rewardsReceived,
        message: `🎉 Achievement "${achievement.name}" completed! Rewards claimed successfully!`,
      },
    };
  } catch (error: any) {
    console.error("Error claiming achievement reward:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAchievementLeaderboard = async ({
  query,
}: {
  query: {
    type?: string;
    limit?: string;
  };
}) => {
  try {
    const limit = parseInt(query.limit || "100");
    const type = query.type || "total"; // total, bronze, silver, gold, platinum, diamond

    let pipeline: any[] = [
      {
        $group: {
          _id: "$userId",
          totalCompleted: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          bronzeCount: {
            $sum: {
              $cond: [
                { $and: ["$isCompleted", { $eq: ["$tier", "bronze"] }] },
                1,
                0,
              ],
            },
          },
          silverCount: {
            $sum: {
              $cond: [
                { $and: ["$isCompleted", { $eq: ["$tier", "silver"] }] },
                1,
                0,
              ],
            },
          },
          goldCount: {
            $sum: {
              $cond: [
                { $and: ["$isCompleted", { $eq: ["$tier", "gold"] }] },
                1,
                0,
              ],
            },
          },
          platinumCount: {
            $sum: {
              $cond: [
                { $and: ["$isCompleted", { $eq: ["$tier", "platinum"] }] },
                1,
                0,
              ],
            },
          },
          diamondCount: {
            $sum: {
              $cond: [
                { $and: ["$isCompleted", { $eq: ["$tier", "diamond"] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    // Sort based on type
    let sortField = "totalCompleted";
    if (type !== "total") {
      sortField = `${type}Count`;
    }

    pipeline.push({ $sort: { [sortField]: -1 } }, { $limit: limit });

    const leaderboard = await UserAchievement.aggregate(pipeline);

    // Get user details
    const userIds = leaderboard.map((entry) => entry._id);
    const users = await UserService.getUsersByIds(userIds);

    const leaderboardWithUsers = leaderboard.map((entry, index) => {
      const user = users.find((u) => u.id === entry._id);
      return {
        rank: index + 1,
        userId: entry._id,
        username: user?.username || "Unknown",
        totalCompleted: entry.totalCompleted,
        achievements: {
          bronze: entry.bronzeCount,
          silver: entry.silverCount,
          gold: entry.goldCount,
          platinum: entry.platinumCount,
          diamond: entry.diamondCount,
        },
      };
    });

    return {
      success: true,
      data: leaderboardWithUsers,
      type,
    };
  } catch (error: any) {
    console.error("Error fetching achievement leaderboard:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to update achievement progress
export const updateAchievementProgress = async (
  userId: string,
  achievementType: string,
  value: number = 1,
  additionalData?: any
) => {
  try {
    // Find relevant achievements
    const achievements = await Achievement.find({
      "requirements.type": achievementType,
    }).lean();

    for (const achievement of achievements) {
      // Check if user meets prerequisites
      if (achievement.prerequisiteAchievements.length > 0) {
        const completedPrereqs = await UserAchievement.countDocuments({
          userId,
          achievementId: { $in: achievement.prerequisiteAchievements },
          isCompleted: true,
        });

        if (completedPrereqs < achievement.prerequisiteAchievements.length) {
          continue; // Skip if prerequisites not met
        }
      }

      // Get or create user achievement
      let userAchievement = await UserAchievement.findOne({
        userId,
        achievementId: achievement.id,
      });

      if (!userAchievement) {
        userAchievement = new UserAchievement({
          userId,
          achievementId: achievement.id,
          currentProgress: 0,
          targetProgress: achievement.requirements.target,
          isCompleted: false,
        });
      }

      // Skip if already completed and not repeatable
      if (userAchievement.isCompleted && !achievement.isRepeatable) {
        continue;
      }

      // Reset if repeatable and checking for daily/weekly resets
      if (achievement.isRepeatable && userAchievement.isCompleted) {
        const timeLimit = achievement.requirements.parameters?.timeLimit;
        if (timeLimit) {
          const timeSinceCompletion =
            Date.now() - userAchievement.completedAt!.getTime();
          if (timeSinceCompletion >= timeLimit * 1000) {
            userAchievement.currentProgress = 0;
            userAchievement.isCompleted = false;
            userAchievement.completedAt = undefined;
          }
        }
      }

      // Update progress
      userAchievement.currentProgress += value;
      userAchievement.lastProgressAt = new Date();

      // Check if completed
      if (userAchievement.currentProgress >= userAchievement.targetProgress) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
      }

      await userAchievement.save();
    }
  } catch (error) {
    console.error("Error updating achievement progress:", error);
  }
};
