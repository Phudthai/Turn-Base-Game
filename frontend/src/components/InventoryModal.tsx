import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface ItemDetail {
  id: string;
  itemId: string;
  name: string;
  description: string;
  rarity: string;
  type: string;
  subType: string;
  quantity: number;
  stackLimit: number;
  sellPrice: number;
  tradeable: boolean;
  effects: Array<{
    type: string;
    value: number;
    target?: string;
    duration?: number;
  }>;
  artwork: {
    icon: string;
    thumbnail: string;
    fullImage: string;
  };
  metadata: {
    obtainedAt: string;
    obtainedFrom: string;
    isLocked: boolean;
  };
}

interface CharacterDetail {
  id: string;
  characterId: string;
  name: string;
  description: string;
  rarity: string;
  level: number;
  experience: number;
  currentStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  powerLevel: number;
  evolution: any;
  equipments: any[];
  battleStats: any;
  skills: any[];
  artwork: {
    icon: string;
    thumbnail: string;
    fullImage: string;
  };
  metadata: {
    obtainedAt: string;
    isFavorite: boolean;
    isLocked: boolean;
  };
  template: any;
}

interface PetDetail {
  id: string;
  petId: string;
  name: string;
  description: string;
  rarity: string;
  level: number;
  experience: number;
  currentStats: any;
  skillLevels: any;
  evolution: any;
  bonusEffects: any;
  battleStats: any;
  skills: any[];
  artwork: {
    icon: string;
    thumbnail: string;
    fullImage: string;
  };
  metadata: {
    obtainedAt: string;
    isActive: boolean;
    isFavorite: boolean;
    isLocked: boolean;
  };
  template: any;
}

