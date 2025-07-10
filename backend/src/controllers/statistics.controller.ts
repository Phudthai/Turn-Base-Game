import { UserStatistics, BattleHistory } from "../models";
import { UserService } from "../services/user.service";

export const getUserStatistics = async ({ user }: { user: any }) => {
  try {
    const userId = user.id;

    // Get or create user statistics
    let userStats = await UserStatistics.findOne({ userId }).lean();

    if (!userStats) {
      // Create initial statistics if not exists
      userStats = await UserStatistics.create({ userId });
    }

    return {
      success: true,
      data: userStats,
    };
  } catch (error: any) {
    console.error("Error fetching user statistics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getBattleStatistics = async ({
  user,
  query,
}: {
  user: any;
  query: {
    period?: string; // "week" | "month" | "year" | "all"
    difficulty?: string;
    battleType?: string;
  };
}) => {
  try {
    const userId = user.id;
    const period = query.period || "all";

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "month":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "year":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          },
        };
        break;
    }

    // Build filter
    const filter: any = { userId, ...dateFilter };

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    if (query.battleType) {
      filter.battleType = query.battleType;
    }

    // Aggregate battle statistics
    const battleStats = await BattleHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBattles: { $sum: 1 },
          victories: {
            $sum: { $cond: [{ $eq: ["$result", "victory"] }, 1, 0] },
          },
          defeats: {
            $sum: { $cond: [{ $eq: ["$result", "defeat"] }, 1, 0] },
          },
          draws: {
            $sum: { $cond: [{ $eq: ["$result", "draw"] }, 1, 0] },
          },
          totalDuration: { $sum: "$duration" },
          totalTurns: { $sum: "$turnsPlayed" },
          totalDamageDealt: { $sum: "$combatStatistics.totalDamageDealt" },
          totalDamageTaken: { $sum: "$combatStatistics.totalDamageTaken" },
          totalCriticalHits: { $sum: "$combatStatistics.criticalHits" },
          totalSkillsUsed: { $sum: "$combatStatistics.skillsUsed" },
          perfectVictories: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$result", "victory"] },
                    { $eq: ["$survivalRate", 100] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalRewards: {
            experience: { $sum: "$rewards.experience" },
            coins: { $sum: "$rewards.coins" },
          },
        },
      },
    ]);

    const stats = battleStats[0] || {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      draws: 0,
      totalDuration: 0,
      totalTurns: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalCriticalHits: 0,
      totalSkillsUsed: 0,
      perfectVictories: 0,
      totalRewards: { experience: 0, coins: 0 },
    };

    // Calculate derived statistics
    const winRate =
      stats.totalBattles > 0
        ? Math.round((stats.victories / stats.totalBattles) * 100)
        : 0;

    const averageBattleTime =
      stats.totalBattles > 0
        ? Math.round(stats.totalDuration / stats.totalBattles)
        : 0;

    const averageTurnsPerBattle =
      stats.totalBattles > 0
        ? Math.round(stats.totalTurns / stats.totalBattles)
        : 0;

    const averageDamagePerBattle =
      stats.totalBattles > 0
        ? Math.round(stats.totalDamageDealt / stats.totalBattles)
        : 0;

    const damageEfficiency =
      stats.totalDamageTaken > 0
        ? Math.round((stats.totalDamageDealt / stats.totalDamageTaken) * 100) /
          100
        : 0;

    return {
      success: true,
      data: {
        period,
        filter: { difficulty: query.difficulty, battleType: query.battleType },
        overview: {
          totalBattles: stats.totalBattles,
          victories: stats.victories,
          defeats: stats.defeats,
          draws: stats.draws,
          winRate: `${winRate}%`,
          perfectVictories: stats.perfectVictories,
        },
        combat: {
          totalDamageDealt: stats.totalDamageDealt,
          totalDamageTaken: stats.totalDamageTaken,
          totalCriticalHits: stats.totalCriticalHits,
          totalSkillsUsed: stats.totalSkillsUsed,
          averageDamagePerBattle,
          damageEfficiency,
        },
        performance: {
          totalDuration: stats.totalDuration,
          averageBattleTime,
          totalTurns: stats.totalTurns,
          averageTurnsPerBattle,
        },
        rewards: stats.totalRewards,
      },
    };
  } catch (error: any) {
    console.error("Error fetching battle statistics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getBattleHistory = async ({
  user,
  query,
}: {
  user: any;
  query: {
    limit?: string;
    offset?: string;
    difficulty?: string;
    battleType?: string;
    result?: string;
  };
}) => {
  try {
    const userId = user.id;
    const limit = parseInt(query.limit || "20");
    const offset = parseInt(query.offset || "0");

    // Build filter
    const filter: any = { userId };

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    if (query.battleType) {
      filter.battleType = query.battleType;
    }

    if (query.result) {
      filter.result = query.result;
    }

    // Get battle history
    const [battles, totalCount] = await Promise.all([
      BattleHistory.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      BattleHistory.countDocuments(filter),
    ]);

    return {
      success: true,
      data: battles,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  } catch (error: any) {
    console.error("Error fetching battle history:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getPerformanceAnalytics = async ({
  user,
  query,
}: {
  user: any;
  query: {
    period?: string;
    groupBy?: string; // "day" | "week" | "month"
  };
}) => {
  try {
    const userId = user.id;
    const period = query.period || "month";
    const groupBy = query.groupBy || "day";

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "month":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "year":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          },
        };
        break;
    }

    // Determine grouping format
    let dateFormat: any;
    switch (groupBy) {
      case "day":
        dateFormat = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        };
        break;
      case "week":
        dateFormat = {
          $dateToString: {
            format: "%Y-W%U",
            date: "$createdAt",
          },
        };
        break;
      case "month":
        dateFormat = {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
          },
        };
        break;
    }

    // Aggregate performance data
    const analytics = await BattleHistory.aggregate([
      { $match: { userId, ...dateFilter } },
      {
        $group: {
          _id: dateFormat,
          battlesPlayed: { $sum: 1 },
          victories: {
            $sum: { $cond: [{ $eq: ["$result", "victory"] }, 1, 0] },
          },
          totalDamage: { $sum: "$combatStatistics.totalDamageDealt" },
          totalExperience: { $sum: "$rewards.experience" },
          totalCoins: { $sum: "$rewards.coins" },
          averageEfficiency: { $avg: "$efficiencyRating" },
          averageSurvival: { $avg: "$survivalRate" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate win rates
    const analyticsWithWinRate = analytics.map((entry) => ({
      ...entry,
      winRate:
        entry.battlesPlayed > 0
          ? Math.round((entry.victories / entry.battlesPlayed) * 100)
          : 0,
    }));

    return {
      success: true,
      data: {
        period,
        groupBy,
        analytics: analyticsWithWinRate,
      },
    };
  } catch (error: any) {
    console.error("Error fetching performance analytics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getLeaderboards = async ({
  query,
}: {
  query: {
    type?: string; // "wins" | "damage" | "efficiency" | "experience"
    period?: string; // "week" | "month" | "all"
    limit?: string;
  };
}) => {
  try {
    const type = query.type || "wins";
    const period = query.period || "all";
    const limit = parseInt(query.limit || "100");

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "month":
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        };
        break;
    }

    // Determine sorting field and aggregation
    let groupStage: any = {
      _id: "$userId",
      totalBattles: { $sum: 1 },
      victories: {
        $sum: { $cond: [{ $eq: ["$result", "victory"] }, 1, 0] },
      },
      totalDamage: { $sum: "$combatStatistics.totalDamageDealt" },
      totalExperience: { $sum: "$rewards.experience" },
      averageEfficiency: { $avg: "$efficiencyRating" },
    };

    let sortField: string;
    switch (type) {
      case "wins":
        sortField = "victories";
        break;
      case "damage":
        sortField = "totalDamage";
        break;
      case "efficiency":
        sortField = "averageEfficiency";
        break;
      case "experience":
        sortField = "totalExperience";
        break;
      default:
        sortField = "victories";
    }

    // Aggregate leaderboard data
    const leaderboard = await BattleHistory.aggregate([
      { $match: dateFilter },
      { $group: groupStage },
      { $sort: { [sortField]: -1 } },
      { $limit: limit },
    ]);

    // Get user details
    const userIds = leaderboard.map((entry) => entry._id);
    const users = await UserService.getUsersByIds(userIds);

    // Combine with user data
    const leaderboardWithUsers = leaderboard.map((entry, index) => {
      const user = users.find((u) => u.id === entry._id);
      const winRate =
        entry.totalBattles > 0
          ? Math.round((entry.victories / entry.totalBattles) * 100)
          : 0;

      return {
        rank: index + 1,
        userId: entry._id,
        username: user?.username || "Unknown",
        totalBattles: entry.totalBattles,
        victories: entry.victories,
        winRate: `${winRate}%`,
        totalDamage: entry.totalDamage,
        totalExperience: entry.totalExperience,
        averageEfficiency: Math.round(entry.averageEfficiency || 0),
      };
    });

    return {
      success: true,
      data: {
        type,
        period,
        leaderboard: leaderboardWithUsers,
      },
    };
  } catch (error: any) {
    console.error("Error fetching leaderboards:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to update user statistics
export const updateUserStatistics = async (userId: string, battleData: any) => {
  try {
    let userStats = await UserStatistics.findOne({ userId });

    if (!userStats) {
      userStats = new UserStatistics({ userId });
    }

    // Update battle statistics
    userStats.battleStats.totalBattles += 1;

    if (battleData.result === "victory") {
      userStats.battleStats.totalVictories += 1;
    } else if (battleData.result === "defeat") {
      userStats.battleStats.totalDefeats += 1;
    } else {
      userStats.battleStats.totalDraws += 1;
    }

    // Update performance metrics
    userStats.battleStats.totalDamageDealt +=
      battleData.combatStatistics.totalDamageDealt || 0;
    userStats.battleStats.totalDamageTaken +=
      battleData.combatStatistics.totalDamageTaken || 0;
    userStats.battleStats.totalCriticalHits +=
      battleData.combatStatistics.criticalHits || 0;
    userStats.battleStats.totalSkillsUsed +=
      battleData.combatStatistics.skillsUsed || 0;

    // Update difficulty stats
    const difficulty = battleData.difficulty;
    if (userStats.battleStats.difficultyStats[difficulty]) {
      userStats.battleStats.difficultyStats[difficulty].battles += 1;
      if (battleData.result === "victory") {
        userStats.battleStats.difficultyStats[difficulty].wins += 1;
      } else if (battleData.result === "defeat") {
        userStats.battleStats.difficultyStats[difficulty].losses += 1;
      }
    }

    // Update battle type stats
    const battleType = battleData.battleType;
    if (userStats.battleStats.battleTypeStats[battleType]) {
      userStats.battleStats.battleTypeStats[battleType].battles += 1;
      if (battleData.result === "victory") {
        userStats.battleStats.battleTypeStats[battleType].wins += 1;
      } else if (battleData.result === "defeat") {
        userStats.battleStats.battleTypeStats[battleType].losses += 1;
      }
    }

    // Update streaks
    if (battleData.result === "victory") {
      userStats.battleStats.currentWinStreak += 1;
      userStats.battleStats.currentLossStreak = 0;
      userStats.battleStats.longestWinStreak = Math.max(
        userStats.battleStats.longestWinStreak,
        userStats.battleStats.currentWinStreak
      );
    } else if (battleData.result === "defeat") {
      userStats.battleStats.currentLossStreak += 1;
      userStats.battleStats.currentWinStreak = 0;
      userStats.battleStats.longestLossStreak = Math.max(
        userStats.battleStats.longestLossStreak,
        userStats.battleStats.currentLossStreak
      );
    }

    // Update rewards
    if (battleData.rewards) {
      userStats.progressionStats.totalExperienceGained +=
        battleData.rewards.experience || 0;
      userStats.progressionStats.totalCoinsEarned +=
        battleData.rewards.coins || 0;
    }

    userStats.battleStats.lastBattleDate = new Date();
    userStats.lastUpdated = new Date();

    await userStats.save();
  } catch (error) {
    console.error("Error updating user statistics:", error);
  }
};
