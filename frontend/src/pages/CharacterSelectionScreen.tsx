import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { inventoryAPI, authAPI } from "../services/api";
import "./CharacterSelectionScreen.css";

interface CharacterSelectionScreenProps {
  onBack: () => void;
  onStartBattle: (selectedCharacters: UserCharacter[]) => void;
}

interface UserCharacter {
  id: string;
  characterId: string;
  name: string;
  level: number;
  rarity: "R" | "SR" | "SSR";
  currentStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
  };
  powerLevel?: number;
  isLocked: boolean;
  isFavorite: boolean;
  artwork?: {
    icon: string;
    thumbnail: string;
  };
}

export function CharacterSelectionScreen({
  onBack,
  onStartBattle,
}: CharacterSelectionScreenProps) {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<UserCharacter[]>(
    []
  );
  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("level");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const maxTeamSize = 3; // Maximum characters for battle

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [characters, rarityFilter, sortBy, sortOrder]);

  const applyFilters = () => {
    let filtered = [...characters];

    // Apply rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter((char) => char.rarity === rarityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "level":
          aValue = a.level;
          bValue = b.level;
          break;
        case "power":
          aValue = a.powerLevel || 0;
          bValue = b.powerLevel || 0;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "rarity":
          const rarityOrder = { SSR: 3, SR: 2, R: 1 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder];
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder];
          break;
        default:
          aValue = a.level;
          bValue = b.level;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCharacters(filtered);
  };

  const loadCharacters = async () => {
    if (!token) {
      setError("Please login to access characters");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Loading characters for user:", user?.id);

      // Use the full characters endpoint instead of grid + individual calls
      const response = await inventoryAPI.getCharacters(token);
      console.log("Characters response:", response);

      if (response && response.characters) {
        if (response.characters.length === 0) {
          setError(
            "No characters found in your inventory. Try using the Gacha system to get some characters first!"
          );
          setCharacters([]);
          setLoading(false);
          return;
        }

        // Transform the data to match our interface - backend now has full data including templates
        const transformedCharacters = response.characters.map((char: any) => ({
          id: char.id, // This is the _id from MongoDB
          characterId: char.characterId,
          name: char.name, // Now available from backend template
          level: char.level,
          rarity: char.rarity, // Now available from backend template
          currentStats: char.currentStats,
          powerLevel: char.powerLevel,
          isLocked: char.metadata?.isLocked || false,
          isFavorite: char.metadata?.isFavorite || false,
          artwork: char.artwork || {
            icon: "👤",
            thumbnail: "👤",
          },
        }));

        console.log(
          "Transformed characters loaded:",
          transformedCharacters.length
        );
        setCharacters(transformedCharacters);
      } else {
        setError(
          "No characters found in your inventory. Try using the Gacha system to get some characters first!"
        );
        setCharacters([]);
      }
    } catch (err: any) {
      console.error("Error loading characters:", err);
      if (err.message.includes("characters")) {
        setError(
          "No characters found in your inventory. Try using the Gacha system to get some characters first!"
        );
      } else {
        setError(err.message || "Failed to load characters");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (character: UserCharacter) => {
    if (character.isLocked) return;

    const isSelected = selectedCharacters.some((c) => c.id === character.id);

    if (isSelected) {
      // Remove from selection
      setSelectedCharacters((prev) =>
        prev.filter((c) => c.id !== character.id)
      );
    } else {
      // Add to selection if not at max
      if (selectedCharacters.length < maxTeamSize) {
        setSelectedCharacters((prev) => [...prev, character]);
      }
    }
  };

  const handleStartBattle = () => {
    if (selectedCharacters.length === 0) {
      alert("Please select at least one character!");
      return;
    }
    onStartBattle(selectedCharacters);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "SSR":
        return "#ff6b35";
      case "SR":
        return "#9b59b6";
      case "R":
        return "#3498db";
      default:
        return "#95a5a6";
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case "SSR":
        return "⭐⭐⭐";
      case "SR":
        return "⭐⭐";
      case "R":
        return "⭐";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="character-selection-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-selection-screen">
        <div className="error-message">
          <h3>❌ Error Loading Characters</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={loadCharacters}>
              🔄 Retry
            </button>
            <button className="back-to-lobby-button" onClick={onBack}>
              🏠 Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="character-selection-screen">
      {/* Header with centered title and counter */}
      <div className="selection-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="header-center">
          <h2>⚔️ Select Battle Team</h2>
          <div className="team-counter">
            {selectedCharacters.length}/{maxTeamSize} selected
          </div>
        </div>

        <button
          className="start-battle-button"
          onClick={handleStartBattle}
          disabled={selectedCharacters.length === 0}
        >
          ⚔️ Start Battle
        </button>
      </div>

      {/* Selected Team Preview */}
      <div className="selected-team-preview">
        <h3>🛡️ Battle Team</h3>
        <div className="selected-team-icons">
          {selectedCharacters.map((character, index) => (
            <div key={character.id} className="selected-icon">
              <div className="character-mini-icon">
                {character.artwork?.icon || "👤"}
              </div>
              <div className="mini-level">Lv.{character.level}</div>
              <button
                className="remove-mini-button"
                onClick={() => handleCharacterSelect(character)}
                title="Remove from team"
              >
                ❌
              </button>
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({
            length: maxTeamSize - selectedCharacters.length,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="empty-slot">
              <div className="empty-icon">+</div>
              <div className="empty-text">Empty</div>
            </div>
          ))}
        </div>
      </div>

      {/* Character Selection Area */}
      <div className="character-selection-area">
        <h3>📋 Choose Your Characters</h3>
        <p className="instruction">Swipe left or right to browse characters</p>

        {filteredCharacters.length === 0 ? (
          <div className="no-characters">
            <p>No characters found matching your filters.</p>
            <p>Try adjusting your filter settings!</p>
          </div>
        ) : (
          <div className="characters-carousel">
            {/* Filters Section - inside carousel but above scroll */}
            <div className="filters-section">
              <div className="filter-group">
                <label>Rarity:</label>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Rarities</option>
                  <option value="SSR">SSR ⭐⭐⭐</option>
                  <option value="SR">SR ⭐⭐</option>
                  <option value="R">R ⭐</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="level">Level</option>
                  <option value="power">Power</option>
                  <option value="name">Name</option>
                  <option value="rarity">Rarity</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Order:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>

              <div className="results-count">
                {filteredCharacters.length} characters
              </div>
            </div>
            {/* Single grid scroll with 2 rows, cards alternate rows */}
            <div className="characters-scroll-grid">
              {filteredCharacters.map((character, i) => {
                const isSelected = selectedCharacters.some(
                  (c) => c.id === character.id
                );
                const isLocked = character.isLocked;
                const powerLevel =
                  character.powerLevel ||
                  Math.floor(
                    character.currentStats.hp * 0.3 +
                      character.currentStats.attack * 0.4 +
                      character.currentStats.defense * 0.2 +
                      character.currentStats.speed * 0.1
                  );
                return (
                  <div
                    key={character.id}
                    className={`character-card-horizontal ${
                      isSelected ? "selected" : ""
                    } ${isLocked ? "locked" : ""}`}
                    style={{ gridRow: (i % 2) + 1 }}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <div
                      className="character-grade-badge"
                      style={{ color: getRarityColor(character.rarity) }}
                    >
                      {character.rarity}
                    </div>
                    <div className="character-power-badge">⚡ {powerLevel}</div>
                    {isLocked && <div className="lock-overlay">🔒</div>}
                    {character.isFavorite && (
                      <div className="favorite-badge">❤️</div>
                    )}
                    <div className="character-main-icon">
                      {character.artwork?.icon || "👤"}
                    </div>
                    <div className="character-info-horizontal">
                      <div className="character-name">{character.name}</div>
                      <div className="character-level-large">
                        Lv.{character.level}
                      </div>
                      <div
                        className="character-rarity-stars"
                        style={{ color: getRarityColor(character.rarity) }}
                      >
                        {getRarityStars(character.rarity)}
                      </div>
                      <div className="quick-stats">
                        <div className="stat-item">
                          <span className="stat-icon">❤️</span>
                          <span className="stat-value">
                            {character.currentStats.hp}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">⚔️</span>
                          <span className="stat-value">
                            {character.currentStats.attack}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">🛡️</span>
                          <span className="stat-value">
                            {character.currentStats.defense}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">💨</span>
                          <span className="stat-value">
                            {character.currentStats.speed}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="rarity-border"
                      style={{
                        backgroundColor: getRarityColor(character.rarity),
                        opacity: isSelected ? 1 : 0.3,
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
