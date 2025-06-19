import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGameAPI } from "../../hooks/useGameAPI";
import type { InventoryResponse } from "../../types/types";
import InventoryModal from "../InventoryModal";

interface InventoryScreenProps {
  onBack: () => void;
}

type TabType = "all" | "characters" | "pets" | "items" | "equipments";
type ViewMode = "grid" | "large-grid" | "list";

interface FilterState {
  characters: {
    level: { min: number; max: number };
    power: { min: number; max: number };
    grade: string[];
    sortBy: "level" | "power" | "grade" | "name";
    sortOrder: "asc" | "desc";
  };
  pets: {
    level: { min: number; max: number };
    grade: string[];
    sortBy: "level" | "grade" | "name";
    sortOrder: "asc" | "desc";
  };
  equipments: {
    enhancementLevel: { min: number; max: number };
    grade: string[];
    type: string[];
    sortBy: "enhancementLevel" | "grade" | "name" | "type";
    sortOrder: "asc" | "desc";
  };
}

const GRADES = ["SSR", "SR", "R"];

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const { user } = useAuth();
  const { getInventory, isLoading, error } = useGameAPI();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "character" | "pet" | "equipment" | "item" | null
  >(null);

  const [filters, setFilters] = useState<FilterState>({
    characters: {
      level: { min: 1, max: 100 },
      power: { min: 0, max: 10000 },
      grade: [],
      sortBy: "power",
      sortOrder: "desc",
    },
    pets: {
      level: { min: 1, max: 50 },
      grade: [],
      sortBy: "level",
      sortOrder: "desc",
    },
    equipments: {
      enhancementLevel: { min: 0, max: 20 },
      grade: [],
      type: [],
      sortBy: "enhancementLevel",
      sortOrder: "desc",
    },
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const data = await getInventory();
    if (data) {
      setInventory(data);
      // Update filter ranges based on actual data
      updateFilterRanges(data);
    }
  };

  const updateFilterRanges = (data: InventoryResponse) => {
    // Calculate actual ranges from data
    const characterLevels = data.characters.map((c) => c.level || 1);
    const characterPowers = data.characters.map((c) => c.powerLevel || 0);
    const petLevels = data.pets.map((p) => p.level || 1);
    const equipmentLevels = (data.equipments || []).map(
      (e) => e.enhancementLevel || 0
    );

    setFilters((prev) => ({
      characters: {
        ...prev.characters,
        level: {
          min: Math.min(...characterLevels, 1),
          max: Math.max(...characterLevels, 100),
        },
        power: {
          min: Math.min(...characterPowers, 0),
          max: Math.max(...characterPowers, 10000),
        },
      },
      pets: {
        ...prev.pets,
        level: {
          min: Math.min(...petLevels, 1),
          max: Math.max(...petLevels, 50),
        },
      },
      equipments: {
        ...prev.equipments,
        enhancementLevel: {
          min: Math.min(...equipmentLevels, 0),
          max: Math.max(...equipmentLevels, 20),
        },
      },
    }));
  };

  // Modal handlers
  const openItemDetail = (itemId: string, itemType: string) => {
    // Support all item types
    setSelectedItemId(itemId);
    setSelectedItemType(itemType as "character" | "pet" | "equipment" | "item");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  const getGradeFromId = (id: string): string => {
    // Simple grade detection based on ID patterns
    if (id.includes("ssr") || id.includes("legendary")) return "SSR";
    if (id.includes("sr") || id.includes("epic")) return "SR";
    return "R";
  };

  const getGradeFromItem = (item: any): string => {
    // Use rarity field from API if available, otherwise fall back to ID detection
    return item.rarity || getGradeFromId(item.id);
  };

  const filterCharacters = (characters: any[]) => {
    let filtered = characters.filter((char) => {
      const level = char.level || 1;
      const power = char.powerLevel || 0;
      const grade = getGradeFromItem(char);

      // Level filter
      if (
        level < filters.characters.level.min ||
        level > filters.characters.level.max
      ) {
        return false;
      }

      // Power filter
      if (
        power < filters.characters.power.min ||
        power > filters.characters.power.max
      ) {
        return false;
      }

      // Grade filter
      if (
        filters.characters.grade.length > 0 &&
        !filters.characters.grade.includes(grade)
      ) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.characters.sortBy) {
        case "level":
          aValue = a.level || 1;
          bValue = b.level || 1;
          break;
        case "power":
          aValue = a.powerLevel || 0;
          bValue = b.powerLevel || 0;
          break;
        case "grade":
          aValue = GRADES.indexOf(getGradeFromItem(a));
          bValue = GRADES.indexOf(getGradeFromItem(b));
          break;
        case "name":
          aValue = a.name || a.id;
          bValue = b.name || b.id;
          break;
        default:
          return 0;
      }

      if (filters.characters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filterPets = (pets: any[]) => {
    let filtered = pets.filter((pet) => {
      const level = pet.level || 1;
      const grade = getGradeFromItem(pet);

      // Level filter
      if (level < filters.pets.level.min || level > filters.pets.level.max) {
        return false;
      }

      // Grade filter
      if (
        filters.pets.grade.length > 0 &&
        !filters.pets.grade.includes(grade)
      ) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.pets.sortBy) {
        case "level":
          aValue = a.level || 1;
          bValue = b.level || 1;
          break;
        case "grade":
          aValue = GRADES.indexOf(getGradeFromItem(a));
          bValue = GRADES.indexOf(getGradeFromItem(b));
          break;
        case "name":
          aValue = a.name || a.id;
          bValue = b.name || b.id;
          break;
        default:
          return 0;
      }

      if (filters.pets.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filterEquipments = (equipments: any[]) => {
    let filtered = equipments.filter((equipment) => {
      const enhancementLevel = equipment.enhancementLevel || 0;
      const grade = getGradeFromItem(equipment);
      const type = equipment.type || "weapon";

      // Enhancement level filter
      if (
        enhancementLevel < filters.equipments.enhancementLevel.min ||
        enhancementLevel > filters.equipments.enhancementLevel.max
      ) {
        return false;
      }

      // Grade filter
      if (
        filters.equipments.grade.length > 0 &&
        !filters.equipments.grade.includes(grade)
      ) {
        return false;
      }

      // Type filter
      if (
        filters.equipments.type.length > 0 &&
        !filters.equipments.type.includes(type)
      ) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.equipments.sortBy) {
        case "enhancementLevel":
          aValue = a.enhancementLevel || 0;
          bValue = b.enhancementLevel || 0;
          break;
        case "grade":
          aValue = GRADES.indexOf(getGradeFromItem(a));
          bValue = GRADES.indexOf(getGradeFromItem(b));
          break;
        case "name":
          aValue = a.name || a.id;
          bValue = b.name || b.id;
          break;
        case "type":
          aValue = a.type || "weapon";
          bValue = b.type || "weapon";
          break;
        default:
          return 0;
      }

      if (filters.equipments.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const updateCharacterFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [key]: value,
      },
    }));
  };

  const updatePetFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      pets: {
        ...prev.pets,
        [key]: value,
      },
    }));
  };

  const updateEquipmentFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      equipments: {
        ...prev.equipments,
        [key]: value,
      },
    }));
  };

  const toggleGradeFilter = (
    type: "characters" | "pets" | "equipments",
    grade: string
  ) => {
    const currentGrades = filters[type].grade;
    const newGrades = currentGrades.includes(grade)
      ? currentGrades.filter((g) => g !== grade)
      : [...currentGrades, grade];

    if (type === "characters") {
      updateCharacterFilter("grade", newGrades);
    } else if (type === "pets") {
      updatePetFilter("grade", newGrades);
    } else if (type === "equipments") {
      updateEquipmentFilter("grade", newGrades);
    }
  };

  const resetFilters = () => {
    setFilters({
      characters: {
        level: { min: 1, max: 100 },
        power: { min: 0, max: 10000 },
        grade: [],
        sortBy: "power",
        sortOrder: "desc",
      },
      pets: {
        level: { min: 1, max: 50 },
        grade: [],
        sortBy: "level",
        sortOrder: "desc",
      },
      equipments: {
        enhancementLevel: { min: 0, max: 20 },
        grade: [],
        type: [],
        sortBy: "enhancementLevel",
        sortOrder: "desc",
      },
    });
  };

  const getFilteredData = () => {
    if (!inventory)
      return { characters: [], pets: [], items: [], equipments: [] };

    return {
      characters: filterCharacters(inventory.characters),
      pets: filterPets(inventory.pets),
      items: inventory.items,
      equipments: filterEquipments(inventory.equipments || []),
    };
  };

  const filteredData = getFilteredData();

  const getTabCounts = () => {
    return {
      all:
        filteredData.characters.length +
        filteredData.pets.length +
        filteredData.items.length +
        filteredData.equipments.length,
      characters: filteredData.characters.length,
      pets: filteredData.pets.length,
      items: filteredData.items.length,
      equipments: filteredData.equipments.length,
    };
  };

  const tabCounts = getTabCounts();

  const renderFilterPanel = () => {
    if (!showFilters) return null;

    return (
      <div className="filter-panel">
        <div className="filter-header">
          <h4>🔍 Filters & Sorting</h4>
          <div className="filter-actions">
            <button className="reset-filters-btn" onClick={resetFilters}>
              🔄 Reset
            </button>
            <button
              className="close-filters-btn"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {(activeTab === "all" || activeTab === "characters") && (
          <div className="filter-section">
            <h5>⚔️ Characters</h5>

            {/* Level Range */}
            <div className="filter-group">
              <label>Level Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={filters.characters.level.min}
                  onChange={(e) =>
                    updateCharacterFilter("level", {
                      ...filters.characters.level,
                      min: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="100"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.characters.level.max}
                  onChange={(e) =>
                    updateCharacterFilter("level", {
                      ...filters.characters.level,
                      max: parseInt(e.target.value) || 100,
                    })
                  }
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Power Range */}
            <div className="filter-group">
              <label>Power Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={filters.characters.power.min}
                  onChange={(e) =>
                    updateCharacterFilter("power", {
                      ...filters.characters.power,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.characters.power.max}
                  onChange={(e) =>
                    updateCharacterFilter("power", {
                      ...filters.characters.power,
                      max: parseInt(e.target.value) || 10000,
                    })
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="filter-group">
              <label>Grade</label>
              <div className="grade-buttons">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    className={`grade-filter-btn ${grade.toLowerCase()} ${
                      filters.characters.grade.includes(grade) ? "active" : ""
                    }`}
                    onClick={() => toggleGradeFilter("characters", grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-controls">
                <select
                  value={filters.characters.sortBy}
                  onChange={(e) =>
                    updateCharacterFilter("sortBy", e.target.value)
                  }
                >
                  <option value="power">Power</option>
                  <option value="level">Level</option>
                  <option value="grade">Grade</option>
                  <option value="name">Name</option>
                </select>
                <button
                  className={`sort-order-btn ${filters.characters.sortOrder}`}
                  onClick={() =>
                    updateCharacterFilter(
                      "sortOrder",
                      filters.characters.sortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {filters.characters.sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "all" || activeTab === "pets") && (
          <div className="filter-section">
            <h5>🐾 Pets</h5>

            {/* Level Range */}
            <div className="filter-group">
              <label>Level Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={filters.pets.level.min}
                  onChange={(e) =>
                    updatePetFilter("level", {
                      ...filters.pets.level,
                      min: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="50"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.pets.level.max}
                  onChange={(e) =>
                    updatePetFilter("level", {
                      ...filters.pets.level,
                      max: parseInt(e.target.value) || 50,
                    })
                  }
                  min="1"
                  max="50"
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="filter-group">
              <label>Grade</label>
              <div className="grade-buttons">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    className={`grade-filter-btn ${grade.toLowerCase()} ${
                      filters.pets.grade.includes(grade) ? "active" : ""
                    }`}
                    onClick={() => toggleGradeFilter("pets", grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-controls">
                <select
                  value={filters.pets.sortBy}
                  onChange={(e) => updatePetFilter("sortBy", e.target.value)}
                >
                  <option value="level">Level</option>
                  <option value="grade">Grade</option>
                  <option value="name">Name</option>
                </select>
                <button
                  className={`sort-order-btn ${filters.pets.sortOrder}`}
                  onClick={() =>
                    updatePetFilter(
                      "sortOrder",
                      filters.pets.sortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {filters.pets.sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "all" || activeTab === "equipments") && (
          <div className="filter-section">
            <h5>⚔️ Equipments</h5>

            {/* Enhancement Level Range */}
            <div className="filter-group">
              <label>Enhancement Level Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={filters.equipments.enhancementLevel.min}
                  onChange={(e) =>
                    updateEquipmentFilter("enhancementLevel", {
                      ...filters.equipments.enhancementLevel,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="20"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.equipments.enhancementLevel.max}
                  onChange={(e) =>
                    updateEquipmentFilter("enhancementLevel", {
                      ...filters.equipments.enhancementLevel,
                      max: parseInt(e.target.value) || 20,
                    })
                  }
                  min="0"
                  max="20"
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="filter-group">
              <label>Grade</label>
              <div className="grade-buttons">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    className={`grade-filter-btn ${grade.toLowerCase()} ${
                      filters.equipments.grade.includes(grade) ? "active" : ""
                    }`}
                    onClick={() => toggleGradeFilter("equipments", grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <label>Equipment Type</label>
              <div className="grade-buttons">
                {["weapon", "armor", "accessory"].map((type) => (
                  <button
                    key={type}
                    className={`grade-filter-btn ${
                      filters.equipments.type.includes(type) ? "active" : ""
                    }`}
                    onClick={() => {
                      const currentTypes = filters.equipments.type;
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter((t) => t !== type)
                        : [...currentTypes, type];
                      updateEquipmentFilter("type", newTypes);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-controls">
                <select
                  value={filters.equipments.sortBy}
                  onChange={(e) =>
                    updateEquipmentFilter("sortBy", e.target.value)
                  }
                >
                  <option value="enhancementLevel">Enhancement Level</option>
                  <option value="grade">Grade</option>
                  <option value="type">Type</option>
                  <option value="name">Name</option>
                </select>
                <button
                  className={`sort-order-btn ${filters.equipments.sortOrder}`}
                  onClick={() =>
                    updateEquipmentFilter(
                      "sortOrder",
                      filters.equipments.sortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {filters.equipments.sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInventoryItem = (item: any, type: string) => {
    const grade = getGradeFromItem(item);

    return (
      <div
        key={`${type}-${item.id}-${Math.random()}`}
        className={`inventory-item-card ${type}-card ${
          item.isLocked ? "locked-card" : ""
        } clickable`}
        onClick={() => openItemDetail(item.id, type)}
        style={{ cursor: "pointer" }}
      >
        {/* Grade badge and Type badge in top-right corner */}
        <div className="grade-corner">
          <span className={`grade-badge ${grade.toLowerCase()}`}>{grade}</span>
          {type === "item" && item.type && (
            <span className={`type-badge item-type-${item.type}`}>
              {item.type}
            </span>
          )}
        </div>

        <div className="item-header">
          <div className="item-title">
            <span className="item-icon">
              {type === "character"
                ? "⚔️"
                : type === "pet"
                ? "🐾"
                : type === "equipment"
                ? "🛡️"
                : "📦"}
            </span>
            <h4 className="item-id">{item.name || item.id}</h4>
          </div>
        </div>

        <div className={`${type}-stats`}>
          {type === "character" && (
            <>
              <div className="stat-row">
                <span className="stat-label">Level</span>
                <span className="stat-value">{item.level || 1}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Power</span>
                <span className="stat-value">{item.powerLevel || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Experience</span>
                <span className="stat-value">{item.experience || 0}</span>
              </div>
            </>
          )}

          {type === "pet" && (
            <>
              <div className="stat-row">
                <span className="stat-label">Level</span>
                <span className="stat-value">{item.level || 1}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Experience</span>
                <span className="stat-value">{item.experience || 0}</span>
              </div>
            </>
          )}

          {type === "equipment" && (
            <>
              <div className="stat-row">
                <span className="stat-label">Enhancement</span>
                <span className="stat-value">
                  +{item.enhancementLevel || 0}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Type</span>
                <span className="stat-value">{item.type || "weapon"}</span>
              </div>
              {item.equippedTo && (
                <div className="stat-row">
                  <span className="stat-label">Equipped</span>
                  <span className="stat-value equipped">✓ Yes</span>
                </div>
              )}
            </>
          )}

          {type === "item" && (
            <div className="stat-row">
              <span className="stat-label">Quantity</span>
              <span className="stat-value quantity">{item.quantity || 1}</span>
            </div>
          )}
        </div>

        <div className="status-badges">
          {item.isActive && (
            <span className="status-badge active">✓ Active</span>
          )}
          {item.isFavorite && (
            <span className="status-badge favorite">★ Favorite</span>
          )}
          {item.isLocked && (
            <span className="status-badge locked">🔒 Locked</span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="inventory-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="loading">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={fetchInventory}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="inventory-container">
        <h2>🎒 Inventory</h2>

        <div className="inventory-controls">
          <div className="inventory-tabs">
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({tabCounts.all})
            </button>
            <button
              className={`tab ${activeTab === "characters" ? "active" : ""}`}
              onClick={() => setActiveTab("characters")}
            >
              Characters ({tabCounts.characters})
            </button>
            <button
              className={`tab ${activeTab === "pets" ? "active" : ""}`}
              onClick={() => setActiveTab("pets")}
            >
              Pets ({tabCounts.pets})
            </button>
            <button
              className={`tab ${activeTab === "items" ? "active" : ""}`}
              onClick={() => setActiveTab("items")}
            >
              Items ({tabCounts.items})
            </button>
            <button
              className={`tab ${activeTab === "equipments" ? "active" : ""}`}
              onClick={() => setActiveTab("equipments")}
            >
              Equipments ({tabCounts.equipments})
            </button>
          </div>

          <div className="view-controls">
            <div className="view-mode-buttons">
              <button
                className={`view-mode-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`view-mode-btn ${
                  viewMode === "large-grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("large-grid")}
                title="Large Grid View"
              >
                ⊡
              </button>
              <button
                className={`view-mode-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                ☰
              </button>
            </div>

            <button
              className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 Filters
            </button>
          </div>
        </div>

        {renderFilterPanel()}

        <div className="inventory-content">
          {!inventory ? (
            <div className="empty-inventory">
              <p>No inventory data available</p>
            </div>
          ) : (
            <div
              className={`inventory-grid ${
                viewMode === "large-grid" ? "large-grid-view" : ""
              } ${viewMode === "list" ? "list-view" : ""}`}
            >
              {activeTab === "all" && (
                <>
                  {filteredData.characters.map((item) =>
                    renderInventoryItem(item, "character")
                  )}
                  {filteredData.pets.map((item) =>
                    renderInventoryItem(item, "pet")
                  )}
                  {filteredData.items.map((item) =>
                    renderInventoryItem(item, "item")
                  )}
                  {filteredData.equipments.map((item) =>
                    renderInventoryItem(item, "equipment")
                  )}
                </>
              )}
              {activeTab === "characters" &&
                filteredData.characters.map((item) =>
                  renderInventoryItem(item, "character")
                )}
              {activeTab === "pets" &&
                filteredData.pets.map((item) =>
                  renderInventoryItem(item, "pet")
                )}
              {activeTab === "items" &&
                filteredData.items.map((item) =>
                  renderInventoryItem(item, "item")
                )}
              {activeTab === "equipments" &&
                filteredData.equipments.map((item) =>
                  renderInventoryItem(item, "equipment")
                )}
            </div>
          )}

          {inventory &&
            ((activeTab === "all" && tabCounts.all === 0) ||
              (activeTab === "characters" && tabCounts.characters === 0) ||
              (activeTab === "pets" && tabCounts.pets === 0) ||
              (activeTab === "items" && tabCounts.items === 0) ||
              (activeTab === "equipments" && tabCounts.equipments === 0)) && (
              <div className="empty-inventory">
                <p>No items match your current filters</p>
                <p>Try adjusting your filter settings</p>
              </div>
            )}
        </div>

        {/* Item Detail Modal */}
        <InventoryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          itemId={selectedItemId}
          itemType={selectedItemType}
        />
      </div>
    </div>
  );
}
