import React, { useState } from "react";
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

type PullType = "single" | "multi";

export function GachaScreen({ onBack }: GachaScreenProps) {
  const [lastPullResult, setLastPullResult] =
    useState<GachaPullResponse | null>(null);
  const [pullType, setPullType] = useState<PullType>("single");

  const { user } = useAuth();
  const { performGacha, performMultiGacha, isLoading, error, clearError } =
    useGameAPI();

  const performSingleGacha = async () => {
    if (!user || isLoading) return;

    clearError();
    setLastPullResult(null);

    const result = await performGacha();
    if (result) {
      setLastPullResult(result);
      setPullType("single");
    }
  };

  const performMultiGachaAction = async () => {
    if (!user || isLoading) return;

    clearError();
    setLastPullResult(null);

    const result = await performMultiGacha();
    if (result) {
      setLastPullResult(result);
      setPullType("multi");
    }
  };

  const isMultiPull = (
    pull: GachaPull | MultiGachaPull
  ): pull is MultiGachaPull => {
    return "pulls" in pull;
  };

  const renderGachaResult = () => {
    if (!lastPullResult || !lastPullResult.success) return null;

    if (isMultiPull(lastPullResult.pull)) {
      // Multi pull result
      const multiPull = lastPullResult.pull;
      return (
        <div className="gacha-result">
          <h3>You got {multiPull.pulls.length} items!</h3>
          {multiPull.guaranteedSR && (
            <p className="guaranteed-notice">✨ Guaranteed SR+ activated!</p>
          )}
          <div className="multi-gacha-grid">
            {multiPull.pulls.map((pull, index) => (
              <GachaItemCard key={index} pull={pull} isMulti={true} />
            ))}
          </div>
          <div className="multi-gacha-summary">
            <GachaSummary pulls={multiPull.pulls} />
          </div>
          {lastPullResult.pityInfo && (
            <div className="pity-info">
              <p>
                Pity: {lastPullResult.pityInfo.current}/100 (
                {lastPullResult.pityInfo.untilGuaranteed} until guaranteed)
              </p>
            </div>
          )}
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
        </div>
      );
    } else {
      // Single pull result
      const singlePull = lastPullResult.pull as GachaPull;
      return (
        <div className="gacha-result">
          <h3>You got:</h3>
          <GachaItemCard pull={singlePull} />
          {lastPullResult.pityInfo && (
            <div className="pity-info">
              <p>
                Pity: {lastPullResult.pityInfo.current}/100 (
                {lastPullResult.pityInfo.untilGuaranteed} until guaranteed)
              </p>
            </div>
          )}
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
        </div>
      );
    }
  };

  return (
    <div className="gacha-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <h2>🎰 Gacha Pull</h2>

      <div className="gacha-area">
        {error && <div className="error-message">{error}</div>}

        <div className="gacha-buttons">
          <div className="gacha-option">
            <h4>Single Pull</h4>
            <p>Pull one item</p>
            <button
              className="gacha-button single"
              onClick={performSingleGacha}
              disabled={isLoading}
            >
              {isLoading && pullType === "single" ? "Pulling..." : "Pull x1"}
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
              {isLoading && pullType === "multi" ? "Pulling..." : "Pull x10"}
            </button>
          </div>
        </div>

        {renderGachaResult()}
      </div>
    </div>
  );
}

// Individual gacha item card component
function GachaItemCard({
  pull,
  isMulti = false,
}: {
  pull: GachaPull;
  isMulti?: boolean;
}) {
  return (
    <div
      className={`item-card rarity-${pull.item.rarity.toLowerCase()} ${
        isMulti ? "multi-item" : ""
      }`}
    >
      <h4>{pull.item.name}</h4>
      <p className="item-rarity">⭐ {pull.item.rarity}</p>
      <p className="item-type">{pull.type}</p>

      {/* Stats for characters */}
      {pull.item.stats && (
        <div className="item-stats">
          <p className="item-stat">⚔️ ATK: {pull.item.stats.attack}</p>
          <p className="item-stat">🛡️ DEF: {pull.item.stats.defense}</p>
          <p className="item-stat">❤️ HP: {pull.item.stats.hp}</p>
        </div>
      )}

      {/* Bonus for items */}
      {pull.item.bonus && (
        <div className="item-bonus">
          <p className="item-stat">
            🌟 {pull.item.bonus.type}: +{pull.item.bonus.value}
          </p>
        </div>
      )}

      {/* Effect description */}
      {pull.item.effect && (
        <p className="item-description">{pull.item.effect}</p>
      )}
    </div>
  );
}

// Summary component for multi-pulls
function GachaSummary({ pulls }: { pulls: GachaPull[] }) {
  const rarityCount = pulls.reduce(
    (acc, pull) => {
      acc[pull.item.rarity.toLowerCase()]++;
      return acc;
    },
    { r: 0, sr: 0, ssr: 0 } as Record<string, number>
  );

  return (
    <div className="gacha-summary">
      <h4>Pull Summary</h4>
      <div className="rarity-breakdown">
        <span className="rarity-count rarity-r">R: {rarityCount.r}</span>
        <span className="rarity-count rarity-sr">SR: {rarityCount.sr}</span>
        <span className="rarity-count rarity-ssr">SSR: {rarityCount.ssr}</span>
      </div>
    </div>
  );
}
