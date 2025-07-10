import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./pages/LoginScreen";
import { DashboardScreen, type GameState } from "./pages/DashboardScreen";
import { GachaScreen } from "./pages/GachaScreen";
import { BattleScreen } from "./pages/BattleScreen";
import { InventoryScreen } from "./pages/InventoryScreen";
import { GameLobby } from "./pages/GameLobby";
import { SettingsScreen } from "./pages/SettingsScreen";
import { AchievementScreen } from "./pages/AchievementScreen";
import { StatisticsScreen } from "./pages/StatisticsScreen";

// Loading component
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// Error component
function ErrorBanner({
  error,
  onClear,
}: {
  error: string;
  onClear: () => void;
}) {
  return (
    <div className="error-banner">
      <span>{error}</span>
      <button onClick={onClear} className="error-close">
        ×
      </button>
    </div>
  );
}

// Main app component
function AppContent() {
  const [gameState, setGameState] = useState<GameState>("lobby");
  const { user, isLoading, error, clearError, logout } = useAuth();

  console.log(
    "🎮 App render - isLoading:",
    isLoading,
    "user:",
    !!user,
    "gameState:",
    gameState
  );

  // Show loading screen while initializing
  if (isLoading) {
    console.log("🎮 Showing loading screen");
    return <LoadingScreen />;
  }

  // Render game screens based on current state
  const renderScreen = () => {
    // Show login screen if user is not authenticated
    if (!user) {
      return <LoginScreen />;
    }

    switch (gameState) {
      case "lobby":
        return <GameLobby onNavigate={setGameState} />;
      case "dashboard":
        return <DashboardScreen onNavigate={setGameState} />;
      case "gacha":
        return <GachaScreen onBack={() => setGameState("lobby")} />;
      case "battle":
        return <BattleScreen onBack={() => setGameState("lobby")} />;
      case "inventory":
        return <InventoryScreen onBack={() => setGameState("lobby")} />;
      case "settings":
        return <SettingsScreen onBack={() => setGameState("lobby")} />;
      case "achievements":
        return <AchievementScreen onBack={() => setGameState("lobby")} />;
      case "statistics":
        return <StatisticsScreen onBack={() => setGameState("lobby")} />;
      case "shop":
        return <DashboardScreen onNavigate={setGameState} />;
      case "guild":
        return <DashboardScreen onNavigate={setGameState} />;
      case "dungeon":
        return <DashboardScreen onNavigate={setGameState} />;
      case "pvp":
        return <DashboardScreen onNavigate={setGameState} />;
      case "events":
        return <DashboardScreen onNavigate={setGameState} />;
      default:
        return <GameLobby onNavigate={setGameState} />;
    }
  };

  return (
    <div className="app">
      {error && <ErrorBanner error={error} onClear={clearError} />}

      <main className="app-main full-screen">{renderScreen()}</main>
    </div>
  );
}

// Root app with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Initialize React app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
