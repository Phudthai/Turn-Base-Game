import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { achievementAPI } from "../services/api";
import "./AchievementScreen.css";

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  requirements: {
    type: string;
    target: number;
  };
  rewards: {
    experience: number;
    coins: number;
    gems: number;
    items: Array<{ itemId: string; quantity: number }>;
  };
  artwork: {
    icon: string;
    badge: string;
  };
  isHidden: boolean;
  userProgress?: {
    currentProgress: number;
    targetProgress: number;
    isCompleted: boolean;
    completionPercentage: number;
  };
}

interface AchievementScreenProps {
  onBack: () => void;
}

export function AchievementScreen({ onBack }: AchievementScreenProps) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory, filter]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Load categories
      const categoriesResponse = await achievementAPI.getCategories(token);
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load user achievements
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (filter !== "all") {
        params.append("completed", filter === "completed" ? "true" : "false");
      }

      const achievementsResponse = await achievementAPI.getUserAchievements(
        token,
        params.toString()
      );

      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data);
      }
    } catch (error) {
      console.error("Error loading achievement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (achievementId: string) => {
    if (!token || claimingReward) return;

    try {
      setClaimingReward(achievementId);
      const response = await achievementAPI.claimReward(token, achievementId);

      if (response.success) {
        // Show success message
        alert(response.data.message);
        // Reload achievements to update status
        await loadData();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward");
    } finally {
      setClaimingReward(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "#cd7f32";
      case "silver":
        return "#c0c0c0";
      case "gold":
        return "#ffd700";
      case "platinum":
        return "#e5e4e2";
      case "diamond":
        return "#b9f2ff";
      default:
        return "#666";
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "🥉";
      case "silver":
        return "🥈";
      case "gold":
        return "🥇";
      case "platinum":
        return "💎";
      case "diamond":
        return "💠";
      default:
        return "🏆";
    }
  };

  if (loading) {
    return (
      <div className="achievement-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="achievement-screen">
      {/* Header */}
      <div className="achievement-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="header-title">
          <h1>🏆 Achievements</h1>
          <p>Track your progress and earn rewards</p>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="categories-filter">
        <button
          className={`category-button ${
            selectedCategory === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
            style={{ borderColor: category.color }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Completion Filter */}
      <div className="completion-filter">
        <button
          className={`filter-button ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-button ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`filter-button ${filter === "incomplete" ? "active" : ""}`}
          onClick={() => setFilter("incomplete")}
        >
          In Progress
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${
              achievement.userProgress?.isCompleted ? "completed" : ""
            }`}
          >
            {/* Achievement Header */}
            <div className="achievement-header-info">
              <div className="achievement-icon">
                {achievement.artwork.icon || getTierEmoji(achievement.tier)}
              </div>
              <div className="achievement-info">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">
                  {achievement.description}
                </p>
                <div className="achievement-tier">
                  <span
                    className="tier-badge"
                    style={{ color: getTierColor(achievement.tier) }}
                  >
                    {getTierEmoji(achievement.tier)}{" "}
                    {achievement.tier.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="achievement-progress">
              <div className="progress-info">
                <span>
                  Progress: {achievement.userProgress?.currentProgress || 0} /{" "}
                  {achievement.requirements.target}
                </span>
                <span>
                  {achievement.userProgress?.isCompleted
                    ? "100%"
                    : `${Math.round(
                        ((achievement.userProgress?.currentProgress || 0) /
                          achievement.requirements.target) *
                          100
                      )}%`}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      ((achievement.userProgress?.currentProgress || 0) /
                        achievement.requirements.target) *
                        100
                    )}%`,
                    backgroundColor: achievement.userProgress?.isCompleted
                      ? "#4CAF50"
                      : "#2196F3",
                  }}
                ></div>
              </div>
            </div>

            {/* Rewards */}
            <div className="achievement-rewards">
              <h4>Rewards:</h4>
              <div className="rewards-list">
                {achievement.rewards.experience > 0 && (
                  <span className="reward-item">
                    ⭐ {achievement.rewards.experience} EXP
                  </span>
                )}
                {achievement.rewards.coins > 0 && (
                  <span className="reward-item">
                    🪙 {achievement.rewards.coins} Coins
                  </span>
                )}
                {achievement.rewards.gems > 0 && (
                  <span className="reward-item">
                    💎 {achievement.rewards.gems} Gems
                  </span>
                )}
                {achievement.rewards.items.map((item, index) => (
                  <span key={index} className="reward-item">
                    📦 {item.quantity}x {item.itemId}
                  </span>
                ))}
              </div>
            </div>

            {/* Claim Button */}
            {achievement.userProgress?.isCompleted && (
              <button
                className="claim-button"
                onClick={() => handleClaimReward(achievement.id)}
                disabled={claimingReward === achievement.id}
              >
                {claimingReward === achievement.id
                  ? "Claiming..."
                  : "🎁 Claim Reward"}
              </button>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="no-achievements">
          <h3>No achievements found</h3>
          <p>
            Try changing your filters or start playing to earn achievements!
          </p>
        </div>
      )}
    </div>
  );
}
