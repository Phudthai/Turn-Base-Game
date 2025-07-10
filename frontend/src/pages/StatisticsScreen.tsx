import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { statisticsAPI } from "../services/api";
import "./StatisticsScreen.css";

interface BattleStatistics {
  period: string;
  overview: {
    totalBattles: number;
    victories: number;
    defeats: number;
    draws: number;
    winRate: string;
    perfectVictories: number;
  };
  combat: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalCriticalHits: number;
    totalSkillsUsed: number;
    averageDamagePerBattle: number;
    damageEfficiency: number;
  };
  performance: {
    totalDuration: number;
    averageBattleTime: number;
    totalTurns: number;
    averageTurnsPerBattle: number;
  };
  rewards: {
    experience: number;
    coins: number;
  };
}

interface BattleHistory {
  _id: string;
  battleType: string;
  difficulty: string;
  result: "victory" | "defeat" | "draw";
  duration: number;
  turnsPlayed: number;
  combatStatistics: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    criticalHits: number;
  };
  rewards: {
    experience: number;
    coins: number;
  };
  createdAt: string;
}

interface StatisticsScreenProps {
  onBack: () => void;
}

export function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "analytics"
  >("overview");
  const [battleStats, setBattleStats] = useState<BattleStatistics | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleHistory[]>([]);
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">(
    "month"
  );
  const [difficulty, setDifficulty] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, period, difficulty]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      if (activeTab === "overview") {
        await loadBattleStatistics();
      } else if (activeTab === "history") {
        await loadBattleHistory();
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBattleStatistics = async () => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (difficulty !== "all") {
      params.append("difficulty", difficulty);
    }

    const response = await statisticsAPI.getBattleStatistics(
      token!,
      params.toString()
    );
    if (response.success) {
      setBattleStats(response.data);
    }
  };

  const loadBattleHistory = async () => {
    const params = new URLSearchParams();
    params.append("limit", "20");
    if (difficulty !== "all") {
      params.append("difficulty", difficulty);
    }

    const response = await statisticsAPI.getBattleHistory(
      token!,
      params.toString()
    );
    if (response.success) {
      setBattleHistory(response.data);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultColor = (result: string): string => {
    switch (result) {
      case "victory":
        return "#4CAF50";
      case "defeat":
        return "#f44336";
      case "draw":
        return "#ff9800";
      default:
        return "#666";
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "#4CAF50";
      case "normal":
        return "#2196F3";
      case "hard":
        return "#ff9800";
      case "nightmare":
        return "#f44336";
      default:
        return "#666";
    }
  };

  if (loading) {
    return (
      <div className="statistics-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-screen">
      {/* Header */}
      <div className="statistics-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="header-title">
          <h1>📊 Statistics</h1>
          <p>Track your battle performance and progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="period-filter">
          <label>Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="difficulty-filter">
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="nightmare">Nightmare</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="statistics-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 Battle History
        </button>
        <button
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && battleStats && (
          <div className="overview-tab">
            {/* Overview Stats */}
            <div className="stats-grid">
              <div className="stat-card battles">
                <h3>Battles</h3>
                <div className="stat-number">
                  {battleStats.overview.totalBattles}
                </div>
                <div className="stat-breakdown">
                  <span style={{ color: "#4CAF50" }}>
                    Victories: {battleStats.overview.victories}
                  </span>
                  <span style={{ color: "#f44336" }}>
                    Defeats: {battleStats.overview.defeats}
                  </span>
                  <span style={{ color: "#ff9800" }}>
                    Draws: {battleStats.overview.draws}
                  </span>
                </div>
              </div>

              <div className="stat-card win-rate">
                <h3>Win Rate</h3>
                <div className="stat-number">
                  {battleStats.overview.winRate}
                </div>
                <div className="stat-description">
                  Perfect Victories: {battleStats.overview.perfectVictories}
                </div>
              </div>

              <div className="stat-card damage">
                <h3>Total Damage</h3>
                <div className="stat-number">
                  {battleStats.combat.totalDamageDealt.toLocaleString()}
                </div>
                <div className="stat-description">
                  Avg:{" "}
                  {battleStats.combat.averageDamagePerBattle.toLocaleString()}
                  /battle
                </div>
              </div>

              <div className="stat-card efficiency">
                <h3>Damage Efficiency</h3>
                <div className="stat-number">
                  {battleStats.combat.damageEfficiency.toFixed(2)}
                </div>
                <div className="stat-description">
                  Damage Dealt / Damage Taken
                </div>
              </div>

              <div className="stat-card time">
                <h3>Battle Time</h3>
                <div className="stat-number">
                  {formatDuration(battleStats.performance.averageBattleTime)}
                </div>
                <div className="stat-description">
                  Total: {formatDuration(battleStats.performance.totalDuration)}
                </div>
              </div>

              <div className="stat-card rewards">
                <h3>Rewards Earned</h3>
                <div className="stat-breakdown">
                  <span>
                    ⭐ {battleStats.rewards.experience.toLocaleString()} EXP
                  </span>
                  <span>
                    🪙 {battleStats.rewards.coins.toLocaleString()} Coins
                  </span>
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="combat-stats">
              <h3>Combat Details</h3>
              <div className="combat-grid">
                <div className="combat-item">
                  <span>Critical Hits:</span>
                  <span>
                    {battleStats.combat.totalCriticalHits.toLocaleString()}
                  </span>
                </div>
                <div className="combat-item">
                  <span>Skills Used:</span>
                  <span>
                    {battleStats.combat.totalSkillsUsed.toLocaleString()}
                  </span>
                </div>
                <div className="combat-item">
                  <span>Total Turns:</span>
                  <span>
                    {battleStats.performance.totalTurns.toLocaleString()}
                  </span>
                </div>
                <div className="combat-item">
                  <span>Avg Turns/Battle:</span>
                  <span>{battleStats.performance.averageTurnsPerBattle}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-tab">
            <div className="history-list">
              {battleHistory.map((battle) => (
                <div key={battle._id} className="history-item">
                  <div className="battle-info">
                    <div className="battle-header">
                      <span
                        className="result-badge"
                        style={{
                          backgroundColor: getResultColor(battle.result),
                        }}
                      >
                        {battle.result.toUpperCase()}
                      </span>
                      <span
                        className="difficulty-badge"
                        style={{ color: getDifficultyColor(battle.difficulty) }}
                      >
                        {battle.difficulty.toUpperCase()}
                      </span>
                      <span className="battle-type">
                        {battle.battleType.toUpperCase()}
                      </span>
                    </div>
                    <div className="battle-stats">
                      <span>Duration: {formatDuration(battle.duration)}</span>
                      <span>Turns: {battle.turnsPlayed}</span>
                      <span>
                        Damage:{" "}
                        {battle.combatStatistics.totalDamageDealt.toLocaleString()}
                      </span>
                      <span>Crits: {battle.combatStatistics.criticalHits}</span>
                    </div>
                    <div className="battle-rewards">
                      <span>⭐ {battle.rewards.experience} EXP</span>
                      <span>🪙 {battle.rewards.coins} Coins</span>
                    </div>
                  </div>
                  <div className="battle-date">
                    {formatDate(battle.createdAt)}
                  </div>
                </div>
              ))}
            </div>

            {battleHistory.length === 0 && (
              <div className="no-history">
                <h3>No battle history found</h3>
                <p>Start battling to see your history here!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-tab">
            <div className="coming-soon">
              <h3>📈 Advanced Analytics</h3>
              <p>Coming soon! This will include:</p>
              <ul>
                <li>Performance charts over time</li>
                <li>Win rate by difficulty</li>
                <li>Damage trends</li>
                <li>Character performance analysis</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
