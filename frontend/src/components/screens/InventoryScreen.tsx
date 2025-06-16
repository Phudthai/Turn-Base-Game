import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGameAPI } from "../../hooks/useGameAPI";
import type { InventoryResponse } from "../../types/types";

interface InventoryScreenProps {
  onBack: () => void;
}

type TabType = "all" | "characters" | "pets" | "items";

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { user } = useAuth();
  const { getInventory, isLoading, error, clearError } = useGameAPI();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    clearError();
    const inventoryData = await getInventory();
    if (inventoryData) {
      setInventory(inventoryData);
    }
  };

  if (isLoading) {
    return (
      <div className="inventory-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>🎒 Inventory</h2>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>🎒 Inventory</h2>
        <div className="error-message">{error}</div>
        <button onClick={fetchInventoryData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!inventory || !user) {
    return (
      <div className="inventory-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>🎒 Inventory</h2>
        <div className="error-message">No inventory data found.</div>
      </div>
    );
  }

  const getItemsForTab = () => {
    switch (activeTab) {
      case "characters":
        return inventory.characters;
      case "pets":
        return inventory.pets;
      case "items":
        return inventory.items;
      default:
        return [...inventory.characters, ...inventory.pets, ...inventory.items];
    }
  };

  const getItemTypeIcon = (type: TabType) => {
    switch (type) {
      case "characters":
        return "👤";
      case "pets":
        return "🐾";
      case "items":
        return "⚔️";
      default:
        return "📦";
    }
  };

  return (
    <div className="inventory-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="inventory-header">
        <h2>🎒 Inventory</h2>
        <div className="user-info">
          <div className="user-stats">
            <span className="username">{user.username}</span>
            <span className="level">Lv. {user.level || 1}</span>
          </div>
          <div className="currency">
            <span className="gems">💎 {user.currency?.gems || 0}</span>
            <span className="coins">🪙 {user.currency?.coins || 0}</span>
          </div>
        </div>
      </div>

      <div className="inventory-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          📦 All ({inventory.total || 0})
        </button>
        <button
          className={`tab ${activeTab === "characters" ? "active" : ""}`}
          onClick={() => setActiveTab("characters")}
        >
          👤 Characters ({inventory.characters?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === "pets" ? "active" : ""}`}
          onClick={() => setActiveTab("pets")}
        >
          🐾 Pets ({inventory.pets?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          ⚔️ Items ({inventory.items?.length || 0})
        </button>
      </div>

      <div className="inventory-content">
        {getItemsForTab().length === 0 ? (
          <div className="empty-inventory">
            <p>
              {getItemTypeIcon(activeTab)} No{" "}
              {activeTab === "all" ? "items" : activeTab} found.
            </p>
            <p>Visit the Gacha to get some items!</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {getItemsForTab().map((item, index) => (
              <InventoryItemCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryItemCard({ item }: { item: { id: string; count: number } }) {
  return (
    <div className="inventory-item-card">
      <div className="item-header">
        <h4 className="item-id">{item.id}</h4>
        <span className="item-count">x{item.count}</span>
      </div>
      <div className="item-details">
        <p className="item-description">
          {item.id.includes("char") && "🧙‍♂️ Character"}
          {item.id.includes("pet") && "🐾 Pet"}
          {item.id.includes("item") && "⚔️ Item"}
        </p>
      </div>
    </div>
  );
}
