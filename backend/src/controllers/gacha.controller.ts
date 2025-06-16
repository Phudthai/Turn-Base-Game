import { UserService } from "../services/user.service";
import { GachaService } from "../services/gacha.service";
import { CharacterService } from "../services/character.service";
import { ItemService } from "../services/item.service";
import { PetService } from "../services/pet.service";
import {
  performSinglePull,
  performMultiPull,
  determineItemType,
} from "../utils/gacha";
import type {
  GachaPullResponse,
  GachaPool,
  Banner,
} from "../models/gacha.model";
import type { IGachaPool, IBanner } from "../models/gacha-pool.model";

// Adapter function to convert MongoDB types to gacha utils compatible types
const adaptGachaPoolForUtils = (mongoPool: IGachaPool): GachaPool => {
  return {
    characters: mongoPool.characters,
    pets: mongoPool.pets,
    items: mongoPool.items,
    banners: mongoPool.banners.map(
      (banner: IBanner): Banner => ({
        id: banner.id,
        name: banner.name,
        type: banner.type,
        featured: banner.featured,
        cost: banner.cost,
        duration:
          banner.duration && banner.duration.start && banner.duration.end
            ? {
                start: banner.duration.start.toISOString(),
                end: banner.duration.end.toISOString(),
              }
            : undefined,
      })
    ),
    rates: mongoPool.rates,
  };
};

const validateBanner = (banner: IBanner): boolean => {
  // Check if banner is marked as active
  if (!banner.isActive) {
    console.log(`Banner ${banner.id} is not active (isActive: false)`);
    return false;
  }

  // Check duration if it exists and has both start and end dates
  if (banner.duration && banner.duration.start && banner.duration.end) {
    const now = new Date();
    const isWithinDuration =
      now >= banner.duration.start && now <= banner.duration.end;
    if (!isWithinDuration) {
      console.log(`Banner ${banner.id} is outside duration:`, {
        now: now.toISOString(),
        start: banner.duration.start.toISOString(),
        end: banner.duration.end.toISOString(),
      });
      return false;
    }
  }

  console.log(`Banner ${banner.id} is valid and active`);
  return true;
};

const validateCurrency = (
  user: any,
  banner: IBanner,
  isMultiPull: boolean
): boolean => {
  const cost = banner.cost.amount;
  const totalCost = isMultiPull
    ? cost * 10 - (banner.cost.discount?.multiPull || 0)
    : cost;

  const hasEnoughCurrency = user.currency[banner.cost.currency] >= totalCost;
  console.log(`Currency validation:`, {
    required: totalCost,
    available: user.currency[banner.cost.currency],
    currency: banner.cost.currency,
    hasEnough: hasEnoughCurrency,
  });

  return hasEnoughCurrency;
};

