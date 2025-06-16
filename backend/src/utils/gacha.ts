import type {
  GachaPool,
  GachaItem,
  Banner,
  Rarity,
  MultiGachaPull,
  GachaPull,
} from "../models/gacha.model";

const PITY_RATES = {
  HARD_PITY: 100, // Guaranteed SSR at 100 pulls
};

export const calculatePityRate = (
  pityCount: number,
  poolRates: { R: number; SR: number; SSR: number }
): { R: number; SR: number; SSR: number } => {
  // Always use rates from database - pity guarantee is handled in perform functions
  return poolRates;
};

export const determineRarity = (rates: {
  R: number;
  SR: number;
  SSR: number;
}): Rarity => {
  const rand = Math.random();
  if (rand < rates.R) return "R";
  if (rand < rates.R + rates.SR) return "SR";
  return "SSR";
};

export const performSinglePull = (
  pool: GachaPool,
  banner: Banner,
  pityCount: number,
  ignorePityGuarantee: boolean = false
): GachaItem => {
  // Hard pity: guarantee SSR at exactly 100 pulls (unless ignored)
  if (!ignorePityGuarantee && pityCount >= PITY_RATES.HARD_PITY) {
    const ssrItems = [
      ...pool.characters.filter((c) => c.rarity === "SSR"),
      ...pool.pets.filter((p) => p.rarity === "SSR"),
      ...pool.items.filter((i) => i.rarity === "SSR"),
      ...(pool.equipments?.filter((e) => e.rarity === "SSR") || []),
    ];

    if (ssrItems.length > 0) {
      return ssrItems[Math.floor(Math.random() * ssrItems.length)];
    }
  }

  // Normal pull with database rates
  const rates = calculatePityRate(pityCount, pool.rates);
  const rarity = determineRarity(rates);

  // Get all items of the selected rarity
  const items = [
    ...pool.characters.filter((c) => c.rarity === rarity),
    ...pool.pets.filter((p) => p.rarity === rarity),
    ...pool.items.filter((i) => i.rarity === rarity),
    ...(pool.equipments?.filter((e) => e.rarity === rarity) || []),
  ];

  // Split items into featured and non-featured
  const featuredItems = items.filter((item) =>
    banner.featured.items.includes(item.id)
  );
  const nonFeaturedItems = items.filter(
    (item) => !banner.featured.items.includes(item.id)
  );

  // Apply rate up for featured items
  const rand = Math.random();
  const itemPool =
    rand < banner.featured.rateUp ? featuredItems : nonFeaturedItems;

  // If no items in the selected pool, fallback to all items
  const finalPool = itemPool.length > 0 ? itemPool : items;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
};

export const performMultiPull = (
  pool: GachaPool,
  banner: Banner,
  pityCount: number
): MultiGachaPull => {
  const pulls: GachaPull[] = [];
  let currentPity = pityCount;
  let hasGuaranteedSR = false;
  let hasGuaranteedSSR = false;
  let guaranteedSSRPosition = -1;

  // Check if we need to guarantee SSR in this multi pull
  for (let i = 0; i < 10; i++) {
    if (currentPity + i >= PITY_RATES.HARD_PITY) {
      guaranteedSSRPosition = i;
      break;
    }
  }

  for (let i = 0; i < 10; i++) {
    let item: GachaItem;

    // Force SSR at guaranteed position
    if (i === guaranteedSSRPosition && !hasGuaranteedSSR) {
      const ssrItems = [
        ...pool.characters.filter((c) => c.rarity === "SSR"),
        ...pool.pets.filter((p) => p.rarity === "SSR"),
        ...pool.items.filter((i) => i.rarity === "SSR"),
        ...(pool.equipments?.filter((e) => e.rarity === "SSR") || []),
      ];

      if (ssrItems.length > 0) {
        item = ssrItems[Math.floor(Math.random() * ssrItems.length)];
        hasGuaranteedSSR = true;
      } else {
        item = performSinglePull(pool, banner, currentPity, true); // Ignore pity guarantee since we handle it here
      }
    } else {
      // For other pulls, ignore pity guarantee since we handle it manually
      item = performSinglePull(pool, banner, currentPity, true);
    }

    const type = determineItemType(pool, item);
    pulls.push({ type, item });

    if (item.rarity === "SR" || item.rarity === "SSR") {
      hasGuaranteedSR = true;
    }

    if (item.rarity === "SSR") {
      hasGuaranteedSSR = true;
    }

    currentPity++;
  }

  // Multi pull guarantee: If no SR or SSR in 10 pulls, guarantee SR on last pull
  if (!hasGuaranteedSR) {
    const srItems = [
      ...pool.characters.filter((c) => c.rarity === "SR"),
      ...pool.pets.filter((p) => p.rarity === "SR"),
      ...pool.items.filter((i) => i.rarity === "SR"),
      ...(pool.equipments?.filter((e) => e.rarity === "SR") || []),
    ];

    if (srItems.length > 0) {
      const srItem = srItems[Math.floor(Math.random() * srItems.length)];
      const type = determineItemType(pool, srItem);
      pulls[9] = { type, item: srItem };
    }
  }

  return {
    pulls,
    guaranteedSR: !hasGuaranteedSR,
  };
};

export const determineItemType = (
  pool: GachaPool,
  item: GachaItem
): "character" | "pet" | "item" | "equipment" => {
  if (pool.characters.some((c) => c.id === item.id)) return "character";
  if (pool.pets.some((p) => p.id === item.id)) return "pet";
  if (pool.equipments?.some((e) => e.id === item.id)) return "equipment";
  return "item";
};
