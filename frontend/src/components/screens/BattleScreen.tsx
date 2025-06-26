import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CharacterSelectionScreen } from "./CharacterSelectionScreen";
import "./BattleScreen.css";

interface BattleScreenProps {
  onBack: () => void;
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
  artwork?: {
    icon: string;
    thumbnail: string;
  };
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
  phase:
    | "character_selection"
    | "preparation"
    | "battle"
    | "victory"
    | "defeat";
  turn: "player" | "enemy";
  turnCount: number;
  selectedAction: "attack" | "skill" | "defend" | null;
  selectedSkill: BattleSkill | null;
  battleLog: string[];
  isProcessing: boolean;
  selectedDifficulty: "easy" | "normal" | "hard" | "nightmare";
  selectedEnemy: string;
}

const ENEMY_TYPES = [
  {
    id: "goblin",
    name: "Goblin Warrior",
    level: 4,
    hp: 80,
    mp: 30,
    attack: 20,
    defense: 10,
    speed: 15,
    icon: "👹",
    description: "A fierce goblin warrior with basic combat skills",
  },
  {
    id: "orc",
    name: "Orc Shaman",
    level: 6,
    hp: 120,
    mp: 60,
    attack: 25,
    defense: 15,
    speed: 12,
    icon: "🧌",
    description: "A powerful orc that uses dark magic",
  },
  {
    id: "undead",
    name: "Undead Knight",
    level: 8,
    hp: 150,
    mp: 40,
    attack: 30,
    defense: 25,
    speed: 10,
    icon: "💀",
    description: "An armored undead warrior with high defense",
  },
];

const DIFFICULTY_SETTINGS = {
  easy: { multiplier: 0.8, rewards: 1.0, name: "Easy", color: "#4ade80" },
  normal: { multiplier: 1.0, rewards: 1.2, name: "Normal", color: "#3b82f6" },
  hard: { multiplier: 1.3, rewards: 1.5, name: "Hard", color: "#f59e0b" },
  nightmare: {
    multiplier: 1.6,
    rewards: 2.0,
    name: "Nightmare",
    color: "#ef4444",
  },
};