export const pull = async ({
  query,
  user,
}: {
  query: any;
  user: any;
}): Promise<GachaPullResponse> => {
  console.log("Gacha controller executing");
  console.log("Received context:", { query, user });

  try {
    const { bannerId, multi = false } = query;
    const userId = user.id;
    const isMultiPull = Boolean(multi);

    console.log("Processing gacha pull:", {
      userId,
      bannerId,
      isMultiPull,
    });

    // Get gacha pool from MongoDB
    const mongoGachaPool = await GachaService.getGachaPool();
    if (!mongoGachaPool) {
      throw new Error("Gacha pool not found");
    }

    const banner = mongoGachaPool.banners.find((b) => b.id === bannerId);
    if (!banner) {
      throw new Error("Banner not found");
    }

    console.log(`Found banner:`, {
      id: banner.id,
      name: banner.name,
      isActive: banner.isActive,
      duration: banner.duration,
    });

    if (!validateBanner(banner)) {
      throw new Error("Banner is not active");
    }

    // Get current user from MongoDB
    const currentUser = await UserService.findUserById(userId);
    if (!currentUser) throw new Error("User not found");

    console.log("Found user:", currentUser.username);

    if (!validateCurrency(currentUser, banner, isMultiPull)) {
      throw new Error("Insufficient currency");
    }

    const pityKey = banner.type === "standard" ? "standardPity" : "eventPity";
    const currentPity = currentUser.pity[pityKey];

    console.log("Current pity:", currentPity);

    // Convert MongoDB types to gacha utils compatible types
    const gachaPool = adaptGachaPoolForUtils(mongoGachaPool);
    const utilsBanner = gachaPool.banners.find((b) => b.id === bannerId)!;

    // Calculate costs
    const cost = banner.cost.amount;
    const totalCost = isMultiPull
      ? cost * 10 - (banner.cost.discount?.multiPull || 0)
      : cost;

    if (isMultiPull) {
      const result = performMultiPull(gachaPool, utilsBanner, currentPity);

      // Deduct currency
      const currencyType = banner.cost.currency;
      const currencyAmount = currencyType === "gems" ? -totalCost : 0;
      const coinsAmount = currencyType === "coins" ? -totalCost : 0;

      await UserService.updateUserCurrency(userId, currencyAmount, coinsAmount);

      // Update inventory for each pull
      await Promise.all(
        result.pulls.map(async (pull) => {
          const itemType = determineItemType(gachaPool, pull.item);

          if (itemType === "character") {
            await CharacterService.createUserCharacter(
              userId,
              pull.item.id,
              "gacha"
            );
          } else if (itemType === "item") {
            await ItemService.addUserItem(userId, pull.item.id, 1, "gacha");
          } else if (itemType === "pet") {
            await PetService.createUserPet(userId, pull.item.id, "gacha");
          }
        })
      );

      // Check if any pull got SSR to reset pity
      const gotSSR = result.pulls.some((pull) => pull.item.rarity === "SSR");
      const pityType = bannerId.includes("event") ? "event" : "standard";
      const newPity = gotSSR ? 0 : currentPity + 10;

      await UserService.updateUserPity(userId, pityType, newPity, 10);

      // Update statistics
      const ssrCount = result.pulls.filter(
        (pull) => pull.item.rarity === "SSR"
      ).length;
      if (ssrCount > 0) {
        await UserService.incrementUserStatistic(
          userId,
          "totalSSRsObtained",
          ssrCount
        );
      }

      return {
        success: true,
        pull: result,
        pityInfo: {
          current: newPity,
          untilGuaranteed: 100 - newPity,
        },
        currency: {
          type: banner.cost.currency,
          spent: totalCost,
          remaining: currentUser.currency[banner.cost.currency] - totalCost,
        },
      };
    } else {
      const result = performSinglePull(gachaPool, utilsBanner, currentPity);

      // Deduct currency
      const currencyType = banner.cost.currency;
      const currencyAmount = currencyType === "gems" ? -totalCost : 0;
      const coinsAmount = currencyType === "coins" ? -totalCost : 0;

      await UserService.updateUserCurrency(userId, currencyAmount, coinsAmount);

      // Update inventory
      const itemType = determineItemType(gachaPool, result);

      if (itemType === "character") {
        await CharacterService.createUserCharacter(userId, result.id, "gacha");
      } else if (itemType === "item") {
        await ItemService.addUserItem(userId, result.id, 1, "gacha");
      } else if (itemType === "pet") {
        await PetService.createUserPet(userId, result.id, "gacha");
      }

      // Update user pity
      const pityType = bannerId.includes("event") ? "event" : "standard";
      const newPity = result.rarity === "SSR" ? 0 : currentPity + 1;

      await UserService.updateUserPity(userId, pityType, newPity, 1);

      // Update user statistics
      if (result.rarity === "SSR") {
        await UserService.incrementUserStatistic(
          userId,
          "totalSSRsObtained",
          1
        );
      }

      return {
        success: true,
        pull: {
          type: itemType as "character" | "pet" | "item",
          item: result,
        },
        pityInfo: {
          current: newPity,
          untilGuaranteed: 100 - newPity,
        },
        currency: {
          type: banner.cost.currency,
          spent: totalCost,
          remaining: currentUser.currency[banner.cost.currency] - totalCost,
        },
      };
    }
  } catch (error) {
    console.error("Gacha pull error:", error);
    throw error;
  }
};

// Banner management functions (moved from BannerController)
export const getAllBanners = async () => {
  try {
    const gachaPool = await GachaService.getGachaPool();
    if (!gachaPool) {
      throw new Error("Gacha pool not found");
    }

    return {
      success: true,
      banners: gachaPool.banners.map((banner) => ({
        id: banner.id,
        name: banner.name,
        type: banner.type,
        isActive: banner.isActive,
        featured: banner.featured,
        cost: banner.cost,
        duration: banner.duration,
      })),
    };
  } catch (error) {
    console.error("Error getting all banners:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get banners",
    };
  }
};

export const getBanner = async ({ params }: { params: { id: string } }) => {
  try {
    const gachaPool = await GachaService.getGachaPool();
    if (!gachaPool) {
      throw new Error("Gacha pool not found");
    }

    const banner = gachaPool.banners.find((b) => b.id === params.id);
    if (!banner) {
      throw new Error("Banner not found");
    }

    return {
      success: true,
      banner: {
        id: banner.id,
        name: banner.name,
        type: banner.type,
        isActive: banner.isActive,
        featured: banner.featured,
        cost: banner.cost,
        duration: banner.duration,
      },
    };
  } catch (error) {
    console.error("Error getting banner:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Banner not found",
    };
  }
};

export const getActiveBanners = async () => {
  try {
    const gachaPool = await GachaService.getGachaPool();
    if (!gachaPool) {
      throw new Error("Gacha pool not found");
    }

    const activeBanners = gachaPool.banners.filter((banner) => {
      if (!banner.isActive) return false;

      if (banner.duration && banner.duration.start && banner.duration.end) {
        const now = new Date();
        return now >= banner.duration.start && now <= banner.duration.end;
      }

      return true;
    });

    return {
      success: true,
      banners: activeBanners.map((banner) => ({
        id: banner.id,
        name: banner.name,
        type: banner.type,
        isActive: banner.isActive,
        featured: banner.featured,
        cost: banner.cost,
        duration: banner.duration,
      })),
    };
  } catch (error) {
    console.error("Error getting active banners:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get active banners",
    };
  }
};
