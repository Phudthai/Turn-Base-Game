import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CharacterSelectionScreen } from "./CharacterSelectionScreen";
import { inventoryAPI, battleAPI } from "../../services/api";
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
  skills?: CharacterSkill[]; // Add skills field
}

interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  damage?: number;
  manaCost?: number;
  cooldown?: number;
  type?: "attack" | "heal" | "buff" | "debuff";
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
  critRate: number;
  critDamage: number;
  skills: BattleSkill[];
  isPlayer: boolean;
  isAlive: boolean;
  statusEffects: StatusEffect[];
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
  cooldown: number;
  currentCooldown: number;
}

interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  duration: number;
  effect: {
    attack?: number;
    defense?: number;
    speed?: number;
  };
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
  selectedTarget: BattleCharacter | null;
  battleLog: string[];
  isProcessing: boolean;
  selectedDifficulty: "easy" | "normal" | "hard" | "nightmare";
  selectedEnemy: string;
  enemyCharacters: BattleCharacter[];
  currentPlayerIndex: number;
  currentEnemyIndex: number;
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
    critRate: 5,
    critDamage: 150,
    icon: "👹",
    description: "A fierce goblin warrior with basic combat skills",
    skills: [
      {
        id: "goblin_attack",
        name: "⚔️ Goblin Strike",
        mpCost: 5,
        damage: 15,
        type: "attack",
        description: "Basic goblin attack",
        cooldown: 0,
      },
      {
        id: "goblin_rage",
        name: "😤 Goblin Rage",
        mpCost: 15,
        damage: 25,
        type: "attack",
        description: "Powerful rage attack",
        cooldown: 2,
      },
    ],
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
    critRate: 8,
    critDamage: 160,
    icon: "🧌",
    description: "A powerful orc that uses dark magic",
    skills: [
      {
        id: "orc_attack",
        name: "⚔️ Orc Smash",
        mpCost: 8,
        damage: 20,
        type: "attack",
        description: "Heavy orc attack",
        cooldown: 0,
      },
      {
        id: "dark_magic",
        name: "🔮 Dark Magic",
        mpCost: 20,
        damage: 35,
        type: "attack",
        description: "Powerful dark magic",
        cooldown: 3,
      },
      {
        id: "orc_heal",
        name: "💚 Orc Healing",
        mpCost: 25,
        damage: -30,
        type: "heal",
        description: "Restore HP",
        cooldown: 4,
      },
    ],
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
    critRate: 10,
    critDamage: 170,
    icon: "💀",
    description: "An armored undead warrior with high defense",
    skills: [
      {
        id: "undead_attack",
        name: "⚔️ Death Strike",
        mpCost: 10,
        damage: 25,
        type: "attack",
        description: "Deadly undead strike",
        cooldown: 0,
      },
      {
        id: "soul_drain",
        name: "👻 Soul Drain",
        mpCost: 30,
        damage: 40,
        type: "attack",
        description: "Drain life from enemy",
        cooldown: 3,
      },
      {
        id: "undead_defense",
        name: "🛡️ Undead Armor",
        mpCost: 15,
        damage: 0,
        type: "buff",
        description: "Increase defense",
        cooldown: 2,
      },
    ],
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
  const { user, token } = useAuth();

  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>(
    []
  );
  const [playerCharacters, setPlayerCharacters] = useState<BattleCharacter[]>(
    []
  );

  const [battleState, setBattleState] = useState<BattleState>({
    phase: "character_selection",
    turn: "player",
    turnCount: 1,
    selectedAction: null,
    selectedSkill: null,
    selectedTarget: null,
    battleLog: ["⚔️ Battle begins!"],
    isProcessing: false,
    selectedDifficulty: "normal",
    selectedEnemy: "goblin",
    enemyCharacters: [],
    currentPlayerIndex: 0,
    currentEnemyIndex: 0,
  });

  // Load character details with skills
  const loadCharacterDetails = async (
    characterIds: string[]
  ): Promise<UserCharacter[]> => {
    if (!token) throw new Error("No token available");

    const detailedCharacters: UserCharacter[] = [];

    for (const characterId of characterIds) {
      try {
        const response = await inventoryAPI.getCharacterDetail(
          token,
          characterId
        );
        if (response && response.character) {
          const char = response.character;
          detailedCharacters.push({
            id: char.id,
            characterId: char.characterId,
            name: char.name,
            level: char.level,
            rarity: char.rarity,
            currentStats: char.currentStats,
            powerLevel: char.powerLevel,
            isLocked: char.metadata?.isLocked || false,
            isFavorite: char.metadata?.isFavorite || false,
            artwork: char.artwork,
            skills: char.skills || [], // Include skills from database
          });
        }
      } catch (error) {
        console.error(
          `Failed to load character details for ${characterId}:`,
          error
        );
        // Fallback to basic character data
        const basicChar = selectedCharacters.find((c) => c.id === characterId);
        if (basicChar) {
          detailedCharacters.push(basicChar);
        }
      }
    }

    return detailedCharacters;
  };

  // Convert UserCharacter to BattleCharacter with real skills
  const convertToBattleCharacter = (
    userChar: UserCharacter,
    index: number
  ): BattleCharacter => {
    const baseHp = userChar.currentStats.hp;
    const baseMp = Math.floor(baseHp * 0.5);

    // Convert database skills to battle skills
    const battleSkills: BattleSkill[] = [];

    // Add default basic attack
    battleSkills.push({
      id: "basic_attack",
      name: "⚔️ Strike",
      mpCost: 5,
      damage: Math.floor(userChar.currentStats.attack * 0.8),
      type: "attack",
      description: "Basic attack",
      cooldown: 0,
      currentCooldown: 0,
    });

    // Add skills from database
    if (userChar.skills && userChar.skills.length > 0) {
      userChar.skills.forEach((skill) => {
        const skillType =
          (skill.type as "attack" | "heal" | "buff" | "debuff") || "attack";
        battleSkills.push({
          id: skill.id,
          name: skill.name,
          mpCost: skill.manaCost || 10,
          damage:
            skill.damage || Math.floor(userChar.currentStats.attack * 1.0),
          type: skillType,
          description: skill.description,
          cooldown: skill.cooldown || 0,
          currentCooldown: 0,
        });
      });
    } else {
      // Fallback skills if no skills in database
      battleSkills.push(
        {
          id: "power_strike",
          name: "💥 Power Strike",
          mpCost: 15,
          damage: Math.floor(userChar.currentStats.attack * 1.2),
          type: "attack",
          description: "Powerful attack",
          cooldown: 1,
          currentCooldown: 0,
        },
        {
          id: "heal",
          name: "💚 Heal",
          mpCost: 20,
          damage: -Math.floor(baseHp * 0.3),
          type: "heal",
          description: "Restore HP",
          cooldown: 2,
          currentCooldown: 0,
        }
      );
    }

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
      critRate: userChar.currentStats.critRate,
      critDamage: userChar.currentStats.critDamage,
      skills: battleSkills,
      isPlayer: true,
      isAlive: true,
      statusEffects: [],
      artwork: userChar.artwork,
    };
  };

  // Create enemy battle characters
  const createEnemyCharacters = (): BattleCharacter[] => {
    const selectedEnemyData = ENEMY_TYPES.find(
      (e) => e.id === battleState.selectedEnemy
    );
    const difficultyData = DIFFICULTY_SETTINGS[battleState.selectedDifficulty];

    if (!selectedEnemyData) return [];

    const enemy = selectedEnemyData;
    const multiplier = difficultyData.multiplier;

    return [
      {
        id: `enemy_${enemy.id}`,
        name: enemy.name,
        level: Math.round(enemy.level * multiplier),
        hp: Math.round(enemy.hp * multiplier),
        maxHp: Math.round(enemy.hp * multiplier),
        mp: Math.round(enemy.mp * multiplier),
        maxMp: Math.round(enemy.mp * multiplier),
        attack: Math.round(enemy.attack * multiplier),
        defense: Math.round(enemy.defense * multiplier),
        speed: Math.round(enemy.speed * multiplier),
        critRate: enemy.critRate,
        critDamage: enemy.critDamage,
        skills: enemy.skills.map((skill) => ({
          ...skill,
          currentCooldown: 0,
        })),
        isPlayer: false,
        isAlive: true,
        statusEffects: [],
        artwork: { icon: enemy.icon, thumbnail: enemy.icon },
      },
    ];
  };

  // Handle character selection completion
  const handleCharacterSelection = async (characters: UserCharacter[]) => {
    setSelectedCharacters(characters);

    try {
      // Load detailed character data with skills
      const detailedCharacters = await loadCharacterDetails(
        characters.map((c) => c.id)
      );

      // Convert to battle characters
      const battleChars = detailedCharacters.map((char, index) =>
        convertToBattleCharacter(char, index)
      );
      setPlayerCharacters(battleChars);

      // Create enemy characters
      const enemyChars = createEnemyCharacters();

      // Move to preparation phase
      setBattleState((prev) => ({
        ...prev,
        phase: "preparation",
        enemyCharacters: enemyChars,
      }));
    } catch (error) {
      console.error("Failed to load character details:", error);
      // Fallback to basic conversion
      const battleChars = characters.map((char, index) =>
        convertToBattleCharacter(char, index)
      );
      setPlayerCharacters(battleChars);

      const enemyChars = createEnemyCharacters();
      setBattleState((prev) => ({
        ...prev,
        phase: "preparation",
        enemyCharacters: enemyChars,
      }));
    }
  };

  // Battle logic functions
  const calculateDamage = (
    attacker: BattleCharacter,
    defender: BattleCharacter,
    skill: BattleSkill
  ): number => {
    let baseDamage = skill.damage;

    // Apply attack/defense calculation
    if (skill.type === "attack") {
      baseDamage = Math.max(1, attacker.attack - defender.defense * 0.5);
    }

    // Apply critical hit
    const critRoll = Math.random() * 100;
    if (critRoll < attacker.critRate) {
      baseDamage = Math.floor(baseDamage * (attacker.critDamage / 100));
    }

    // Add some randomness (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    return Math.max(1, Math.floor(baseDamage * variance));
  };

  const applyDamage = (
    target: BattleCharacter,
    damage: number,
    isHeal: boolean = false
  ): void => {
    if (isHeal) {
      target.hp = Math.min(target.maxHp, target.hp - damage); // damage is negative for heal
    } else {
      target.hp = Math.max(0, target.hp - damage);
    }

    // Check if character died
    if (target.hp <= 0) {
      target.isAlive = false;
      target.hp = 0;
    }
  };

  const consumeMp = (character: BattleCharacter, mpCost: number): boolean => {
    if (character.mp < mpCost) return false;
    character.mp -= mpCost;
    return true;
  };

  const updateCooldowns = (character: BattleCharacter): void => {
    character.skills.forEach((skill) => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  };

  const checkBattleEnd = (): "victory" | "defeat" | null => {
    const playerAlive = playerCharacters.some((char) => char.isAlive);
    const enemyAlive = battleState.enemyCharacters.some((char) => char.isAlive);

    if (!playerAlive) return "defeat";
    if (!enemyAlive) return "victory";
    return null;
  };

  const getNextAliveCharacter = (
    characters: BattleCharacter[],
    currentIndex: number
  ): number => {
    let nextIndex = (currentIndex + 1) % characters.length;
    let attempts = 0;

    while (!characters[nextIndex].isAlive && attempts < characters.length) {
      nextIndex = (nextIndex + 1) % characters.length;
      attempts++;
    }

    return characters[nextIndex].isAlive ? nextIndex : currentIndex;
  };

  const executePlayerAction = async () => {
    const currentChar = playerCharacters[battleState.currentPlayerIndex];
    const target = battleState.selectedTarget;

    if (!currentChar || !target || !currentChar.isAlive) return;

    let actionText = "";
    let damage = 0;

    if (battleState.selectedAction === "attack") {
      // Basic attack
      damage = calculateDamage(currentChar, target, {
        id: "basic_attack",
        name: "Basic Attack",
        mpCost: 0,
        damage: currentChar.attack,
        type: "attack",
        description: "Basic attack",
        cooldown: 0,
        currentCooldown: 0,
      });

      applyDamage(target, damage);
      actionText = `${currentChar.name} attacks ${target.name} for ${damage} damage!`;
    } else if (battleState.selectedSkill) {
      const skill = battleState.selectedSkill;

      // Check MP and cooldown
      if (currentChar.mp < skill.mpCost) {
        actionText = `${currentChar.name} doesn't have enough MP!`;
      } else if (skill.currentCooldown > 0) {
        actionText = `${skill.name} is on cooldown!`;
      } else {
        // Execute skill
        if (!consumeMp(currentChar, skill.mpCost)) {
          actionText = `${currentChar.name} doesn't have enough MP!`;
        } else {
          damage = calculateDamage(currentChar, target, skill);

          if (skill.type === "heal") {
            applyDamage(target, damage, true); // damage is negative for heal
            actionText = `${currentChar.name} uses ${skill.name} and heals ${
              target.name
            } for ${-damage} HP!`;
          } else {
            applyDamage(target, damage);
            actionText = `${currentChar.name} uses ${skill.name} and deals ${damage} damage to ${target.name}!`;
          }

          // Set cooldown
          skill.currentCooldown = skill.cooldown;
        }
      }
    }

    // Update battle log
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, actionText],
      selectedAction: null,
      selectedSkill: null,
      selectedTarget: null,
      isProcessing: true,
    }));

    // Check for battle end
    const battleResult = checkBattleEnd();
    if (battleResult) {
      setTimeout(() => {
        setBattleState((prev) => ({
          ...prev,
          phase: battleResult,
          isProcessing: false,
        }));
      }, 1000);
      return;
    }

    // Switch to enemy turn
    setTimeout(() => {
      executeEnemyTurn();
    }, 1000);
  };

  const executeEnemyTurn = () => {
    const currentEnemy =
      battleState.enemyCharacters[battleState.currentEnemyIndex];

    if (!currentEnemy || !currentEnemy.isAlive) {
      // Move to next enemy
      const nextEnemyIndex = getNextAliveCharacter(
        battleState.enemyCharacters,
        battleState.currentEnemyIndex
      );
      setBattleState((prev) => ({
        ...prev,
        currentEnemyIndex: nextEnemyIndex,
        turn: "player",
        turnCount: prev.turnCount + 1,
        isProcessing: false,
      }));
      return;
    }

    // Simple AI: choose random skill or basic attack
    const availableSkills = currentEnemy.skills.filter(
      (skill) => currentEnemy.mp >= skill.mpCost && skill.currentCooldown === 0
    );

    let actionText = "";
    let damage = 0;

    if (availableSkills.length > 0 && Math.random() > 0.3) {
      // Use skill
      const skill =
        availableSkills[Math.floor(Math.random() * availableSkills.length)];
      const target =
        playerCharacters[Math.floor(Math.random() * playerCharacters.length)];

      if (target && target.isAlive) {
        consumeMp(currentEnemy, skill.mpCost);
        damage = calculateDamage(currentEnemy, target, skill);

        if (skill.type === "heal") {
          applyDamage(target, damage, true);
          actionText = `${currentEnemy.name} uses ${
            skill.name
          } and heals for ${-damage} HP!`;
        } else {
          applyDamage(target, damage);
          actionText = `${currentEnemy.name} uses ${skill.name} and deals ${damage} damage to ${target.name}!`;
        }

        skill.currentCooldown = skill.cooldown;
      }
    } else {
      // Basic attack
      const target =
        playerCharacters[Math.floor(Math.random() * playerCharacters.length)];

      if (target && target.isAlive) {
        damage = calculateDamage(currentEnemy, target, {
          id: "basic_attack",
          name: "Basic Attack",
          mpCost: 0,
          damage: currentEnemy.attack,
          type: "attack",
          description: "Basic attack",
          cooldown: 0,
          currentCooldown: 0,
        });

        applyDamage(target, damage);
        actionText = `${currentEnemy.name} attacks ${target.name} for ${damage} damage!`;
      }
    }

    // Update battle log and switch turns
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, actionText],
      turn: "player",
      turnCount: prev.turnCount + 1,
      isProcessing: false,
    }));

    // Check for battle end
    const battleResult = checkBattleEnd();
    if (battleResult) {
      setTimeout(() => {
        setBattleState((prev) => ({
          ...prev,
          phase: battleResult,
        }));
      }, 1000);
    }
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
          <div className="header-content">
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
                        enemyCharacters: createEnemyCharacters(),
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
                        enemyCharacters: createEnemyCharacters(),
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
                        index === battleState.currentPlayerIndex ? "active" : ""
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
                  {battleState.enemyCharacters.map((enemy, index) => (
                    <div
                      key={enemy.id}
                      className={`formation-slot enemy-slot ${
                        index === battleState.currentEnemyIndex ? "active" : ""
                      }`}
                    >
                      <div className="character-avatar">
                        {enemy.artwork?.icon}
                      </div>
                      <div className="character-name">{enemy.name}</div>
                      <div className="character-level">Level {enemy.level}</div>
                      <div className="character-stats-mini">
                        <div className="mini-stat">
                          <span>HP</span>
                          <span>{enemy.maxHp}</span>
                        </div>
                        <div className="mini-stat">
                          <span>ATK</span>
                          <span>{enemy.attack}</span>
                        </div>
                        <div className="mini-stat">
                          <span>DEF</span>
                          <span>{enemy.defense}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Battle Phase
  return (
    <div className="battle-screen">
      <div className="battle-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() =>
              setBattleState((prev) => ({ ...prev, phase: "preparation" }))
            }
          >
            ← Back to Preparation
          </button>

          <div className="header-center">
            <h1 className="battle-title">⚔️ Battle</h1>
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
                      index === battleState.currentPlayerIndex &&
                      battleState.turn === "player"
                        ? "active"
                        : ""
                    } ${!character.isAlive ? "dead" : ""}`}
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
                {battleState.enemyCharacters.map((enemy, index) => (
                  <div
                    key={enemy.id}
                    className={`battle-character ${
                      index === battleState.currentEnemyIndex &&
                      battleState.turn === "enemy"
                        ? "active"
                        : ""
                    } ${!enemy.isAlive ? "dead" : ""}`}
                  >
                    <div className="character-header">
                      <div className="character-avatar">
                        {enemy.artwork?.icon}
                      </div>
                      <div className="character-info">
                        <div className="character-name">{enemy.name}</div>
                        <div className="character-level">
                          Level {enemy.level}
                        </div>
                      </div>
                    </div>

                    <div className="health-bar-container">
                      <div className="health-bar">
                        <div
                          className="health-fill"
                          style={{
                            width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="bar-text">
                        HP: {enemy.hp}/{enemy.maxHp}
                      </div>
                    </div>

                    <div className="mana-bar">
                      <div
                        className="mana-fill"
                        style={{
                          width: `${(enemy.mp / enemy.maxMp) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="bar-text">
                      MP: {enemy.mp}/{enemy.maxMp}
                    </div>

                    <div className="character-stats">
                      <div className="stat-item">ATK: {enemy.attack}</div>
                      <div className="stat-item">DEF: {enemy.defense}</div>
                      <div className="stat-item">SPD: {enemy.speed}</div>
                      <div className="stat-item">
                        ⚡{" "}
                        {Math.floor(
                          (enemy.hp + enemy.attack + enemy.defense) / 3
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* Turn Indicators */}
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
                    disabled={
                      !playerCharacters[battleState.currentPlayerIndex]?.isAlive
                    }
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
                    disabled={
                      !playerCharacters[battleState.currentPlayerIndex]?.isAlive
                    }
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
                    disabled={
                      !playerCharacters[battleState.currentPlayerIndex]?.isAlive
                    }
                  >
                    🛡️ Defend
                  </button>
                </div>
              )}

              {battleState.selectedAction === "skill" && (
                <>
                  <div className="skills-list">
                    {playerCharacters[
                      battleState.currentPlayerIndex
                    ]?.skills.map((skill) => (
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
                          playerCharacters[battleState.currentPlayerIndex].mp <
                            skill.mpCost || skill.currentCooldown > 0
                        }
                      >
                        <div className="skill-name">{skill.name}</div>
                        <div className="skill-info">
                          MP: {skill.mpCost} | {skill.description}
                          {skill.currentCooldown > 0 &&
                            ` (CD: ${skill.currentCooldown})`}
                        </div>
                      </button>
                    ))}
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
                      {battleState.enemyCharacters
                        .filter((enemy) => enemy.isAlive)
                        .map((enemy) => (
                          <button
                            key={enemy.id}
                            className={`target-btn ${
                              battleState.selectedTarget?.id === enemy.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setBattleState((prev) => ({
                                ...prev,
                                selectedTarget: enemy,
                              }))
                            }
                          >
                            {enemy.artwork?.icon} {enemy.name} (HP: {enemy.hp})
                          </button>
                        ))}
                    </div>
                  </div>

                  <button
                    className="execute-btn"
                    onClick={executePlayerAction}
                    disabled={!battleState.selectedTarget}
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
                        selectedTarget: null,
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
