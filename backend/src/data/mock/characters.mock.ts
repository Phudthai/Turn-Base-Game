import { BattleCharacter, Skill, StatusEffect } from "../../types/battle.types";

const fireballSkill: Skill = {
  id: "skill_fireball",
  name: "Fireball",
  description: "Launches a ball of fire at the target",
  damage: 150,
  statusEffects: [
    {
      id: "effect_burn",
      name: "Burn",
      type: "debuff",
      duration: 2,
      effect: {
        stat: "hp",
        value: -30,
      },
    },
  ],
  cooldown: 3,
  targeting: "single",
  energyCost: 30,
};

const healingLightSkill: Skill = {
  id: "skill_healing_light",
  name: "Healing Light",
  description: "Heals target ally",
  healing: 120,
  statusEffects: [
    {
      id: "effect_regen",
      name: "Regeneration",
      type: "buff",
      duration: 2,
      effect: {
        stat: "hp",
        value: 20,
      },
    },
  ],
  cooldown: 4,
  targeting: "single",
  energyCost: 40,
};

export const mockCharacters: BattleCharacter[] = [
  {
    id: "char_mage",
    name: "Fire Mage",
    level: 10,
    stats: {
      hp: 800,
      maxHp: 800,
      attack: 120,
      defense: 60,
      speed: 90,
      critRate: 15,
      critDamage: 150,
    },
    skills: [fireballSkill],
    statusEffects: [],
    currentEnergy: 100,
    maxEnergy: 100,
    position: 1,
    isPlayer: true,
  },
  {
    id: "char_healer",
    name: "Light Priest",
    level: 10,
    stats: {
      hp: 700,
      maxHp: 700,
      attack: 80,
      defense: 70,
      speed: 85,
      critRate: 10,
      critDamage: 130,
    },
    skills: [healingLightSkill],
    statusEffects: [],
    currentEnergy: 100,
    maxEnergy: 100,
    position: 2,
    isPlayer: true,
  },
  {
    id: "enemy_wolf",
    name: "Dire Wolf",
    level: 8,
    stats: {
      hp: 1000,
      maxHp: 1000,
      attack: 100,
      defense: 50,
      speed: 100,
      critRate: 20,
      critDamage: 140,
    },
    skills: [],
    statusEffects: [],
    currentEnergy: 100,
    maxEnergy: 100,
    position: 1,
    isPlayer: false,
  },
];
