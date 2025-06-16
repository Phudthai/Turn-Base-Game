import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGameAPI } from "../../hooks/useGameAPI";

interface BattleScreenProps {
  onBack: () => void;
}

interface BattleCharacter {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: BattleSkill[];
  isPlayer: boolean;
  position: { x: number; y: number };
  isAnimating: boolean;
  animationType: "idle" | "attack" | "skill" | "damage" | "victory" | "defeat";
}

interface BattleSkill {
  id: string;
  name: string;
  mpCost: number;
  damage: number;
  type: "attack" | "heal" | "buff" | "debuff";
  description: string;
}

interface BattleState {
  phase: "preparation" | "battle" | "victory" | "defeat";
  turn: "player" | "enemy";
  turnCount: number;
  selectedAction: "attack" | "skill" | "defend" | null;
  selectedSkill: BattleSkill | null;
  battleLog: string[];
  isProcessing: boolean;
}

export function BattleScreen({ onBack }: BattleScreenProps) {
  const { user } = useAuth();
  const { startBattle, isLoading } = useGameAPI();

  // Battle Characters
  const [playerCharacter, setPlayerCharacter] = useState<BattleCharacter>({
    id: "player_char",
    name: "Hero",
    level: 5,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 25,
    defense: 15,
    speed: 20,
    skills: [
      {
        id: "fireball",
        name: "🔥 Fireball",
        mpCost: 10,
        damage: 35,
        type: "attack",
        description: "Fire magic attack",
      },
      {
        id: "heal",
        name: "💚 Heal",
        mpCost: 15,
        damage: -30,
        type: "heal",
        description: "Restore HP",
      },
      {
        id: "lightning",
        name: "⚡ Lightning",
        mpCost: 20,
        damage: 45,
        type: "attack",
        description: "Lightning strike",
      },
    ],
    isPlayer: true,
    position: { x: 20, y: 50 },
    isAnimating: false,
    animationType: "idle",
  });

  const [enemyCharacter, setEnemyCharacter] = useState<BattleCharacter>({
    id: "enemy_char",
    name: "Goblin Warrior",
    level: 4,
    hp: 80,
    maxHp: 80,
    mp: 30,
    maxMp: 30,
    attack: 20,
    defense: 10,
    speed: 15,
    skills: [
      {
        id: "slash",
        name: "🗡️ Slash",
        mpCost: 5,
        damage: 25,
        type: "attack",
        description: "Basic sword attack",
      },
      {
        id: "rage",
        name: "😡 Rage",
        mpCost: 10,
        damage: 35,
        type: "attack",
        description: "Powerful attack",
      },
    ],
    isPlayer: false,
    position: { x: 80, y: 50 },
    isAnimating: false,
    animationType: "idle",
  });

  const [battleState, setBattleState] = useState<BattleState>({
    phase: "preparation",
    turn: "player",
    turnCount: 1,
    selectedAction: null,
    selectedSkill: null,
    battleLog: ["⚔️ Battle begins!"],
    isProcessing: false,
  });

  // Start Battle
  const handleStartBattle = () => {
    setBattleState((prev) => ({
      ...prev,
      phase: "battle",
      battleLog: [...prev.battleLog, `🎯 Turn ${prev.turnCount} - Your turn!`],
    }));
  };

  // Player Actions
  const handleAttack = () => {
    if (battleState.isProcessing) return;
    setBattleState((prev) => ({ ...prev, selectedAction: "attack" }));
    executePlayerAction("attack");
  };

  const handleSkill = (skill: BattleSkill) => {
    if (battleState.isProcessing || playerCharacter.mp < skill.mpCost) return;
    setBattleState((prev) => ({
      ...prev,
      selectedAction: "skill",
      selectedSkill: skill,
    }));
    executePlayerAction("skill", skill);
  };

  const handleDefend = () => {
    if (battleState.isProcessing) return;
    setBattleState((prev) => ({ ...prev, selectedAction: "defend" }));
    executePlayerAction("defend");
  };

  // Execute Actions
  const executePlayerAction = async (action: string, skill?: BattleSkill) => {
    setBattleState((prev) => ({ ...prev, isProcessing: true }));

    // Animate player character
    setPlayerCharacter((prev) => ({
      ...prev,
      isAnimating: true,
      animationType: action === "skill" ? "skill" : "attack",
    }));

    await new Promise((resolve) => setTimeout(resolve, 500)); // Animation delay

    let damage = 0;
    let logMessage = "";

    if (action === "attack") {
      damage = Math.max(
        1,
        playerCharacter.attack -
          enemyCharacter.defense +
          Math.floor(Math.random() * 10) -
          5
      );
      logMessage = `⚔️ ${playerCharacter.name} attacks for ${damage} damage!`;
    } else if (action === "skill" && skill) {
      if (skill.type === "heal") {
        const healAmount = Math.abs(skill.damage);
        setPlayerCharacter((prev) => ({
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + healAmount),
          mp: prev.mp - skill.mpCost,
        }));
        logMessage = `💚 ${playerCharacter.name} heals for ${healAmount} HP!`;
      } else {
        damage = Math.max(
          1,
          skill.damage -
            enemyCharacter.defense +
            Math.floor(Math.random() * 10) -
            5
        );
        setPlayerCharacter((prev) => ({ ...prev, mp: prev.mp - skill.mpCost }));
        logMessage = `✨ ${playerCharacter.name} uses ${skill.name} for ${damage} damage!`;
      }
    } else if (action === "defend") {
      logMessage = `🛡️ ${playerCharacter.name} defends!`;
    }

    // Apply damage to enemy
    if (damage > 0) {
      setEnemyCharacter((prev) => ({
        ...prev,
        hp: Math.max(0, prev.hp - damage),
        isAnimating: true,
        animationType: "damage",
      }));

      await new Promise((resolve) => setTimeout(resolve, 300));
      setEnemyCharacter((prev) => ({
        ...prev,
        isAnimating: false,
        animationType: "idle",
      }));
    }

    // Reset player animation
    setPlayerCharacter((prev) => ({
      ...prev,
      isAnimating: false,
      animationType: "idle",
    }));

    // Update battle log
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, logMessage],
      selectedAction: null,
      selectedSkill: null,
    }));

    // Check if enemy is defeated
    if (enemyCharacter.hp - damage <= 0) {
      setBattleState((prev) => ({
        ...prev,
        phase: "victory",
        isProcessing: false,
        battleLog: [...prev.battleLog, "🎉 Victory! You defeated the enemy!"],
      }));
      setEnemyCharacter((prev) => ({ ...prev, animationType: "defeat" }));
      setPlayerCharacter((prev) => ({ ...prev, animationType: "victory" }));
      return;
    }

    // Enemy turn
    await new Promise((resolve) => setTimeout(resolve, 1000));
    executeEnemyAction();
  };

  const executeEnemyAction = async () => {
    // Simple AI: Random attack or skill
    const useSkill = Math.random() > 0.6 && enemyCharacter.mp >= 5;
    const skill =
      enemyCharacter.skills[
        Math.floor(Math.random() * enemyCharacter.skills.length)
      ];

    setEnemyCharacter((prev) => ({
      ...prev,
      isAnimating: true,
      animationType: useSkill ? "skill" : "attack",
    }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    let damage = 0;
    let logMessage = "";

    if (useSkill && enemyCharacter.mp >= skill.mpCost) {
      damage = Math.max(
        1,
        skill.damage -
          playerCharacter.defense +
          Math.floor(Math.random() * 8) -
          4
      );
      setEnemyCharacter((prev) => ({ ...prev, mp: prev.mp - skill.mpCost }));
      logMessage = `💀 ${enemyCharacter.name} uses ${skill.name} for ${damage} damage!`;
    } else {
      damage = Math.max(
        1,
        enemyCharacter.attack -
          playerCharacter.defense +
          Math.floor(Math.random() * 8) -
          4
      );
      logMessage = `💀 ${enemyCharacter.name} attacks for ${damage} damage!`;
    }

    // Apply damage to player
    setPlayerCharacter((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage),
      isAnimating: true,
      animationType: "damage",
    }));

    await new Promise((resolve) => setTimeout(resolve, 300));
    setPlayerCharacter((prev) => ({
      ...prev,
      isAnimating: false,
      animationType: "idle",
    }));
    setEnemyCharacter((prev) => ({
      ...prev,
      isAnimating: false,
      animationType: "idle",
    }));

    // Check if player is defeated
    if (playerCharacter.hp - damage <= 0) {
      setBattleState((prev) => ({
        ...prev,
        phase: "defeat",
        isProcessing: false,
        battleLog: [
          ...prev.battleLog,
          logMessage,
          "💀 Defeat! You have been defeated...",
        ],
      }));
      setPlayerCharacter((prev) => ({ ...prev, animationType: "defeat" }));
      setEnemyCharacter((prev) => ({ ...prev, animationType: "victory" }));
      return;
    }

    // Next turn
    setBattleState((prev) => ({
      ...prev,
      turn: "player",
      turnCount: prev.turnCount + 1,
      isProcessing: false,
      battleLog: [
        ...prev.battleLog,
        logMessage,
        `🎯 Turn ${prev.turnCount + 1} - Your turn!`,
      ],
    }));
  };

  const getHPPercentage = (character: BattleCharacter) => {
    return (character.hp / character.maxHp) * 100;
  };

  const getMPPercentage = (character: BattleCharacter) => {
    return (character.mp / character.maxMp) * 100;
  };

  if (battleState.phase === "preparation") {
    return (
      <div className="battle-screen">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="battle-preparation">
          <h2>⚔️ Battle Preparation</h2>
          <div className="enemy-preview">
            <h3>🏴‍☠️ {enemyCharacter.name}</h3>
            <p>Level {enemyCharacter.level}</p>
            <p>
              HP: {enemyCharacter.maxHp} | MP: {enemyCharacter.maxMp}
            </p>
          </div>

          <div className="player-preview">
            <h3>🦸‍♂️ {playerCharacter.name}</h3>
            <p>Level {playerCharacter.level}</p>
            <p>
              HP: {playerCharacter.maxHp} | MP: {playerCharacter.maxMp}
            </p>
          </div>

          <button className="start-battle-btn" onClick={handleStartBattle}>
            ⚔️ Start Battle!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      {/* Battle Arena */}
      <div className="battle-arena">
        {/* Player Character */}
        <div
          className={`battle-character player ${
            playerCharacter.animationType
          } ${playerCharacter.isAnimating ? "animating" : ""}`}
          style={{
            left: `${playerCharacter.position.x}%`,
            top: `${playerCharacter.position.y}%`,
          }}
        >
          <div className="character-sprite">🦸‍♂️</div>
          <div className="character-info">
            <div className="character-name">{playerCharacter.name}</div>
            <div className="hp-bar">
              <div
                className="hp-fill"
                style={{ width: `${getHPPercentage(playerCharacter)}%` }}
              ></div>
              <span className="hp-text">
                {playerCharacter.hp}/{playerCharacter.maxHp}
              </span>
            </div>
            <div className="mp-bar">
              <div
                className="mp-fill"
                style={{ width: `${getMPPercentage(playerCharacter)}%` }}
              ></div>
              <span className="mp-text">
                {playerCharacter.mp}/{playerCharacter.maxMp}
              </span>
            </div>
          </div>
        </div>

        {/* Enemy Character */}
        <div
          className={`battle-character enemy ${enemyCharacter.animationType} ${
            enemyCharacter.isAnimating ? "animating" : ""
          }`}
          style={{
            left: `${enemyCharacter.position.x}%`,
            top: `${enemyCharacter.position.y}%`,
          }}
        >
          <div className="character-sprite">👹</div>
          <div className="character-info">
            <div className="character-name">{enemyCharacter.name}</div>
            <div className="hp-bar">
              <div
                className="hp-fill"
                style={{ width: `${getHPPercentage(enemyCharacter)}%` }}
              ></div>
              <span className="hp-text">
                {enemyCharacter.hp}/{enemyCharacter.maxHp}
              </span>
            </div>
            <div className="mp-bar">
              <div
                className="mp-fill"
                style={{ width: `${getMPPercentage(enemyCharacter)}%` }}
              ></div>
              <span className="mp-text">
                {enemyCharacter.mp}/{enemyCharacter.maxMp}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle UI */}
      <div className="battle-ui">
        {/* Battle Log */}
        <div className="battle-log">
          <h4>📜 Battle Log</h4>
          <div className="log-content">
            {battleState.battleLog.slice(-5).map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {battleState.phase === "battle" &&
          battleState.turn === "player" &&
          !battleState.isProcessing && (
            <div className="battle-actions">
              <button className="action-btn attack-btn" onClick={handleAttack}>
                ⚔️ Attack
              </button>

              <div className="skills-section">
                <h5>✨ Skills</h5>
                <div className="skills-grid">
                  {playerCharacter.skills.map((skill) => (
                    <button
                      key={skill.id}
                      className={`skill-btn ${
                        playerCharacter.mp < skill.mpCost ? "disabled" : ""
                      }`}
                      onClick={() => handleSkill(skill)}
                      disabled={playerCharacter.mp < skill.mpCost}
                      title={skill.description}
                    >
                      {skill.name}
                      <span className="mp-cost">({skill.mpCost} MP)</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="action-btn defend-btn" onClick={handleDefend}>
                🛡️ Defend
              </button>
            </div>
          )}

        {/* Battle Result */}
        {(battleState.phase === "victory" ||
          battleState.phase === "defeat") && (
          <div className="battle-result">
            <h3>
              {battleState.phase === "victory" ? "🎉 Victory!" : "💀 Defeat!"}
            </h3>
            <p>
              {battleState.phase === "victory"
                ? "You have defeated the enemy! Gained 50 EXP and 100 coins!"
                : "You have been defeated. Better luck next time!"}
            </p>
            <button className="result-btn" onClick={onBack}>
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {battleState.isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing turn...</p>
          </div>
        )}
      </div>
    </div>
  );
}
