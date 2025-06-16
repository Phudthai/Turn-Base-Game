import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/screens/LoginScreen";
import {
  DashboardScreen,
  type GameState,
} from "./components/screens/DashboardScreen";
import { GachaScreen } from "./components/screens/GachaScreen";
import { BattleScreen } from "./components/screens/BattleScreen";
import { InventoryScreen } from "./components/screens/InventoryScreen";

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
  const [gameState, setGameState] = useState<GameState>("dashboard");
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
      case "dashboard":
        return <DashboardScreen onNavigate={setGameState} />;
      case "gacha":
        return <GachaScreen onBack={() => setGameState("dashboard")} />;
      case "battle":
        return <BattleScreen onBack={() => setGameState("dashboard")} />;
      case "inventory":
        return <InventoryScreen onBack={() => setGameState("dashboard")} />;
      default:
        return <DashboardScreen onNavigate={setGameState} />;
    }
  };

  return (
    <div className="app">
      {error && <ErrorBanner error={error} onClear={clearError} />}

      <header className="app-header">
        <h1>🎮 Idle: Picoen</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <div className="currency-display">
              <span className="gems">💎 {user.currency?.gems || 0}</span>
              <span className="coins">🪙 {user.currency?.coins || 0}</span>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="app-main">{renderScreen()}</main>
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
