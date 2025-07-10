import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { CharacterSelectionScreen } from "./CharacterSelectionScreen";
import { inventoryAPI, battleAPI } from "../services/api";
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

// Add Battle Rewards interfaces
interface BattleReward {
  type: "exp" | "gold" | "item" | "character_exp";
  amount: number;
  characterId?: string; // For character-specific EXP
  item?: {
    id: string;
    name: string;
    icon: string;
    rarity: "R" | "SR" | "SSR";
  };
}

interface BattleResult {
  victory: boolean;
  rewards: BattleReward[];
  totalExp: number;
  totalGold: number;
  characterExpGains: {
    characterId: string;
    expGained: number;
    leveledUp: boolean;
  }[];
}

interface EnemyType {
  id: string;
  name: string;
  icon: string;
  level: number;
  description: string;
  hp: number;
  mp?: number;
  attack: number;
  defense: number;
  speed: number;
  critRate?: number;
  critDamage?: number;
  skills?: BattleSkill[];
}

interface DifficultySettings {
  id: string;
  name: string;
  multiplier: number;
  rewards: number;
  description: string;
  color: string;
}

interface BattleState {
  phase:
    | "character_selection"
    | "preparation"
    | "battle"
    | "victory"
    | "defeat"
    | "rewards"; // Add rewards phase
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
  currentTurnOrderIndex: number; // Add this for speed-based turns
  turnOrder: (BattleCharacter & { isPlayer: boolean; originalIndex: number })[]; // Add this
  battleResult?: BattleResult; // Add battle result

  // Add backend integration fields
  backendBattleId?: string;
  backendBattleState?: any;
  isConnectedToBackend: boolean;

  // API data
  availableEnemies: EnemyType[];
  difficultySettings: DifficultySettings[];
  loadingBattleData: boolean;
}

