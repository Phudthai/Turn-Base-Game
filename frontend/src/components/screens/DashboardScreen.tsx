import React from "react";
import { useAuth } from "../../context/AuthContext";

export type GameState = "dashboard" | "gacha" | "battle" | "inventory";

interface DashboardScreenProps {
  onNavigate: (state: GameState) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-screen">
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => onNavigate("gacha")}>
          <h3>🎰 Gacha</h3>
          <p>Pull for new characters and items!</p>
        </div>
        <div className="dashboard-card" onClick={() => onNavigate("battle")}>
          <h3>⚔️ Battle</h3>
          <p>Fight enemies and gain experience!</p>
        </div>
        <div className="dashboard-card" onClick={() => onNavigate("inventory")}>
          <h3>🎒 Inventory</h3>
          <p>Manage your items and characters!</p>
        </div>
      </div>
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