interface EquipmentDetail {
  id: string;
  equipmentId: string;
  name: string;
  description: string;
  rarity: string;
  type: string;
  subType: string;
  enhancementLevel: number;
  isLocked: boolean;
  equippedTo: string | null;
  equippedSlot: string | null;
  baseStats: any;
  allowedClasses: string[];
  artwork: {
    icon: string;
    thumbnail: string;
    fullImage: string;
  };
  metadata: {
    obtainedAt: string;
    obtainedFrom: string;
    isLocked: boolean;
  };
  template: any;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType: "character" | "pet" | "equipment" | "item" | null;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemType,
}) => {
  const { user, token } = useAuth();
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);
  const [characterDetail, setCharacterDetail] =
    useState<CharacterDetail | null>(null);
  const [petDetail, setPetDetail] = useState<PetDetail | null>(null);
  const [equipmentDetail, setEquipmentDetail] =
    useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itemId && itemType) {
      fetchDetail();
    }
  }, [isOpen, itemId, itemType]);

  const fetchDetail = async () => {
    if (!itemId || !itemType) return;

    setLoading(true);
    setError(null);

    // Reset all details
    setItemDetail(null);
    setCharacterDetail(null);
    setPetDetail(null);
    setEquipmentDetail(null);

    try {
      if (!token) {
        throw new Error("Please login to view details");
      }

      if (!user) {
        throw new Error("User session expired. Please login again");
      }

      let response;
      switch (itemType) {
        case "item":
          response = await inventoryAPI.getItemDetail(token, itemId);
          setItemDetail(response.item);
          break;
        case "character":
          response = await inventoryAPI.getCharacterDetail(token, itemId);
          setCharacterDetail(response.character);
          break;
        case "pet":
          response = await inventoryAPI.getPetDetail(token, itemId);
          setPetDetail(response.pet);
          break;
        case "equipment":
          response = await inventoryAPI.getEquipmentDetail(token, itemId);
          setEquipmentDetail(response.equipment);
          break;
        default:
          throw new Error("Unknown item type");
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
      let errorMessage = "Failed to load details";

      if (err instanceof Error) {
        // Check for specific error types
        if (
          err.message.includes("authentication") ||
          err.message.includes("token") ||
          err.message.includes("401")
        ) {
          errorMessage =
            "Authentication expired. Please refresh the page and login again";
        } else if (
          err.message.includes("500") ||
          err.message.includes("Internal Server Error")
        ) {
          errorMessage = "Server error. Please try again in a moment";
        } else if (
          err.message.includes("404") ||
          err.message.includes("not found")
        ) {
          errorMessage = `${itemType} not found in your inventory`;
        } else if (
          err.message.includes("Network Error") ||
          err.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "SSR":
        return "#ff6b6b";
      case "SR":
        return "#4ecdc4";
      case "R":
        return "#45b7d1";
      default:
        return "#95a5a6";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consumable":
        return "#e74c3c";
      case "material":
        return "#f39c12";
      case "enhancement":
        return "#9b59b6";
      case "currency":
        return "#f1c40f";
      case "special":
        return "#1abc9c";
      default:
        return "#95a5a6";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModalTitle = () => {
    switch (itemType) {
      case "character":
        return "Character Details";
      case "pet":
        return "Pet Details";
      case "equipment":
        return "Equipment Details";
      case "item":
        return "Item Details";
      default:
        return "Details";
    }
  };

  const getCurrentDetail = () => {
    return itemDetail || characterDetail || petDetail || equipmentDetail;
  };

  const renderContent = () => {
    const detail = getCurrentDetail();
    if (!detail) return null;

    if (itemDetail && itemType === "item") {
      return renderItemContent(itemDetail);
    } else if (characterDetail && itemType === "character") {
      return renderCharacterContent(characterDetail);
    } else if (petDetail && itemType === "pet") {
      return renderPetContent(petDetail);
    } else if (equipmentDetail && itemType === "equipment") {
      return renderEquipmentContent(equipmentDetail);
    }
    return null;
  };

  const renderItemContent = (item: ItemDetail) => (
    <div className="item-detail-content">
      {/* Header Section */}
      <div className="item-header-section">
        <div className="item-basic-info">
          <h1 className="item-name">{item.name}</h1>
          <div className="item-badges">
            <span
              className="rarity-badge"
              style={{ backgroundColor: getRarityColor(item.rarity) }}
            >
              {item.rarity}
            </span>
            <span
              className="type-badge"
              style={{ backgroundColor: getTypeColor(item.type) }}
            >
              {item.type.toUpperCase()}
            </span>
            {item.subType && (
              <span className="subtype-badge">{item.subType}</span>
            )}
          </div>
          <div className="quantity-info">
            <span className="quantity">
              Quantity: <strong>{item.quantity}</strong>
            </span>
            <span className="stack-limit">/ {item.stackLimit}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="section">
          <h3>Description</h3>
          <p className="description">{item.description}</p>
        </div>
      )}

      {/* Effects */}
      {item.effects && item.effects.length > 0 && (
        <div className="section">
          <h3>Effects</h3>
          <div className="effects-list">
            {item.effects.map((effect, index) => (
              <div key={index} className="effect-item">
                <span className="effect-type">{effect.type}</span>
                <span className="effect-value">+{effect.value}</span>
                {effect.target && (
                  <span className="effect-target">to {effect.target}</span>
                )}
                {effect.duration && effect.duration > 0 && (
                  <span className="effect-duration">({effect.duration}s)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="section">
        <h3>Properties</h3>
        <div className="properties-grid">
          <div className="property">
            <span className="property-label">Sell Price:</span>
            <span className="property-value">💰 {item.sellPrice}</span>
          </div>
          <div className="property">
            <span className="property-label">Tradeable:</span>
            <span className={`property-value ${item.tradeable ? "yes" : "no"}`}>
              {item.tradeable ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Locked:</span>
            <span
              className={`property-value ${
                item.metadata.isLocked ? "yes" : "no"
              }`}
            >
              {item.metadata.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="section">
        <h3>Details</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Obtained:</span>
            <span className="metadata-value">
              {formatDate(item.metadata.obtainedAt)}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Source:</span>
            <span className="metadata-value">{item.metadata.obtainedFrom}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button use-button" disabled>
          🎯 Use Item
        </button>
        <button className="action-button lock-button" disabled>
          {item.metadata.isLocked ? "🔓 Unlock" : "🔒 Lock"}
        </button>
        <button className="action-button sell-button" disabled>
          💰 Sell
        </button>
      </div>
    </div>
  );

  const renderCharacterContent = (character: CharacterDetail) => (
    <div className="item-detail-content">
      {/* Header Section */}
      <div className="item-header-section">
        <div className="item-basic-info">
          <h1 className="item-name">{character.name}</h1>
          <div className="item-badges">
            <span
              className="rarity-badge"
              style={{ backgroundColor: getRarityColor(character.rarity) }}
            >
              {character.rarity}
            </span>
            <span className="level-badge">Lv.{character.level}</span>
          </div>
          <div className="quantity-info">
            <span className="power-level">
              Power Level: <strong>{character.powerLevel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {character.description && (
        <div className="section">
          <h3>Description</h3>
          <p className="description">{character.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="section">
        <h3>Current Stats</h3>
        <div className="properties-grid">
          <div className="property">
            <span className="property-label">HP:</span>
            <span className="property-value">
              ❤️ {character.currentStats.hp}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Attack:</span>
            <span className="property-value">
              ⚔️ {character.currentStats.attack}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Defense:</span>
            <span className="property-value">
              🛡️ {character.currentStats.defense}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Speed:</span>
            <span className="property-value">
              💨 {character.currentStats.speed}
            </span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="section">
        <h3>Progress</h3>
        <div className="properties-grid">
          <div className="property">
            <span className="property-label">Experience:</span>
            <span className="property-value">⭐ {character.experience}</span>
          </div>
          <div className="property">
            <span className="property-label">Favorite:</span>
            <span
              className={`property-value ${
                character.metadata.isFavorite ? "yes" : "no"
              }`}
            >
              {character.metadata.isFavorite ? "💖 Yes" : "🤍 No"}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Locked:</span>
            <span
              className={`property-value ${
                character.metadata.isLocked ? "yes" : "no"
              }`}
            >
              {character.metadata.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="section">
        <h3>Details</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Obtained:</span>
            <span className="metadata-value">
              {formatDate(character.metadata.obtainedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button use-button" disabled>
          ⚔️ View Battle Stats
        </button>
        <button className="action-button lock-button" disabled>
          {character.metadata.isLocked ? "🔓 Unlock" : "🔒 Lock"}
        </button>
        <button className="action-button sell-button" disabled>
          💖 Toggle Favorite
        </button>
      </div>
    </div>
  );

  const renderPetContent = (pet: PetDetail) => (
    <div className="item-detail-content">
      {/* Header Section */}
      <div className="item-header-section">
        <div className="item-basic-info">
          <h1 className="item-name">{pet.name}</h1>
          <div className="item-badges">
            <span
              className="rarity-badge"
              style={{ backgroundColor: getRarityColor(pet.rarity) }}
            >
              {pet.rarity}
            </span>
            <span className="level-badge">Lv.{pet.level}</span>
            {pet.metadata.isActive && (
              <span className="active-badge">🟢 Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {pet.description && (
        <div className="section">
          <h3>Description</h3>
          <p className="description">{pet.description}</p>
        </div>
      )}

      {/* Progress */}
      <div className="section">
        <h3>Progress</h3>
        <div className="properties-grid">
          <div className="property">
            <span className="property-label">Experience:</span>
            <span className="property-value">⭐ {pet.experience}</span>
          </div>
          <div className="property">
            <span className="property-label">Active:</span>
            <span
              className={`property-value ${
                pet.metadata.isActive ? "yes" : "no"
              }`}
            >
              {pet.metadata.isActive ? "🟢 Active" : "⚪ Inactive"}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Favorite:</span>
            <span
              className={`property-value ${
                pet.metadata.isFavorite ? "yes" : "no"
              }`}
            >
              {pet.metadata.isFavorite ? "💖 Yes" : "🤍 No"}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Locked:</span>
            <span
              className={`property-value ${
                pet.metadata.isLocked ? "yes" : "no"
              }`}
            >
              {pet.metadata.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="section">
        <h3>Details</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Obtained:</span>
            <span className="metadata-value">
              {formatDate(pet.metadata.obtainedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button use-button" disabled>
          🐾 Pet Skills
        </button>
        <button className="action-button lock-button" disabled>
          {pet.metadata.isLocked ? "🔓 Unlock" : "🔒 Lock"}
        </button>
        <button className="action-button sell-button" disabled>
          💖 Toggle Favorite
        </button>
      </div>
    </div>
  );

  const renderEquipmentContent = (equipment: EquipmentDetail) => (
    <div className="item-detail-content">
      {/* Header Section */}
      <div className="item-header-section">
        <div className="item-basic-info">
          <h1 className="item-name">{equipment.name}</h1>
          <div className="item-badges">
            <span
              className="rarity-badge"
              style={{ backgroundColor: getRarityColor(equipment.rarity) }}
            >
              {equipment.rarity}
            </span>
            <span
              className="type-badge"
              style={{ backgroundColor: getTypeColor(equipment.type) }}
            >
              {equipment.type.toUpperCase()}
            </span>
            {equipment.subType && (
              <span className="subtype-badge">{equipment.subType}</span>
            )}
          </div>
          <div className="quantity-info">
            <span className="enhancement-level">
              Enhancement Level: <strong>+{equipment.enhancementLevel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {equipment.description && (
        <div className="section">
          <h3>Description</h3>
          <p className="description">{equipment.description}</p>
        </div>
      )}

      {/* Properties */}
      <div className="section">
        <h3>Properties</h3>
        <div className="properties-grid">
          <div className="property">
            <span className="property-label">Type:</span>
            <span className="property-value">
              {equipment.type}/{equipment.subType}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Equipped:</span>
            <span
              className={`property-value ${
                equipment.equippedTo ? "yes" : "no"
              }`}
            >
              {equipment.equippedTo
                ? `✅ ${equipment.equippedTo}`
                : "❌ Not Equipped"}
            </span>
          </div>
          <div className="property">
            <span className="property-label">Locked:</span>
            <span
              className={`property-value ${equipment.isLocked ? "yes" : "no"}`}
            >
              {equipment.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
          </div>
        </div>
      </div>

      {/* Base Stats */}
      {equipment.baseStats && Object.keys(equipment.baseStats).length > 0 && (
        <div className="section">
          <h3>Base Stats</h3>
          <div className="properties-grid">
            {Object.entries(equipment.baseStats).map(([stat, value]) => (
              <div key={stat} className="property">
                <span className="property-label">{stat}:</span>
                <span className="property-value">+{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="section">
        <h3>Details</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Obtained:</span>
            <span className="metadata-value">
              {formatDate(equipment.metadata.obtainedAt)}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Source:</span>
            <span className="metadata-value">
              {equipment.metadata.obtainedFrom}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-button use-button" disabled>
          🎒 Equip
        </button>
        <button className="action-button lock-button" disabled>
          {equipment.isLocked ? "🔓 Unlock" : "🔒 Lock"}
        </button>
        <button className="action-button sell-button" disabled>
          💰 Sell
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content item-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading item details...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">❌ {error}</p>
              <div className="error-actions">
                <button onClick={fetchDetail} className="retry-button">
                  🔄 Retry
                </button>
                {(error.includes("login") ||
                  error.includes("Authentication") ||
                  error.includes("session")) && (
                  <button
                    onClick={() => {
                      onClose();
                      // Refresh the page to go back to login
                      window.location.reload();
                    }}
                    className="login-button"
                  >
                    🔑 Go to Login
                  </button>
                )}
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
 