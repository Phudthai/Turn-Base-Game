import { useState, useCallback } from "react";
import { gameAPI, inventoryAPI, dataAPI, battleAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { GachaPullResponse, InventoryResponse } from "../types/types";

export const useGameAPI = () => {
  const { token, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Gacha operations
  const performGacha = useCallback(
    async (
      bannerId: string = "standard_banner"
    ): Promise<GachaPullResponse | null> => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      console.log("🎰 Starting single gacha pull...");
      setIsLoading(true);
      setError(null);
      try {
        console.log("🎰 Calling gameAPI.performGacha...");
        const result = await gameAPI.performGacha(token, bannerId);
        console.log("🎰 Gacha result received:", result);

        console.log("🎰 Refreshing profile...");
        await refreshProfile(); // Update currency after gacha
        console.log("🎰 Profile refreshed successfully");

        return result;
      } catch (err: any) {
        console.error("🎰 Gacha error:", err);
        setError(err.message || "Failed to perform gacha");
        return null;
      } finally {
        console.log("🎰 Setting loading to false");
        setIsLoading(false);
      }
    },
    [token, refreshProfile]
  );

  const performMultiGacha = useCallback(
    async (
      bannerId: string = "standard_banner"
    ): Promise<GachaPullResponse | null> => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      console.log("🎰 Starting multi gacha pull...");
      setIsLoading(true);
      setError(null);
      try {
        console.log("🎰 Calling gameAPI.performMultiGacha...");
        const result = await gameAPI.performMultiGacha(token, bannerId);
        console.log("🎰 Multi gacha result received:", result);

        console.log("🎰 Refreshing profile...");
        await refreshProfile(); // Update currency after gacha
        console.log("🎰 Profile refreshed successfully");

        return result;
      } catch (err: any) {
        console.error("🎰 Multi gacha error:", err);
        setError(err.message || "Failed to perform multi gacha");
        return null;
      } finally {
        console.log("🎰 Setting loading to false");
        setIsLoading(false);
      }
    },
    [token, refreshProfile]
  );

  const getBanners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await gameAPI.getBanners(token || undefined);
    } catch (err: any) {
      setError(err.message || "Failed to get banners");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Inventory operations
  const getInventory =
    useCallback(async (): Promise<InventoryResponse | null> => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        return await inventoryAPI.getUserInventory(token);
      } catch (err: any) {
        setError(err.message || "Failed to get inventory");
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  const getCharacters = useCallback(async () => {
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      return await inventoryAPI.getCharacters(token);
    } catch (err: any) {
      setError(err.message || "Failed to get characters");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getPets = useCallback(async () => {
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      return await inventoryAPI.getPets(token);
    } catch (err: any) {
      setError(err.message || "Failed to get pets");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getItems = useCallback(async () => {
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      return await inventoryAPI.getItems(token);
    } catch (err: any) {
      setError(err.message || "Failed to get items");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Battle operations
  const startBattle = useCallback(
    async (characterIds: string[]) => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        return await battleAPI.startBattle(token, characterIds);
      } catch (err: any) {
        setError(err.message || "Failed to start battle");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const getBattleState = useCallback(
    async (battleId: string) => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        return await battleAPI.getBattleState(token, battleId);
      } catch (err: any) {
        setError(err.message || "Failed to get battle state");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const performBattleAction = useCallback(
    async (battleId: string, action: any) => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        return await battleAPI.performAction(token, battleId, action);
      } catch (err: any) {
        setError(err.message || "Failed to perform battle action");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return {
    // State
    isLoading,
    error,
    clearError,

    // Gacha
    performGacha,
    performMultiGacha,
    getBanners,

    // Inventory
    getInventory,
    getCharacters,
    getPets,
    getItems,

    // Battle
    startBattle,
    getBattleState,
    performBattleAction,
  };
};

// Hook for public data (no auth required)
export const useDataAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const getCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await dataAPI.getCharacters();
    } catch (err: any) {
      setError(err.message || "Failed to get character data");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await dataAPI.getPets();
    } catch (err: any) {
      setError(err.message || "Failed to get pet data");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await dataAPI.getItems();
    } catch (err: any) {
      setError(err.message || "Failed to get item data");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    getCharacters,
    getPets,
    getItems,
  };
};