export function BattleScreen({ onBack }: BattleScreenProps) {
  const { user, token } = useAuth();

  const [selectedCharacters, setSelectedCharacters] = useState<UserCharacter[]>(
    []
  );
  const [originalSelectedCharacters, setOriginalSelectedCharacters] = useState<
    UserCharacter[]
  >([]);
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
    selectedEnemy: "char_ssr_001", // Use character format instead of "goblin"
    enemyCharacters: [],
    currentPlayerIndex: 0,
    currentEnemyIndex: 0,
    currentTurnOrderIndex: 0, // Add this for speed-based turns
    turnOrder: [], // Add this
    isConnectedToBackend: true, // Always use backend - no toggle
    availableEnemies: [],
    difficultySettings: [],
    loadingBattleData: false,
  });

  // Load battle data from API
  useEffect(() => {
    loadBattleData();
  }, []);

  const loadBattleData = async () => {
    setBattleState((prev) => ({ ...prev, loadingBattleData: true }));

    try {
      console.log("🔄 Loading battle data...");

      const [enemiesResponse, difficultiesResponse] = await Promise.all([
        battleAPI.getAvailableEnemies(),
        battleAPI.getDifficultySettings(),
      ]);

      console.log("🎯 Enemies response:", enemiesResponse);
      console.log("🎯 Difficulties response:", difficultiesResponse);

      if (enemiesResponse.success && difficultiesResponse.success) {
        console.log("✅ Setting battle data:", {
          enemies: enemiesResponse.data,
          difficulties: difficultiesResponse.data,
          selectedEnemy: enemiesResponse.data[0]?.id || "goblin",
        });

        setBattleState((prev) => ({
          ...prev,
          availableEnemies: enemiesResponse.data,
          difficultySettings: difficultiesResponse.data,
          selectedEnemy: enemiesResponse.data[0]?.id || "char_ssr_001",
        }));
      } else {
        console.error("❌ API responses not successful:", {
          enemiesSuccess: enemiesResponse.success,
          difficultiesSuccess: difficultiesResponse.success,
        });
      }
    } catch (error) {
      console.error("❌ Failed to load battle data:", error);
    } finally {
      setBattleState((prev) => ({ ...prev, loadingBattleData: false }));
    }
  };

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
      mpCost: 0, // No mana cost
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
          mpCost: 0, // No mana cost
          damage:
            skill.damage || Math.floor(userChar.currentStats.attack * 1.0),
          type: skillType,
          description: skill.description,
          cooldown: skill.cooldown || 1, // Default cooldown of 1 if not specified
          currentCooldown: 0,
        });
      });
    } else {
      // Fallback skills if no skills in database
      battleSkills.push(
        {
          id: "power_strike",
          name: "💥 Power Strike",
          mpCost: 0, // No mana cost
          damage: Math.floor(userChar.currentStats.attack * 1.2),
          type: "attack",
          description: "Powerful attack",
          cooldown: 2,
          currentCooldown: 0,
        },
        {
          id: "heal",
          name: "💚 Heal",
          mpCost: 0, // No mana cost
          damage: -Math.floor(baseHp * 0.3),
          type: "heal",
          description: "Restore HP",
          cooldown: 3,
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

  // Add back reward calculation data
  const REWARD_BASE = {
    goblin: { exp: 50, gold: 25 },
    orc: { exp: 80, gold: 40 },
    undead: { exp: 120, gold: 60 },
  };

  // Create enemy battle characters
  const createEnemyCharacters = (): BattleCharacter[] => {
    const selectedEnemyData = battleState.availableEnemies.find(
      (e) => e.id === battleState.selectedEnemy
    );
    const difficultyData = battleState.difficultySettings.find(
      (d) => d.id === battleState.selectedDifficulty
    );

    if (!selectedEnemyData || !difficultyData) return [];

    const enemy = selectedEnemyData;
    const multiplier = difficultyData.multiplier;

    return [
      {
        id: `enemy_${enemy.id}`,
        name: enemy.name,
        level: Math.round(enemy.level * multiplier),
        hp: Math.round(enemy.hp * multiplier),
        maxHp: Math.round(enemy.hp * multiplier),
        mp: Math.round((enemy.mp || 50) * multiplier),
        maxMp: Math.round((enemy.mp || 50) * multiplier),
        attack: Math.round(enemy.attack * multiplier),
        defense: Math.round(enemy.defense * multiplier),
        speed: Math.round(enemy.speed * multiplier),
        critRate: enemy.critRate || 8,
        critDamage: enemy.critDamage || 130,
        skills: enemy.skills || [
          {
            id: "basic_attack",
            name: "⚔️ Strike",
            mpCost: 0,
            damage: Math.floor(enemy.attack * 0.8),
            type: "attack",
            description: "Basic attack",
            cooldown: 0,
            currentCooldown: 0,
          },
        ],
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
    setOriginalSelectedCharacters(characters); // Store original selected characters

    try {
      // Load detailed character data with skills (for both modes)
      const detailedCharacters = await loadCharacterDetails(
        characters.map((c) => c.id)
      );

      // Convert to battle characters
      const battleChars = detailedCharacters.map((char, index) =>
        convertToBattleCharacter(char, index)
      );
      setPlayerCharacters(battleChars);

      // Create enemy characters (for display purposes)
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

  // Initialize turn order when battle starts
  useEffect(() => {
    if (battleState.phase === "battle" && battleState.turnOrder.length === 0) {
      initializeTurnOrder();
    }
  }, [battleState.phase]);

  // Handle automatic player action execution when target is selected
  useEffect(() => {
    if (
      battleState.phase === "battle" &&
      battleState.turn === "player" &&
      battleState.isProcessing &&
      battleState.selectedTarget &&
      (battleState.selectedAction || battleState.selectedSkill)
    ) {
      console.log("🎯 Auto-executing player action via useEffect");
      executePlayerAction();
    }
  }, [battleState.selectedTarget, battleState.isProcessing]);

  // Handle automatic enemy turns
  useEffect(() => {
    if (
      battleState.phase === "battle" &&
      battleState.turn === "enemy" &&
      !battleState.isProcessing &&
      battleState.turnOrder.length > 0
    ) {
      const timer = setTimeout(() => {
        executeEnemyTurn();
      }, 1500); // Delay for enemy turn

      return () => clearTimeout(timer);
    }
  }, [
    battleState.turn,
    battleState.isProcessing,
    battleState.currentTurnOrderIndex,
  ]);

  // Battle logic functions
  const calculateTurnOrder = (): (BattleCharacter & {
    isPlayer: boolean;
    originalIndex: number;
  })[] => {
    const allCharacters: (BattleCharacter & {
      isPlayer: boolean;
      originalIndex: number;
    })[] = [];

    // Add player characters
    playerCharacters.forEach((char, index) => {
      if (char.isAlive) {
        allCharacters.push({
          ...char,
          isPlayer: true,
          originalIndex: index,
        });
      }
    });

    // Add enemy characters
    battleState.enemyCharacters.forEach((char, index) => {
      if (char.isAlive) {
        allCharacters.push({
          ...char,
          isPlayer: false,
          originalIndex: index,
        });
      }
    });

    // Sort by speed (highest first), then by player priority, then by original index
    return allCharacters.sort((a, b) => {
      // First priority: Speed (highest first)
      if (b.speed !== a.speed) {
        return b.speed - a.speed;
      }

      // Second priority: Players go before enemies when speed is equal
      if (a.isPlayer !== b.isPlayer) {
        return a.isPlayer ? -1 : 1; // Players (-1) come before enemies (1)
      }

      // Third priority: Original index (lower index first)
      return a.originalIndex - b.originalIndex;
    });
  };

  const getCurrentTurnOrderIndex = (): number => {
    return battleState.currentTurnOrderIndex;
  };

  const getCurrentTurnCharacter = ():
    | (BattleCharacter & { isPlayer: boolean; originalIndex: number })
    | null => {
    const turnOrder = calculateTurnOrder();
    return turnOrder[battleState.currentTurnOrderIndex] || null;
  };

  const getNextTurnCharacter = ():
    | (BattleCharacter & { isPlayer: boolean; originalIndex: number })
    | null => {
    const turnOrder = calculateTurnOrder();
    const nextIndex =
      (battleState.currentTurnOrderIndex + 1) % turnOrder.length;
    return turnOrder[nextIndex] || null;
  };

  const initializeTurnOrder = () => {
    const newTurnOrder = calculateTurnOrder();
    setBattleState((prev) => ({
      ...prev,
      turnOrder: newTurnOrder,
      currentTurnOrderIndex: 0,
      turn: newTurnOrder[0]?.isPlayer ? "player" : "enemy",
      currentPlayerIndex: newTurnOrder[0]?.isPlayer
        ? newTurnOrder[0].originalIndex
        : prev.currentPlayerIndex,
      currentEnemyIndex: !newTurnOrder[0]?.isPlayer
        ? newTurnOrder[0].originalIndex
        : prev.currentEnemyIndex,
    }));
  };

  const advanceToNextTurn = () => {
    console.log("🔄 advanceToNextTurn called");
    const turnOrder = calculateTurnOrder();
    let nextIndex = (battleState.currentTurnOrderIndex + 1) % turnOrder.length;

    console.log(
      "🔄 Turn order:",
      turnOrder.map((c) => ({
        name: c.name,
        isPlayer: c.isPlayer,
        isAlive: c.isAlive,
      }))
    );
    console.log(
      "🔄 Current index:",
      battleState.currentTurnOrderIndex,
      "Next index:",
      nextIndex
    );

    // Skip dead characters
    let attempts = 0;
    while (attempts < turnOrder.length && !turnOrder[nextIndex]?.isAlive) {
      nextIndex = (nextIndex + 1) % turnOrder.length;
      attempts++;
    }

    if (attempts >= turnOrder.length) {
      console.log("🔄 No alive characters, ending battle");
      // No alive characters, end battle
      const battleResult = checkBattleEnd();
      if (battleResult) {
        setBattleState((prev) => ({
          ...prev,
          phase: battleResult,
        }));
      }
      return;
    }

    const nextChar = turnOrder[nextIndex];
    console.log(
      "🔄 Next character:",
      nextChar.name,
      "isPlayer:",
      nextChar.isPlayer
    );

    // Update cooldowns for all characters
    [...playerCharacters, ...battleState.enemyCharacters].forEach((char) => {
      updateCooldowns(char);
    });

    console.log("🔄 Setting new battle state");
    setBattleState((prev) => ({
      ...prev,
      currentTurnOrderIndex: nextIndex,
      turn: nextChar.isPlayer ? "player" : "enemy",
      currentPlayerIndex: nextChar.isPlayer
        ? nextChar.originalIndex
        : prev.currentPlayerIndex,
      currentEnemyIndex: !nextChar.isPlayer
        ? nextChar.originalIndex
        : prev.currentEnemyIndex,
      turnCount: nextIndex === 0 ? prev.turnCount + 1 : prev.turnCount, // Increment when we complete a full cycle
      isProcessing: false,
    }));
    console.log("🔄 advanceToNextTurn completed");
  };

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

  const updateCooldowns = (character: BattleCharacter): void => {
    character.skills.forEach((skill) => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  };

  const checkBattleEnd = (
    updatedPlayerChars?: BattleCharacter[],
    updatedEnemyChars?: BattleCharacter[]
  ): "victory" | "defeat" | null => {
    const playersToCheck = updatedPlayerChars || playerCharacters;
    const enemiesToCheck = updatedEnemyChars || battleState.enemyCharacters;

    const playerAlive = playersToCheck.some((char) => char.isAlive);
    const enemyAlive = enemiesToCheck.some((char) => char.isAlive);

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

  // Add battle rewards calculation function
  const calculateBattleRewards = (victory: boolean): BattleResult => {
    if (!victory) {
      return {
        victory: false,
        rewards: [
          { type: "exp", amount: 10 },
          { type: "gold", amount: 5 },
        ],
        totalExp: 10,
        totalGold: 5,
        characterExpGains: [],
      };
    }

    const baseRewards = REWARD_BASE[
      battleState.selectedEnemy as keyof typeof REWARD_BASE
    ] || { exp: 50, gold: 25 };
    const difficultyData = battleState.difficultySettings.find(
      (d) => d.id === battleState.selectedDifficulty
    );
    const difficultyMultiplier = difficultyData?.rewards || 1;

    const totalExp = Math.floor(baseRewards.exp * difficultyMultiplier);
    const totalGold = Math.floor(baseRewards.gold * difficultyMultiplier);

    // Calculate individual character EXP (split among alive characters)
    const alivePlayerCharacters = playerCharacters.filter(
      (char) => char.isAlive
    );
    const expPerCharacter = Math.floor(
      totalExp / Math.max(alivePlayerCharacters.length, 1)
    );

    const rewards: BattleReward[] = [
      { type: "exp", amount: totalExp },
      { type: "gold", amount: totalGold },
    ];

    // Add individual character EXP
    const characterExpGains = alivePlayerCharacters.map((char) => {
      rewards.push({
        type: "character_exp",
        amount: expPerCharacter,
        characterId: char.id,
      });

      return {
        characterId: char.id,
        expGained: expPerCharacter,
        leveledUp: false, // TODO: Calculate based on current EXP
      };
    });

    // Random item drop (30% chance)
    if (Math.random() < 0.3) {
      const rarityRoll = Math.random();
      let rarity: "R" | "SR" | "SSR";

      if (rarityRoll < 0.1) rarity = "SSR";
      else if (rarityRoll < 0.3) rarity = "SR";
      else rarity = "R";

      rewards.push({
        type: "item",
        amount: 1,
        item: {
          id: `${battleState.selectedEnemy}_drop_${Date.now()}`,
          name: `${rarity} Battle Essence`,
          icon: rarity === "SSR" ? "💎" : rarity === "SR" ? "🔮" : "⭐",
          rarity,
        },
      });
    }

    return {
      victory: true,
      rewards,
      totalExp,
      totalGold,
      characterExpGains,
    };
  };

  const executePlayerAction = async () => {
    console.log("🎯 executePlayerAction called");
    const currentTurnChar = getCurrentTurnCharacter();
    const currentChar = currentTurnChar?.isPlayer
      ? playerCharacters[currentTurnChar.originalIndex]
      : null;
    const target = battleState.selectedTarget;

    console.log("🎯 Current state:", {
      currentTurnChar,
      currentChar: currentChar?.name,
      target: target?.name,
      selectedAction: battleState.selectedAction,
      selectedSkill: battleState.selectedSkill?.name,
    });

    if (
      !currentChar ||
      !target ||
      !currentChar.isAlive ||
      !currentTurnChar?.isPlayer
    ) {
      console.log("🎯 Early return - missing data");
      return;
    }

    let actionText = "";
    let damage = 0;

    // Create copies of state to modify
    const updatedPlayerChars = [...playerCharacters];
    const updatedEnemyChars = [...battleState.enemyCharacters];
    const updatedTarget = target.isPlayer
      ? updatedPlayerChars.find((c) => c.id === target.id)
      : updatedEnemyChars.find((c) => c.id === target.id);
    const updatedCurrentChar =
      updatedPlayerChars[currentTurnChar.originalIndex];

    if (!updatedTarget || !updatedCurrentChar) {
      console.log("🎯 Early return - no updated chars");
      return;
    }

    console.log("🎯 Before damage calculation");

    if (battleState.selectedAction === "attack") {
      console.log("🎯 Executing basic attack");
      // Basic attack
      damage = calculateDamage(updatedCurrentChar, updatedTarget, {
        id: "basic_attack",
        name: "Basic Attack",
        mpCost: 0,
        damage: updatedCurrentChar.attack,
        type: "attack",
        description: "Basic attack",
        cooldown: 0,
        currentCooldown: 0,
      });

      applyDamage(updatedTarget, damage);
      actionText = `${updatedCurrentChar.name} attacks ${updatedTarget.name} for ${damage} damage!`;
    } else if (battleState.selectedSkill) {
      console.log("🎯 Executing skill");
      const skill = battleState.selectedSkill;

      // Check only cooldown (no mana check)
      if (skill.currentCooldown > 0) {
        actionText = `${skill.name} is on cooldown!`;
      } else {
        // Execute skill
        damage = calculateDamage(updatedCurrentChar, updatedTarget, skill);

        if (skill.type === "heal") {
          applyDamage(updatedTarget, damage, true); // damage is negative for heal
          actionText = `${updatedCurrentChar.name} uses ${
            skill.name
          } and heals ${updatedTarget.name} for ${-damage} HP!`;
        } else {
          applyDamage(updatedTarget, damage);
          actionText = `${updatedCurrentChar.name} uses ${skill.name} and deals ${damage} damage to ${updatedTarget.name}!`;
        }

        // Set cooldown
        const updatedSkill = updatedCurrentChar.skills.find(
          (s) => s.id === skill.id
        );
        if (updatedSkill) {
          updatedSkill.currentCooldown = skill.cooldown;
        }
      }
    } else {
      console.log("🎯 No action or skill selected");
    }

    console.log("🎯 Action result:", { actionText, damage });

    // Update state with modified copies
    console.log("🎯 Updating state");
    setPlayerCharacters(updatedPlayerChars);
    setBattleState((prev) => ({
      ...prev,
      enemyCharacters: updatedEnemyChars,
      battleLog: [...prev.battleLog, actionText],
      selectedAction: null,
      selectedSkill: null,
      selectedTarget: null,
      isProcessing: true,
    }));

    // Check for battle end
    console.log("🎯 Checking battle end");
    const battleResult = checkBattleEnd(updatedPlayerChars, updatedEnemyChars);
    if (battleResult) {
      console.log("🎯 Battle ended with result:", battleResult);
      const rewards = calculateBattleRewards(battleResult === "victory");

      setTimeout(() => {
        setBattleState((prev) => ({
          ...prev,
          phase: "rewards",
          battleResult: rewards,
          isProcessing: false,
        }));
      }, 1000);
      return;
    }

    // Advance to next turn using speed-based system
    console.log("🎯 Advancing to next turn");
    advanceToNextTurn();
  };

  const executeEnemyTurn = () => {
    const currentTurnChar = getCurrentTurnCharacter();
    const currentEnemy =
      currentTurnChar?.isPlayer === false
        ? battleState.enemyCharacters[currentTurnChar.originalIndex]
        : null;

    if (!currentEnemy || !currentEnemy.isAlive || currentTurnChar?.isPlayer) {
      // Move to next turn
      advanceToNextTurn();
      return;
    }

    // Simple AI: choose random skill or basic attack
    const availableSkills = currentEnemy.skills.filter(
      (skill) => skill.currentCooldown === 0 // Only check cooldown, not mana
    );

    let actionText = "";
    let damage = 0;

    if (availableSkills.length > 0 && Math.random() > 0.3) {
      // Use skill
      const skill =
        availableSkills[Math.floor(Math.random() * availableSkills.length)];
      const aliveTargets = playerCharacters.filter((char) => char.isAlive);
      const target =
        aliveTargets[Math.floor(Math.random() * aliveTargets.length)];

      if (target && target.isAlive) {
        damage = calculateDamage(currentEnemy, target, skill);

        if (skill.type === "heal") {
          applyDamage(currentEnemy, damage, true); // Heal self
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
      const aliveTargets = playerCharacters.filter((char) => char.isAlive);
      const target =
        aliveTargets[Math.floor(Math.random() * aliveTargets.length)];

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

    // Update battle log
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, actionText],
      isProcessing: true,
    }));

    // Check for battle end
    const battleResult = checkBattleEnd();
    if (battleResult) {
      const rewards = calculateBattleRewards(battleResult === "victory");

      setTimeout(() => {
        setBattleState((prev) => ({
          ...prev,
          phase: "rewards",
          battleResult: rewards,
          isProcessing: false,
        }));
      }, 1000);
      return;
    }

    // Advance to next turn using speed-based system
    setTimeout(() => {
      advanceToNextTurn();
    }, 1000);
  };

  // Add backend battle integration functions
  const startBackendBattle = async (characters: UserCharacter[]) => {
    if (!token) return;

    try {
      setBattleState((prev) => ({ ...prev, isProcessing: true }));

      console.log("🎮 Characters parameter:", characters);
      console.log("🎮 Selected characters state:", selectedCharacters);
      console.log("🎮 Characters length:", characters.length);
      console.log(
        "🎮 Character IDs:",
        characters.map((c) => c.id)
      );

      const battleData = {
        characterIds: characters.map((c) => c.id),
        difficulty: battleState.selectedDifficulty,
        battleType: "pve" as const,
        selectedEnemy: battleState.selectedEnemy,
      };

      console.log("🎮 Starting backend battle with data:", battleData);
      console.log("🎮 Token length:", token?.length || 0);
      console.log("🎮 Token preview:", token?.substring(0, 50) + "...");

      // Try direct fetch first for debugging
      console.log("🔍 Testing direct fetch...");
      const directResponse = await fetch(
        "http://localhost:8000/api/battle/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(battleData),
        }
      );

      console.log("🔍 Direct fetch response status:", directResponse.status);
      const directData = await directResponse.json();
      console.log("🔍 Direct fetch response data:", directData);

      if (directResponse.ok) {
        console.log("🎮 Direct fetch battle started:", directData);
        setBattleState((prev) => ({
          ...prev,
          backendBattleId: directData.data.id,
          backendBattleState: directData.data,
          isConnectedToBackend: true,
          phase: "battle",
          isProcessing: false,
          battleLog: directData.data.log || prev.battleLog,
        }));

        // Convert backend characters to frontend format
        convertBackendCharacters(directData.data);
        return; // Exit early if direct fetch works
      }

      // If direct fetch fails, try the regular API method
      const response = await battleAPI.startBattle(token, battleData);

      if (response.success) {
        console.log("🎮 Backend battle started:", response.data);
        setBattleState((prev) => ({
          ...prev,
          backendBattleId: response.data.id,
          backendBattleState: response.data,
          isConnectedToBackend: true,
          phase: "battle",
          isProcessing: false,
          battleLog: response.data.log || prev.battleLog,
        }));

        // Convert backend characters to frontend format
        convertBackendCharacters(response.data);
      } else {
        console.error("Failed to start backend battle:", response.error);
        setBattleState((prev) => ({ ...prev, isProcessing: false }));
      }
    } catch (error) {
      console.error("Error starting backend battle:", error);
      setBattleState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const convertBackendCharacters = (backendBattle: any) => {
    const playerChars: BattleCharacter[] = [];
    const enemyChars: BattleCharacter[] = [];

    backendBattle.characters.forEach((char: any) => {
      const battleChar: BattleCharacter = {
        id: char.id,
        name: char.name,
        level: char.level,
        hp: char.stats.hp,
        maxHp: char.stats.maxHp,
        mp: char.currentEnergy || 0,
        maxMp: char.maxEnergy || 100,
        attack: char.stats.attack,
        defense: char.stats.defense,
        speed: char.stats.speed,
        critRate: char.stats.critRate,
        critDamage: char.stats.critDamage,
        skills: char.skills.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          mpCost: skill.energyCost || 0,
          damage: skill.damage || 0,
          type: skill.damage ? "attack" : "heal",
          description: skill.description,
          cooldown: skill.cooldown || 0,
          currentCooldown: skill.currentCooldown || 0,
        })),
        isPlayer: char.isPlayer,
        isAlive: char.stats.hp > 0,
        statusEffects: char.statusEffects || [],
        artwork: char.isPlayer
          ? { icon: "🦸‍♂️", thumbnail: "🦸‍♂️" }
          : { icon: "👾", thumbnail: "👾" },
      };

      if (char.isPlayer) {
        playerChars.push(battleChar);
      } else {
        enemyChars.push(battleChar);
      }
    });

    setPlayerCharacters(playerChars);
    const currentActorId = backendBattle.turnOrder[backendBattle.currentTurn];
    const currentActor = backendBattle.characters.find(
      (c: any) => c.id === currentActorId
    );
    setBattleState((prev) => ({
      ...prev,
      enemyCharacters: enemyChars,
      turn: currentActor && currentActor.isPlayer ? "player" : "enemy",
      battleLog: backendBattle.log || prev.battleLog,
      selectedSkill: null,
      selectedAction: null,
      selectedTarget: null,
    }));
  };

  const performBackendAction = async (action: any) => {
    if (!token || !battleState.backendBattleId) return;

    try {
      setBattleState((prev) => ({ ...prev, isProcessing: true }));

      const response = await battleAPI.performAction(
        token,
        battleState.backendBattleId,
        action
      );

      if (response.success) {
        console.log("🎯 Backend action result:", response.data);

        // Update battle state from backend response
        const updatedBattle = response.data.battleState;
        convertBackendCharacters(updatedBattle);

        setBattleState((prev) => ({
          ...prev,
          backendBattleState: updatedBattle,
          battleLog: updatedBattle.log || prev.battleLog,
          isProcessing: false,
          selectedAction: null,
          selectedSkill: null,
          selectedTarget: null,
        }));

        // Check if battle ended
        if (updatedBattle.status === "completed") {
          await completeBackendBattle();
        }
      } else {
        console.error("Backend action failed:", response.error);
        setBattleState((prev) => ({
          ...prev,
          isProcessing: false,
          battleLog: [...prev.battleLog, `❌ ${response.error}`],
          selectedSkill: null,
          selectedAction: null,
        }));
      }
    } catch (error) {
      console.error("Error performing backend action:", error);
      setBattleState((prev) => ({
        ...prev,
        isProcessing: false,
        selectedSkill: null,
        selectedAction: null,
      }));
    }
  };

  const completeBackendBattle = async () => {
    if (!token || !battleState.backendBattleId) return;

    try {
      const response = await battleAPI.completeBattle(
        token,
        battleState.backendBattleId
      );

      if (response.success) {
        console.log("🎉 Backend battle completed:", response.data);

        // Convert backend rewards to frontend format
        const backendRewards = response.data;
        const frontendRewards: BattleResult = {
          victory: battleState.backendBattleState?.winner === "player",
          rewards: [
            { type: "exp", amount: backendRewards.experience },
            { type: "gold", amount: backendRewards.coins },
            ...backendRewards.items.map((item: string) => ({
              type: "item" as const,
              amount: 1,
              item: {
                id: item,
                name: item
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                icon: "🎁",
                rarity: "R" as const,
              },
            })),
            ...backendRewards.equipments.map((eq: string) => ({
              type: "item" as const,
              amount: 1,
              item: {
                id: eq,
                name: eq
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                icon: "⚔️",
                rarity: eq.includes("ssr")
                  ? ("SSR" as const)
                  : eq.includes("sr")
                  ? ("SR" as const)
                  : ("R" as const),
              },
            })),
          ],
          totalExp: backendRewards.experience,
          totalGold: backendRewards.coins,
          characterExpGains: playerCharacters.map((char) => ({
            characterId: char.id,
            expGained: Math.floor(
              backendRewards.experience / playerCharacters.length
            ),
            leveledUp: false,
          })),
        };

        setBattleState((prev) => ({
          ...prev,
          phase: "rewards",
          battleResult: frontendRewards,
          isProcessing: false,
        }));
      } else {
        console.error("Failed to complete backend battle:", response.error);
      }
    } catch (error) {
      console.error("Error completing backend battle:", error);
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
    if (battleState.loadingBattleData) {
      return (
        <div className="battle-screen">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading battle data...</p>
          </div>
        </div>
      );
    }

    const selectedEnemyData = battleState.availableEnemies.find(
      (e) => e.id === battleState.selectedEnemy
    );
    const difficultyData = battleState.difficultySettings.find(
      (d) => d.id === battleState.selectedDifficulty
    );

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
              onClick={async () => {
                // Always start backend battle (no mode selection)
                console.log("Starting backend battle...");
                console.log("Selected characters:", selectedCharacters);
                console.log(
                  "Original selected characters:",
                  originalSelectedCharacters
                );
                console.log("Player characters:", playerCharacters);

                // Use originalSelectedCharacters that were stored from character selection
                const charactersToUse =
                  originalSelectedCharacters.length > 0
                    ? originalSelectedCharacters
                    : selectedCharacters;

                console.log("Characters to use:", charactersToUse);

                if (charactersToUse.length === 0) {
                  console.error("No characters selected!");
                  return;
                }

                await startBackendBattle(charactersToUse);
              }}
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
                {battleState.availableEnemies.map((enemy) => (
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
                      {Math.round(
                        enemy.level * (difficultyData?.multiplier || 1)
                      )}{" "}
                      | HP:{" "}
                      {Math.round(enemy.hp * (difficultyData?.multiplier || 1))}
                    </div>
                    <div className="enemy-description">{enemy.description}</div>
                  </div>
                ))}
              </div>

              <h4 className="section-title">🎯 Difficulty</h4>
              <div className="difficulty-selection">
                {battleState.difficultySettings.map((diff) => (
                  <div
                    key={diff.id}
                    className={`difficulty-card ${
                      battleState.selectedDifficulty === diff.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedDifficulty: diff.id as any,
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

  // Rewards Screen Phase
  if (battleState.phase === "rewards" && battleState.battleResult) {
    return (
      <div className="battle-screen">
        <div className="battle-rewards-modal">
          <div className="rewards-content">
            <div className="victory-header">
              <h1 className="victory-title">
                {battleState.battleResult.victory
                  ? "🎉 Victory!"
                  : "💀 Defeat!"}
              </h1>
              <p className="victory-subtitle">
                {battleState.battleResult.victory
                  ? "Battle Complete - Here are your rewards!"
                  : "Better luck next time! Here are your consolation rewards."}
              </p>
            </div>

            <div className="rewards-grid">
              {battleState.battleResult.rewards.map((reward, index) => (
                <div key={index} className={`reward-card ${reward.type}`}>
                  <div className="reward-icon">
                    {reward.type === "exp"
                      ? "⭐"
                      : reward.type === "gold"
                      ? "🪙"
                      : reward.type === "character_exp"
                      ? "📈"
                      : reward.item?.icon || "🎁"}
                  </div>
                  <div className="reward-details">
                    <div className="reward-name">
                      {reward.type === "exp"
                        ? "Total EXP"
                        : reward.type === "gold"
                        ? "Gold"
                        : reward.type === "character_exp"
                        ? "Character EXP"
                        : reward.item?.name || "Item"}
                    </div>
                    <div className="reward-amount">
                      +{reward.amount}
                      {reward.item && (
                        <span className={`rarity-badge ${reward.item.rarity}`}>
                          {reward.item.rarity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {battleState.battleResult.victory &&
              battleState.battleResult.characterExpGains.length > 0 && (
                <div className="character-exp-section">
                  <h3>Character Experience Gained</h3>
                  <div className="character-exp-list">
                    {battleState.battleResult.characterExpGains.map(
                      (charExp, index) => {
                        const character = playerCharacters.find(
                          (c) => c.id === charExp.characterId
                        );
                        return (
                          <div key={index} className="character-exp-item">
                            <div className="character-info">
                              <div className="character-icon">
                                {character?.artwork?.icon || "🦸‍♂️"}
                              </div>
                              <div className="character-name">
                                {character?.name}
                              </div>
                            </div>
                            <div className="exp-gained">
                              +{charExp.expGained} EXP
                              {charExp.leveledUp && (
                                <span className="level-up">🎊 LEVEL UP!</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            <div className="rewards-actions">
              <button
                className="continue-button"
                onClick={() =>
                  setBattleState((prev) => ({
                    ...prev,
                    phase: "character_selection",
                    battleResult: undefined,
                  }))
                }
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Battle Phase
  return (
    <div
      className={`battle-screen ${
        battleState.phase === "battle" ? "battle-phase" : ""
      }`}
    >
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
        {/* Turn Counter - moved to top */}
        <div className="turn-counter-top">
          <div className="turn-display">Turn {battleState.turnCount}</div>
        </div>

        {/* Arena-style Character Formation */}
        <div className="arena-battlefield">
          {/* Arena Particles Effect */}
          <div className="arena-particles"></div>

          {/* Enemy Formation Area - Top */}
          <div className="enemy-formation-area">
            <div className="formation-row enemy-row">
              {battleState.enemyCharacters.map((enemy) => (
                <div
                  key={enemy.id}
                  className={`arena-character enemy-character ${
                    enemy.isAlive ? "" : "dead"
                  } ${
                    battleState.turn === "player" &&
                    !battleState.isProcessing &&
                    (battleState.selectedAction === "attack" ||
                      battleState.selectedSkill) &&
                    enemy.isAlive
                      ? "targetable"
                      : ""
                  } ${(() => {
                    const currentTurnChar = getCurrentTurnCharacter();
                    return currentTurnChar?.id === enemy.id
                      ? "active-turn"
                      : "";
                  })()}`}
                  onClick={async () => {
                    console.log("Enemy clicked!", {
                      turn: battleState.turn,
                      isProcessing: battleState.isProcessing,
                      selectedAction: battleState.selectedAction,
                      selectedSkill: battleState.selectedSkill,
                      enemyAlive: enemy.isAlive,
                      isConnectedToBackend: battleState.isConnectedToBackend,
                    });

                    if (
                      battleState.turn === "player" &&
                      !battleState.isProcessing &&
                      enemy.isAlive
                    ) {
                      console.log("Setting target and action!");

                      if (battleState.isConnectedToBackend) {
                        // ใช้ characterId จาก backend turnOrder
                        const backendState = battleState.backendBattleState;
                        const currentTurnCharacterId =
                          backendState?.turnOrder?.[backendState?.currentTurn];
                        if (currentTurnCharacterId) {
                          let action: any;
                          if (battleState.selectedSkill) {
                            // ตรวจสอบว่าตัวละครเทิร์นปัจจุบันมีสกิลนี้หรือไม่
                            const currentChar = backendState.characters.find(
                              (c: any) => c.id === currentTurnCharacterId
                            );
                            const hasSkill = currentChar?.skills?.some(
                              (s: any) => s.id === battleState.selectedSkill?.id
                            );
                            if (hasSkill) {
                              action = {
                                type: "skill",
                                characterId: currentTurnCharacterId,
                                targetIds: [enemy.id],
                                skillId: battleState.selectedSkill.id,
                              };
                            } else {
                              // ถ้าไม่มีสกิลนี้ให้ใช้ basic attack แทน
                              action = {
                                type: "basic_attack",
                                characterId: currentTurnCharacterId,
                                targetIds: [enemy.id],
                              };
                            }
                          } else {
                            action = {
                              type: "basic_attack",
                              characterId: currentTurnCharacterId,
                              targetIds: [enemy.id],
                            };
                          }
                          await performBackendAction(action);
                        }
                      } else {
                        // Use local battle system
                        setBattleState((prev) => ({
                          ...prev,
                          selectedTarget: enemy,
                          selectedAction:
                            prev.selectedAction || prev.selectedSkill
                              ? prev.selectedAction
                              : "attack",
                          isProcessing: true,
                        }));
                      }
                    }
                  }}
                >
                  {/* Turn Order Indicator */}
                  {(() => {
                    const turnOrder = calculateTurnOrder();
                    const charTurnIndex = turnOrder.findIndex(
                      (char) => char.id === enemy.id
                    );

                    return (
                      <>
                        {charTurnIndex >= 0 && (
                          <div className="turn-order-number">
                            {charTurnIndex + 1}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="character-sprite">
                    {/* Next Turn Indicator - Above HP bar */}
                    {(() => {
                      const nextChar = getNextTurnCharacter();
                      return (
                        nextChar?.id === enemy.id && (
                          <div
                            className="next-turn-indicator"
                            style={{
                              position: "absolute",
                              top: "-25px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 10,
                            }}
                          >
                            <div
                              className="next-turn-text"
                              style={{
                                backgroundColor: "#ffd700",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#000",
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              }}
                            >
                              NEXT
                            </div>
                          </div>
                        )
                      );
                    })()}

                    <div className="character-avatar-large">
                      {enemy.artwork?.icon || "👾"}
                    </div>

                    {/* HP Bar floating above */}
                    <div className="floating-hp-bar">
                      <div className="hp-bar-bg">
                        <div
                          className="hp-bar-fill"
                          style={{
                            width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="hp-text">
                        {enemy.hp}/{enemy.maxHp}
                      </div>
                    </div>

                    {/* Status Effects Icons */}
                    <div className="status-effects">
                      {enemy.statusEffects.map((effect, idx) => (
                        <div key={idx} className={`status-icon ${effect.type}`}>
                          {effect.type === "buff" ? "⬆️" : "⬇️"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Character Name & Level */}
                  <div className="character-nameplate">
                    <div className="character-name-arena">{enemy.name}</div>
                    <div className="character-level-arena">
                      Lv.{enemy.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VS Indicator */}
          <div className="arena-center">
            <div className="vs-indicator">⚔️</div>
          </div>

          {/* Player Team Formation - Bottom Half */}
          <div className="player-formation-area">
            <div className="formation-row player-row">
              {playerCharacters.map((character, index) => (
                <div
                  key={character.id}
                  className={`arena-character player-character ${(() => {
                    const currentTurnChar = getCurrentTurnCharacter();
                    return currentTurnChar?.id === character.id
                      ? "active-turn"
                      : "";
                  })()} ${!character.isAlive ? "dead" : ""}`}
                >
                  {/* Turn Order Indicator */}
                  {(() => {
                    const turnOrder = calculateTurnOrder();
                    const charTurnIndex = turnOrder.findIndex(
                      (char) => char.id === character.id
                    );

                    return (
                      <>
                        {charTurnIndex >= 0 && (
                          <div className="turn-order-number">
                            {charTurnIndex + 1}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Character Avatar */}
                  <div className="character-sprite">
                    {/* Next Turn Indicator - Moved much higher */}
                    {(() => {
                      const nextChar = getNextTurnCharacter();
                      return (
                        nextChar?.id === character.id && (
                          <div
                            className="next-turn-indicator"
                            style={{
                              position: "absolute",
                              top: "-45px", // ปรับให้สูงขึ้นอีก
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 10,
                              marginBottom: "15px", // เพิ่มระยะห่างด้านล่าง
                            }}
                          >
                            <div
                              className="next-turn-text"
                              style={{
                                backgroundColor: "#ffd700",
                                padding: "2px 12px", // เพิ่ม padding ด้านข้าง
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#000",
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              }}
                            >
                              NEXT
                            </div>
                          </div>
                        )
                      );
                    })()}

                    <div
                      className="character-avatar-large"
                      style={{ marginTop: "20px" }}
                    >
                      {" "}
                      {/* เพิ่มระยะห่างด้านบนของ avatar */}
                      {character.artwork?.icon || "🦸‍♂️"}
                    </div>

                    {/* HP Bar floating above */}
                    <div
                      className="floating-hp-bar"
                      style={{ marginTop: "15px" }}
                    >
                      {" "}
                      {/* เพิ่มระยะห่างของ HP bar */}
                      <div className="hp-bar-bg">
                        <div
                          className="hp-bar-fill"
                          style={{
                            width: `${(character.hp / character.maxHp) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="hp-text">
                        {character.hp}/{character.maxHp}
                      </div>
                    </div>

                    {/* Status Effects Icons */}
                    <div className="status-effects">
                      {character.statusEffects.map((effect, idx) => (
                        <div key={idx} className={`status-icon ${effect.type}`}>
                          {effect.type === "buff" ? "⬆️" : "⬇️"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Character Name & Level */}
                  <div className="character-nameplate">
                    <div className="character-name-arena">{character.name}</div>
                    <div className="character-level-arena">
                      Lv.{character.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Panel - bottom right, no card, just buttons in a row */}
        {battleState.turn === "player" && !battleState.isProcessing && (
          <div className="skills-bar-bottom-right">
            {(() => {
              const currentTurnChar = getCurrentTurnCharacter();
              const currentPlayerChar = currentTurnChar?.isPlayer
                ? playerCharacters[currentTurnChar.originalIndex]
                : null;
              return (
                currentPlayerChar?.skills.map((skill) => (
                  <button
                    key={skill.id}
                    className={`skill-btn-bar ${
                      battleState.selectedSkill?.id === skill.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setBattleState((prev) => ({
                        ...prev,
                        selectedAction: "skill",
                        selectedSkill: skill,
                      }))
                    }
                    disabled={skill.currentCooldown > 0}
                  >
                    <span className="skill-icon-bar">
                      {skill.name.split(" ")[0]}
                    </span>
                    <span className="skill-name-bar">
                      {skill.name.replace(/^[^\s]*\s/, "")}
                    </span>
                    {skill.currentCooldown > 0 && (
                      <span className="cooldown-overlay-bar">
                        {skill.currentCooldown}
                      </span>
                    )}
                  </button>
                )) || []
              );
            })()}
          </div>
        )}
      </div>{" "}
      {/* end .battle-arena */}
      {/* Floating Battle Log - always visible, outside of battle-arena */}
      <div className="floating-battle-log">
        <div className="log-title-floating">📜 Battle Log</div>
        <div className="log-content-floating">
          {battleState.battleLog.slice(-5).map((entry, index) => (
            <div key={index} className="log-entry-floating">
              {entry}
            </div>
          ))}
        </div>
      </div>
      {/* Processing Indicator */}
      {battleState.isProcessing && (
        <div className="processing-indicator-simple">
          <div className="processing-text">
            {battleState.turn === "enemy" ? "Enemy Turn..." : "Processing..."}
          </div>
          <div className="processing-spinner">⚡</div>
        </div>
      )}
    </div>
  );
}
