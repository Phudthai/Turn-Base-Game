import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { inventoryAPI } from "../../services/api";

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
  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"level" | "rarity" | "power">("level");
  const [filterRarity, setFilterRarity] = useState<"all" | "R" | "SR" | "SSR">(
    "all"
  );

  const maxTeamSize = 3; // Maximum characters for battle

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await inventoryAPI.getCharactersGrid(token);

      if (response.characters) {
        // Get detailed character data
        const detailedCharacters = await Promise.all(
          response.characters.map(async (char: any) => {
            try {
              const detailResponse = await inventoryAPI.getCharacterDetail(
                token,
                char.id
              );
              return detailResponse.character;
            } catch (err) {
              console.error(
                `Failed to get details for character ${char.id}:`,
                err
              );
              return null;
            }
          })
        );

        const validCharacters = detailedCharacters.filter(
          (char) => char !== null
        );
        setCharacters(validCharacters);
      }
    } catch (err: any) {
      console.error("Error loading characters:", err);
      setError(err.message || "Failed to load characters");
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

  const getSortedAndFilteredCharacters = () => {
    let filtered = characters;

    // Filter by rarity
    if (filterRarity !== "all") {
      filtered = filtered.filter((char) => char.rarity === filterRarity);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return b.level - a.level;
        case "rarity":
          const rarityOrder = { SSR: 3, SR: 2, R: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case "power":
          const aPower = a.powerLevel || calculatePowerLevel(a);
          const bPower = b.powerLevel || calculatePowerLevel(b);
          return bPower - aPower;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const calculatePowerLevel = (character: UserCharacter) => {
    const stats = character.currentStats;
    return Math.floor(
      stats.hp * 0.3 +
        stats.attack * 0.4 +
        stats.defense * 0.2 +
        stats.speed * 0.1
    );
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

  const getRarityEmoji = (rarity: string) => {
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
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-selection-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="error-container">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadCharacters} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const sortedCharacters = getSortedAndFilteredCharacters();

  return (
    <div className="character-selection-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>⚔️ Select Battle Team</h2>
        <div className="team-counter">
          {selectedCharacters.length}/{maxTeamSize}
        </div>
      </div>

      {/* Selected Team Preview */}
      {selectedCharacters.length > 0 && (
        <div className="selected-team">
          <h3>🛡️ Selected Team</h3>
          <div className="selected-characters">
            {selectedCharacters.map((character, index) => (
              <div key={character.id} className="selected-character">
                <div className="character-icon">
                  {character.artwork?.icon || "👤"}
                </div>
                <div className="character-info">
                  <div className="character-name">{character.name}</div>
                  <div className="character-level">Lv.{character.level}</div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => handleCharacterSelect(character)}
                  title="Remove from team"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="controls">
        <div className="filter-section">
          <label>Filter by Rarity:</label>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as any)}
          >
            <option value="all">All Rarities</option>
            <option value="SSR">SSR ⭐⭐⭐</option>
            <option value="SR">SR ⭐⭐</option>
            <option value="R">R ⭐</option>
          </select>
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="level">Level</option>
            <option value="rarity">Rarity</option>
            <option value="power">Power</option>
          </select>
        </div>
      </div>

      {/* Character Grid */}
      <div className="characters-grid">
        {sortedCharacters.length === 0 ? (
          <div className="no-characters">
            <p>No characters found matching your filters.</p>
          </div>
        ) : (
          sortedCharacters.map((character) => {
            const isSelected = selectedCharacters.some(
              (c) => c.id === character.id
            );
            const isLocked = character.isLocked;
            const powerLevel =
              character.powerLevel || calculatePowerLevel(character);

            return (
              <div
                key={character.id}
                className={`character-card ${isSelected ? "selected" : ""} ${
                  isLocked ? "locked" : ""
                }`}
                onClick={() => handleCharacterSelect(character)}
                style={{
                  borderColor: isSelected
                    ? getRarityColor(character.rarity)
                    : undefined,
                }}
              >
                {isLocked && <div className="lock-overlay">🔒</div>}
                {character.isFavorite && (
                  <div className="favorite-badge">❤️</div>
                )}

                <div className="character-icon">
                  {character.artwork?.icon || "👤"}
                </div>

                <div className="character-info">
                  <div className="character-name">{character.name}</div>
                  <div
                    className="character-rarity"
                    style={{ color: getRarityColor(character.rarity) }}
                  >
                    {getRarityEmoji(character.rarity)}
                  </div>
                  <div className="character-level">Lv.{character.level}</div>
                  <div className="power-level">⚡ {powerLevel}</div>
                </div>

                <div className="character-stats">
                  <div className="stat">
                    <span className="stat-label">HP:</span>
                    <span className="stat-value">
                      {character.currentStats.hp}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">ATK:</span>
                    <span className="stat-value">
                      {character.currentStats.attack}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">DEF:</span>
                    <span className="stat-value">
                      {character.currentStats.defense}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">SPD:</span>
                    <span className="stat-value">
                      {character.currentStats.speed}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="selection-indicator">✅ Selected</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Start Battle Button */}
      <div className="battle-controls">
        <button
          className="start-battle-button"
          onClick={handleStartBattle}
          disabled={selectedCharacters.length === 0}
        >
          ⚔️ Start Battle ({selectedCharacters.length} characters)
        </button>
      </div>
    </div>
  );
}