export function BattleScreen({ onBack }: BattleScreenProps) {
  const { user } = useAuth();

  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>(
    []
  );
  const [playerCharacters, setPlayerCharacters] = useState<BattleCharacter[]>(
    []
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [battleState, setBattleState] = useState<BattleState>({
    phase: "character_selection",
    turn: "player",
    turnCount: 1,
    selectedAction: null,
    selectedSkill: null,
    battleLog: ["⚔️ Battle begins!"],
    isProcessing: false,
    selectedDifficulty: "normal",
    selectedEnemy: "goblin",
  });

  // Convert UserCharacter to BattleCharacter
  const convertToBattleCharacter = (
    userChar: UserCharacter,
    index: number
  ): BattleCharacter => {
    const baseHp = userChar.currentStats.hp;
    const baseMp = Math.floor(baseHp * 0.5);

    return {
      id: userChar.id,
      name: userChar.name,
      level: userChar.level,
      hp: baseHp,
      maxHp: baseHp,
      mp: baseMp,
      maxMp: baseMp,
      attack: userChar.currentStats.attack,
      defense: userChar.currentStats.defense,
      speed: userChar.currentStats.speed,
      skills: [
        {
          id: "basic_attack",
          name: "⚔️ Strike",
          mpCost: 5,
          damage: Math.floor(userChar.currentStats.attack * 0.8),
          type: "attack",
          description: "Basic attack",
        },
        {
          id: "power_strike",
          name: "💥 Power Strike",
          mpCost: 15,
          damage: Math.floor(userChar.currentStats.attack * 1.2),
          type: "attack",
          description: "Powerful attack",
        },
        {
          id: "heal",
          name: "💚 Heal",
          mpCost: 20,
          damage: -Math.floor(baseHp * 0.3),
          type: "heal",
          description: "Restore HP",
        },
      ],
      isPlayer: true,
      artwork: userChar.artwork,
    };
  };

  // Handle character selection completion
  const handleCharacterSelection = (characters: UserCharacter[]) => {
    setSelectedCharacters(characters);

    // Convert to battle characters
    const battleChars = characters.map((char, index) =>
      convertToBattleCharacter(char, index)
    );
    setPlayerCharacters(battleChars);

    // Move to preparation phase
    setBattleState((prev) => ({
      ...prev,
      phase: "preparation",
    }));
  };

  // Character Selection Phase
  if (battleState.phase === "character_selection") {
    return (
      <CharacterSelectionScreen
        onBack={onBack}
        onStartBattle={handleCharacterSelection}
      />
    );
  }

  // Battle Preparation Phase
  if (battleState.phase === "preparation") {
    const selectedEnemyData = ENEMY_TYPES.find(
      (e) => e.id === battleState.selectedEnemy
    );
    const difficultyData = DIFFICULTY_SETTINGS[battleState.selectedDifficulty];

    return (
      <div className="battle-screen">
        <div className="battle-header">
          <button
            className="back-button"
            onClick={() =>
              setBattleState((prev) => ({
                ...prev,
                phase: "character_selection",
              }))
            }
          >
            ← Back to Character Selection
          </button>

          <div className="header-center">
            <h1 className="battle-title">⚔️ Battle Preparation</h1>
          </div>

          <button
            className="start-battle-button"
            onClick={() =>
              setBattleState((prev) => ({ ...prev, phase: "battle" }))
            }
          >
            ⚔️ Start Battle
          </button>
        </div>

        <div className="battle-preparation">
          {/* Top Row: Enemy Selection & Difficulty */}
          <div className="preparation-top-row">
            <div className="preparation-section enemy-selection-section">
              <h3 className="section-title">🏴‍☠️ Choose Your Enemy</h3>
              <div className="enemy-selection">
                {ENEMY_TYPES.map((enemy) => (
                  <div
                    key={enemy.id}
                    className={`enemy-card ${
                      battleState.selectedEnemy === enemy.id ? "selected" : ""
                    }`}
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedEnemy: enemy.id,
                      }))
                    }
                  >
                    <div className="enemy-icon">{enemy.icon}</div>
                    <div className="enemy-name">{enemy.name}</div>
                    <div className="enemy-stats">
                      Level{" "}
                      {Math.round(enemy.level * difficultyData.multiplier)} |
                      HP: {Math.round(enemy.hp * difficultyData.multiplier)}
                    </div>
                    <div className="enemy-description">{enemy.description}</div>
                  </div>
                ))}
              </div>

              <h4 className="section-title">🎯 Difficulty</h4>
              <div className="difficulty-selection">
                {Object.entries(DIFFICULTY_SETTINGS).map(([key, diff]) => (
                  <div
                    key={key}
                    className={`difficulty-card ${
                      battleState.selectedDifficulty === key ? "selected" : ""
                    }`}
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedDifficulty: key as any,
                      }))
                    }
                  >
                    <div
                      className="difficulty-name"
                      style={{ color: diff.color }}
                    >
                      {diff.name}
                    </div>
                    <div className="difficulty-info">
                      {diff.multiplier * 100}% Stats | {diff.rewards * 100}%
                      Rewards
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Battle Formation */}
          <div className="preparation-bottom-row">
            <div className="battle-formation">
              <h3 className="section-title">⚔️ Battle Formation</h3>

              {/* Player Team Row */}
              <div className="team-formation">
                <div className="team-label">🛡️ Your Team</div>
                <div className="player-team-row">
                  {playerCharacters.map((character, index) => (
                    <div
                      key={character.id}
                      className={`formation-slot player-slot ${
                        index === currentPlayerIndex ? "active" : ""
                      }`}
                    >
                      <div className="character-avatar">
                        {character.artwork?.icon || "🦸‍♂️"}
                      </div>
                      <div className="character-name">{character.name}</div>
                      <div className="character-level">
                        Level {character.level}
                      </div>
                      <div className="character-stats-mini">
                        <div className="mini-stat">
                          <span>HP</span>
                          <span>{character.maxHp}</span>
                        </div>
                        <div className="mini-stat">
                          <span>ATK</span>
                          <span>{character.attack}</span>
                        </div>
                        <div className="mini-stat">
                          <span>DEF</span>
                          <span>{character.defense}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vs-section">
                <div className="vs-text">VS</div>
              </div>

              {/* Enemy Formation */}
              <div className="enemy-formation">
                <div className="team-label">🏴‍☠️ Enemy</div>
                <div className="enemy-slot-container">
                  <div className="formation-slot enemy-slot">
                    <div className="character-avatar">
                      {selectedEnemyData?.icon}
                    </div>
                    <div className="character-name">
                      {selectedEnemyData?.name || "Unknown Enemy"}
                    </div>
                    <div className="character-level">
                      Level{" "}
                      {Math.round(
                        (selectedEnemyData?.level || 1) *
                          difficultyData.multiplier
                      )}
                    </div>
                    <div className="character-stats-mini">
                      <div className="mini-stat">
                        <span>HP</span>
                        <span>
                          {Math.round(
                            (selectedEnemyData?.hp || 80) *
                              difficultyData.multiplier
                          )}
                        </span>
                      </div>
                      <div className="mini-stat">
                        <span>ATK</span>
                        <span>
                          {Math.round(
                            (selectedEnemyData?.attack || 20) *
                              difficultyData.multiplier
                          )}
                        </span>
                      </div>
                      <div className="mini-stat">
                        <span>DEF</span>
                        <span>
                          {Math.round(
                            (selectedEnemyData?.defense || 10) *
                              difficultyData.multiplier
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simple Battle Phase (placeholder)
  return (
    <div className="battle-screen">
      <div className="battle-header">
        <button
          className="back-button"
          onClick={() =>
            setBattleState((prev) => ({ ...prev, phase: "preparation" }))
          }
        >
          ← Back to Preparation
        </button>

        <div className="battle-info">
          <div className="turn-indicator">
            <strong>Turn {battleState.turnCount}</strong>
          </div>
          <div
            className={`turn-indicator ${
              battleState.turn === "enemy" ? "enemy-turn" : ""
            }`}
          >
            {battleState.turn === "player" ? "🛡️ Your Turn" : "⚔️ Enemy Turn"}
          </div>
        </div>
      </div>

      <div className="battle-arena">
        <div className="battle-field">
          <div className="characters-display">
            {/* Player Team */}
            <div className="team-section">
              <h3 className="team-title">🛡️ Your Team</h3>
              <div className="character-list">
                {playerCharacters.map((character, index) => (
                  <div
                    key={character.id}
                    className={`battle-character ${
                      index === currentPlayerIndex &&
                      battleState.turn === "player"
                        ? "active"
                        : ""
                    } ${character.hp <= 0 ? "dead" : ""}`}
                  >
                    <div className="character-header">
                      <div className="character-avatar">
                        {character.artwork?.icon || "🦸‍♂️"}
                      </div>
                      <div className="character-info">
                        <div className="character-name">{character.name}</div>
                        <div className="character-level">
                          Level {character.level}
                        </div>
                      </div>
                    </div>

                    <div className="health-bar-container">
                      <div className="health-bar">
                        <div
                          className="health-fill"
                          style={{
                            width: `${(character.hp / character.maxHp) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="bar-text">
                        HP: {character.hp}/{character.maxHp}
                      </div>
                    </div>

                    <div className="mana-bar">
                      <div
                        className="mana-fill"
                        style={{
                          width: `${(character.mp / character.maxMp) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="bar-text">
                      MP: {character.mp}/{character.maxMp}
                    </div>

                    <div className="character-stats">
                      <div className="stat-item">ATK: {character.attack}</div>
                      <div className="stat-item">DEF: {character.defense}</div>
                      <div className="stat-item">SPD: {character.speed}</div>
                      <div className="stat-item">
                        ⚡{" "}
                        {Math.floor(
                          (character.hp +
                            character.attack +
                            character.defense) /
                            3
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enemy Team */}
            <div className="team-section">
              <h3 className="team-title enemy-title">⚔️ Enemies</h3>
              <div className="character-list">
                {ENEMY_TYPES.filter(
                  (e) => e.id === battleState.selectedEnemy
                ).map((enemy) => {
                  const difficultyData =
                    DIFFICULTY_SETTINGS[battleState.selectedDifficulty];
                  const enemyHp = Math.round(
                    enemy.hp * difficultyData.multiplier
                  );
                  const enemyMp = Math.round(
                    enemy.mp * difficultyData.multiplier
                  );

                  return (
                    <div
                      key={enemy.id}
                      className={`battle-character ${
                        battleState.turn === "enemy" ? "active" : ""
                      }`}
                    >
                      <div className="character-header">
                        <div className="character-avatar">{enemy.icon}</div>
                        <div className="character-info">
                          <div className="character-name">{enemy.name}</div>
                          <div className="character-level">
                            Level{" "}
                            {Math.round(
                              enemy.level * difficultyData.multiplier
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="health-bar-container">
                        <div className="health-bar">
                          <div
                            className="health-fill"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <div className="bar-text">
                          HP: {enemyHp}/{enemyHp}
                        </div>
                      </div>

                      <div className="mana-bar">
                        <div
                          className="mana-fill"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <div className="bar-text">
                        MP: {enemyMp}/{enemyMp}
                      </div>

                      <div className="character-stats">
                        <div className="stat-item">
                          ATK:{" "}
                          {Math.round(enemy.attack * difficultyData.multiplier)}
                        </div>
                        <div className="stat-item">
                          DEF:{" "}
                          {Math.round(
                            enemy.defense * difficultyData.multiplier
                          )}
                        </div>
                        <div className="stat-item">SPD: {enemy.speed}</div>
                        <div className="stat-item">
                          ⚡{" "}
                          {Math.round(
                            (enemyHp + enemy.attack + enemy.defense) / 3
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            <div className="log-title">📜 Battle Log</div>
            {battleState.battleLog.map((entry, index) => (
              <div key={index} className="log-entry">
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="actions-panel">
          <div className="actions-title">⚡ Battle Actions</div>

          {battleState.turn === "player" && !battleState.isProcessing && (
            <>
              {!battleState.selectedAction && (
                <div className="action-buttons">
                  <button
                    className="action-btn attack"
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: "attack",
                      }))
                    }
                    disabled={playerCharacters[currentPlayerIndex]?.hp <= 0}
                  >
                    ⚔️ Attack
                  </button>
                  <button
                    className="action-btn skill"
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: "skill",
                      }))
                    }
                    disabled={playerCharacters[currentPlayerIndex]?.hp <= 0}
                  >
                    ✨ Use Skill
                  </button>
                  <button
                    className="action-btn defend"
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: "defend",
                      }))
                    }
                    disabled={playerCharacters[currentPlayerIndex]?.hp <= 0}
                  >
                    🛡️ Defend
                  </button>
                </div>
              )}

              {battleState.selectedAction === "skill" && (
                <>
                  <div className="skills-list">
                    {playerCharacters[currentPlayerIndex]?.skills.map(
                      (skill) => (
                        <button
                          key={skill.id}
                          className="skill-btn"
                          onClick={() =>
                            setBattleState((prev) => ({
                              ...prev,
                              selectedSkill: skill,
                            }))
                          }
                          disabled={
                            playerCharacters[currentPlayerIndex].mp <
                            skill.mpCost
                          }
                        >
                          <div className="skill-name">{skill.name}</div>
                          <div className="skill-info">
                            MP: {skill.mpCost} | {skill.description}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                  <button
                    className="action-btn"
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: null,
                        selectedSkill: null,
                      }))
                    }
                  >
                    ← Back to Actions
                  </button>
                </>
              )}

              {(battleState.selectedAction === "attack" ||
                battleState.selectedSkill) && (
                <>
                  <div className="targets-section">
                    <div className="targets-title">🎯 Select Target</div>
                    <div className="target-buttons">
                      {ENEMY_TYPES.filter(
                        (e) => e.id === battleState.selectedEnemy
                      ).map((enemy) => (
                        <button key={enemy.id} className="target-btn">
                          {enemy.icon} {enemy.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    className="execute-btn"
                    onClick={() => {
                      // Execute action
                      const currentChar = playerCharacters[currentPlayerIndex];
                      const actionText =
                        battleState.selectedAction === "attack"
                          ? `${currentChar.name} attacks ${
                              ENEMY_TYPES.find(
                                (e) => e.id === battleState.selectedEnemy
                              )?.name
                            }!`
                          : battleState.selectedSkill
                          ? `${currentChar.name} uses ${battleState.selectedSkill.name}!`
                          : `${currentChar.name} defends!`;

                      setBattleState((prev) => ({
                        ...prev,
                        battleLog: [...prev.battleLog, actionText],
                        selectedAction: null,
                        selectedSkill: null,
                        turn: "enemy",
                        turnCount: prev.turnCount + 1,
                        isProcessing: true,
                      }));

                      // Simulate enemy turn after delay
                      setTimeout(() => {
                        const enemyAction = `${
                          ENEMY_TYPES.find(
                            (e) => e.id === battleState.selectedEnemy
                          )?.name
                        } attacks ${currentChar.name}!`;
                        setBattleState((prev) => ({
                          ...prev,
                          battleLog: [...prev.battleLog, enemyAction],
                          turn: "player",
                          isProcessing: false,
                        }));
                      }, 2000);
                    }}
                  >
                    ⚡ Execute Action
                  </button>

                  <button
                    className="action-btn"
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: null,
                        selectedSkill: null,
                      }))
                    }
                  >
                    ← Back to Actions
                  </button>
                </>
              )}
            </>
          )}

          {battleState.turn === "enemy" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "18px", marginBottom: "10px" }}>
                ⚔️ Enemy Turn
              </div>
              <div style={{ fontSize: "14px", opacity: "0.8" }}>
                The enemy is thinking...
              </div>
            </div>
          )}

          {battleState.isProcessing && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "18px", marginBottom: "10px" }}>
                ⚡ Processing...
              </div>
              <div style={{ fontSize: "14px", opacity: "0.8" }}>
                Action in progress...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle End Modal */}
      {(battleState.phase === "victory" || battleState.phase === "defeat") && (
        <div className="battle-end">
          <div className="battle-end-content">
            <div
              className={`battle-end-title ${
                battleState.phase === "victory" ? "victory" : "defeat"
              }`}
            >
              {battleState.phase === "victory" ? "🎉 Victory!" : "💀 Defeat!"}
            </div>
            <p>
              {battleState.phase === "victory"
                ? "Congratulations! You have defeated your enemies!"
                : "Your team has been defeated. Better luck next time!"}
            </p>
            <button
              className="battle-end-btn"
              onClick={() =>
                setBattleState((prev) => ({
                  ...prev,
                  phase: "character_selection",
                }))
              }
            >
              Return to Character Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
