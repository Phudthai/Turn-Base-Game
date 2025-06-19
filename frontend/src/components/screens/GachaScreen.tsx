import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGameAPI } from "../../hooks/useGameAPI";
import type {
  GachaPullResponse,
  GachaPull,
  MultiGachaPull,
} from "../../types/types";

interface GachaScreenProps {
  onBack: () => void;
}

interface Banner {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  featured: {
    items: string[];
    rateUp: number;
  };
  cost: {
    currency: string;
    amount: number;
    discount?: {
      multiPull: number;
    };
  };
  duration?: {
    start: string;
    end: string;
  };
}

type PullType = "single" | "multi";

export function GachaScreen({ onBack }: GachaScreenProps) {
  const [lastPullResult, setLastPullResult] =
    useState<GachaPullResponse | null>(null);
  const [pullType, setPullType] = useState<PullType>("single");
  const [selectedBanner, setSelectedBanner] =
    useState<string>("standard_banner");
  const [banners, setBanners] = useState<Banner[]>([]);

  const { user } = useAuth();
  const {
    performGacha,
    performMultiGacha,
    getBanners,
    isLoading,
    error,
    clearError,
  } = useGameAPI();

  // Load banners on component mount
  useEffect(() => {
    const loadBanners = async () => {
      const bannersData = await getBanners();
      if (bannersData && bannersData.success) {
        setBanners(bannersData.banners);
      }
    };
    loadBanners();
  }, [getBanners]);

  const performSingleGacha = async () => {
    if (!user || isLoading) return;

    console.log("🎮 Single gacha button clicked");
    console.log("🎮 Current loading state:", isLoading);
    console.log("🎮 Current user:", user);
    console.log("🎮 Selected banner:", selectedBanner);

    clearError();
    setLastPullResult(null);

    console.log("🎮 Calling performGacha...");
    const result = await performGacha(selectedBanner);
    console.log("🎮 Gacha result in component:", result);

    if (result) {
      console.log("🎮 Setting pull result and type");
      setLastPullResult(result);
      setPullType("single");
    }
  };

  const performMultiGachaAction = async () => {
    if (!user || isLoading) return;

    console.log("🎮 Multi gacha button clicked");
    console.log("🎮 Current loading state:", isLoading);
    console.log("🎮 Current user:", user);
    console.log("🎮 Selected banner:", selectedBanner);

    clearError();
    setLastPullResult(null);

    console.log("🎮 Calling performMultiGacha...");
    const result = await performMultiGacha(selectedBanner);
    console.log("🎮 Multi gacha result in component:", result);

    if (result) {
      console.log("🎮 Setting multi pull result and type");
      setLastPullResult(result);
      setPullType("multi");
    }
  };

  const getCurrentBanner = () => {
    return banners.find((banner) => banner.id === selectedBanner);
  };

  const getBannerTypeIcon = (type: string) => {
    switch (type) {
      case "standard":
        return "⭐";
      case "event":
        return "🎉";
      case "limited":
        return "💎";
      default:
        return "🎰";
    }
  };

  // Map item IDs to readable names
  const getItemNameById = (itemId: string): string => {
    // Character names mapping (from seed data)
    const characterNames: Record<string, string> = {
      // From seed-data.ts
      char_ssr_001: "Dragon Knight Aria",
      char_ssr_002: "Celestial Mage Luna",
      char_ssr_003: "Shadow Assassin Kage",
      char_sr_001: "Fire Warrior Blaze",
      char_sr_002: "Ice Sorceress Frost",
      char_sr_003: "Earth Guardian Stone",
      char_r_001: "Rookie Swordsman",
      char_r_002: "Village Mage",
      char_r_003: "Town Guard",
      // From other seed files
      char_001: "Fire Knight",
      char_fire_001: "Fire Knight", // Featured in banner
    };

    // Pet names mapping (from seed data)
    const petNames: Record<string, string> = {
      // From seed-data.ts
      pet_ssr_001: "Ancient Dragon",
      pet_ssr_002: "Phoenix Companion",
      pet_ssr_003: "Void Spirit",
      pet_sr_001: "Lightning Wolf",
      pet_sr_002: "Crystal Turtle",
      pet_sr_003: "Wind Eagle",
      pet_r_001: "Forest Sprite",
      pet_r_002: "Rock Golem",
      pet_r_003: "Water Slime",
      // From other seed files
      pet_001: "Fire Drake",
      pet_002: "Healing Fairy",
      pet_dragon_001: "Ancient Dragon", // Featured in banner
      pet_phoenix_001: "Phoenix Companion", // Featured in banner
    };

    // Item names mapping (from seed data)
    const itemNames: Record<string, string> = {
      // From seed-data.ts
      item_ssr_001: "Legendary Enhancement Crystal",
      item_ssr_002: "Phoenix Feather",
      item_sr_001: "Magic Enhancement Potion",
      item_sr_002: "Experience Scroll",
      item_sr_003: "Mystic Ore",
      item_r_001: "Health Potion",
      item_r_002: "Energy Drink",
      item_r_003: "Iron Ore",
      item_r_004: "Gem Token",
      // From other seed files
      item_001: "Health Potion",
      item_002: "Power Crystal",
      item_003: "Legendary Essence",
    };

    // Return the mapped name or fallback to ID
    return (
      characterNames[itemId] || petNames[itemId] || itemNames[itemId] || itemId
    );
  };

  const getBannerDescription = (banner: Banner) => {
    if (banner.featured.items.length > 0) {
      // Map item IDs to readable names
      const itemNames = banner.featured.items.map((itemId) =>
        getItemNameById(itemId)
      );
      const itemsText = itemNames.join(", ");
      return `Featured: ${itemsText} (${(banner.featured.rateUp * 100).toFixed(
        0
      )}% rate up)`;
    }
    return "Standard rates for all items";
  };

  const isMultiPull = (
    pull: GachaPull | MultiGachaPull
  ): pull is MultiGachaPull => {
    return "pulls" in pull;
  };

  const renderGachaResult = () => {
    if (!lastPullResult || !lastPullResult.success) return null;

    // Handle both single and multi pull results
    let pulls: any[] = [];
    let isMultiPullResult = false;

    // Check if it's a multi-pull result (has pulls array)
    if (
      lastPullResult.pull &&
      lastPullResult.pull.pulls &&
      Array.isArray(lastPullResult.pull.pulls)
    ) {
      pulls = lastPullResult.pull.pulls;
      isMultiPullResult = true;
    }
    // Single pull result
    else if (lastPullResult.pull) {
      pulls = [lastPullResult.pull];
      isMultiPullResult = false;
    } else {
      return null;
    }

    // Check for high rarity items to add special effects
    const hasSSR = pulls.some((pull) => pull.item?.rarity === "SSR");
    const hasSR = pulls.some((pull) => pull.item?.rarity === "SR");

    // Determine result container classes
    let resultClasses = "gacha-result";
    if (hasSSR) resultClasses += " has-ssr";
    else if (hasSR) resultClasses += " has-sr";

    return (
      <div className={resultClasses}>
        <h3>
          {isMultiPullResult
            ? `${pulls.length}x Pull Results!`
            : "Single Pull Result!"}
        </h3>

        {isMultiPullResult ? (
          <div className="multi-gacha-grid">
            {pulls.map((pull, index) => (
              <GachaItemCard key={index} pull={pull} isMultiItem={true} />
            ))}
          </div>
        ) : (
          <GachaItemCard pull={pulls[0]} isMultiItem={false} />
        )}

        {isMultiPullResult && <GachaSummary pulls={pulls} />}

        {/* Pity and Currency Info */}
        {lastPullResult.pityInfo && (
          <div className="pity-info">
            <p>🎯 Pity Counter: {lastPullResult.pityInfo.current}/100</p>
            <p>
              ⭐ {lastPullResult.pityInfo.untilGuaranteed} pulls until
              guaranteed SSR
            </p>
            <p className="pity-banner-type">
              📋 Banner: {getCurrentBanner()?.name} ({getCurrentBanner()?.type})
            </p>
          </div>
        )}

        {lastPullResult.currency && (
          <div className="currency-info">
            <p>
              Spent: {lastPullResult.currency.spent}{" "}
              {lastPullResult.currency.type}
            </p>
            <p>
              Remaining: {lastPullResult.currency.remaining}{" "}
              {lastPullResult.currency.type}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="gacha-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="gacha-container">
        <h2>🎰 Gacha Pull</h2>

        {/* Banner Selection */}
        <div className="banner-selection">
          <h3>Select Banner</h3>
          <div className="banner-list">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`banner-card ${
                  selectedBanner === banner.id ? "selected" : ""
                } ${banner.type}`}
                onClick={() => setSelectedBanner(banner.id)}
              >
                <div className="banner-header">
                  <span className="banner-icon">
                    {getBannerTypeIcon(banner.type)}
                  </span>
                  <h4>{banner.name}</h4>
                  {banner.type !== "standard" && (
                    <span className="banner-type">
                      {banner.type.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="banner-description">
                  {getBannerDescription(banner)}
                </p>
                <div className="banner-cost">
                  <span>
                    💎 {banner.cost.amount} {banner.cost.currency}
                  </span>
                  {banner.cost.discount && (
                    <span className="multi-cost">
                      | 10x: 💎 {banner.cost.discount.multiPull}{" "}
                      {banner.cost.currency}
                    </span>
                  )}
                </div>
                {banner.duration && (
                  <div className="banner-duration">
                    <small>
                      Until:{" "}
                      {new Date(banner.duration.end).toLocaleDateString()}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="gacha-area">
          {error && <div className="error-message">{error}</div>}

          {/* Current Banner Info */}
          {getCurrentBanner() && (
            <div className="current-banner-info">
              <h3>Current Banner: {getCurrentBanner()!.name}</h3>
              <p>{getBannerDescription(getCurrentBanner()!)}</p>
            </div>
          )}

          <div className="gacha-buttons">
            <div className="gacha-option">
              <h4>Single Pull</h4>
              <p>Pull one item</p>
              <button
                className="gacha-button single"
                onClick={performSingleGacha}
                disabled={isLoading}
              >
                {isLoading && pullType === "single"
                  ? "Pulling..."
                  : `Pull x1 (💎 ${getCurrentBanner()?.cost.amount || 160})`}
              </button>
            </div>

            <div className="gacha-option">
              <h4>Multi Pull</h4>
              <p>Pull 10 items (guaranteed SR+!)</p>
              <button
                className="gacha-button multi"
                onClick={performMultiGachaAction}
                disabled={isLoading}
              >
                {isLoading && pullType === "multi"
                  ? "Pulling..."
                  : `Pull x10 (💎 ${
                      getCurrentBanner()?.cost.discount?.multiPull || 1600
                    })`}
              </button>
            </div>
          </div>

          {renderGachaResult()}
        </div>
      </div>
    </div>
  );
}

// Individual gacha item card component
function GachaItemCard({
  pull,
  isMultiItem = false,
}: {
  pull: any; // Using any for now since the API structure is different
  isMultiItem?: boolean;
}) {
  let item: any = null;
  let type = "";
  let rarity = "";
  let icon = "";

  // Handle the actual API response structure
  if (pull.type && pull.item) {
    item = pull.item;
    type = pull.type;
    rarity = pull.item.rarity;

    // Set icons based on type and item
    switch (pull.type) {
      case "character":
        icon = "⚔️";
        break;
      case "pet":
        icon = "🐾";
        break;
      case "item":
        // Enhanced item icons based on item name
        switch (pull.item.name) {
          case "Legendary Enhancement Crystal":
            icon = "💎";
            break;
          case "Phoenix Feather":
            icon = "🪶";
            break;
          case "Magic Enhancement Potion":
            icon = "🧪";
            break;
          case "Experience Scroll":
            icon = "📜";
            break;
          case "Mystic Ore":
            icon = "⛏️";
            break;
          case "Health Potion":
            icon = "🍶";
            break;
          case "Energy Drink":
            icon = "🥤";
            break;
          case "Iron Ore":
            icon = "🪨";
            break;
          case "Gem Token":
            icon = "🎫";
            break;
          default:
            icon = "📦";
        }
        break;
      default:
        icon = "❓";
    }
  } else {
    // Fallback for old structure (if any)
    if (pull.character) {
      item = pull.character;
      type = "Character";
      rarity = pull.character.rarity;
      icon = "⚔️";
    } else if (pull.pet) {
      item = pull.pet;
      type = "Pet";
      rarity = pull.pet.rarity;
      icon = "🐾";
    } else if (pull.item) {
      item = pull.item;
      type = "Item";
      rarity = pull.item.rarity;
      icon = "📦";
    }
  }

  if (!item) return null;

  // Enhanced card classes with rarity and special effects
  let cardClasses = `item-card rarity-${rarity.toLowerCase()}`;
  if (isMultiItem) cardClasses += " multi-item";

  // Add new item indicator for special items
  if (rarity === "SSR") cardClasses += " new-item";

  return (
    <div className={cardClasses}>
      <div className="item-icon">{icon}</div>
      <div className="item-rarity">{rarity}</div>
      <h4>{item.name}</h4>
      <div className="item-type">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </div>

      {/* Item effect description */}
      {item.effect && <div className="item-description">{item.effect}</div>}

      {/* Character stats */}
      {pull.type === "character" && item.stats && (
        <div className="item-stats">
          <div className="item-stat">HP: {item.stats.hp}</div>
          <div className="item-stat">ATK: {item.stats.attack}</div>
          <div className="item-stat">DEF: {item.stats.defense}</div>
        </div>
      )}

      {/* Pet bonus */}
      {pull.type === "pet" && item.bonus && (
        <div className="item-stats">
          <div className="item-stat">
            Bonus: +{item.bonus.value} {item.bonus.type}
          </div>
        </div>
      )}

      {/* Item quantity (if applicable) */}
      {item.quantity && <div className="item-quantity">x{item.quantity}</div>}
    </div>
  );
}

// Summary component for multi-pulls
function GachaSummary({ pulls }: { pulls: any[] }) {
  const rarityCounts = pulls.reduce((acc, pull) => {
    // Extract rarity from the new API structure
    const rarity = pull.item?.rarity;

    if (rarity) {
      acc[rarity] = (acc[rarity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="gacha-summary">
      <h4>✨ Pull Summary</h4>
      <div className="rarity-breakdown">
        {Object.entries(rarityCounts)
          .sort(([a], [b]) => {
            const order = { SSR: 3, SR: 2, R: 1 };
            return (
              (order[b as keyof typeof order] || 0) -
              (order[a as keyof typeof order] || 0)
            );
          })
          .map(([rarity, count]) => (
            <div
              key={rarity}
              className={`rarity-count rarity-${rarity.toLowerCase()}`}
            >
              {rarity}: {count}
            </div>
          ))}
      </div>
    </div>
  );
}
