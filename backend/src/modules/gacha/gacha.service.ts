import { GachaPool, IGachaPool } from "../models/gacha-pool.model";

export class GachaService {
  // Get current gacha pool
  static async getGachaPool(): Promise<IGachaPool | null> {
    try {
      // Get the latest gacha pool
      return await GachaPool.findOne().sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error getting gacha pool:", error);
      throw error;
    }
  }

  // Get active banners
  static async getActiveBanners() {
    try {
      const pool = await this.getGachaPool();
      if (!pool) return [];

      const now = new Date();
      return pool.banners.filter((banner) => {
        if (!banner.isActive) return false;

        if (banner.duration) {
          return now >= banner.duration.start && now <= banner.duration.end;
        }

        return true;
      });
    } catch (error) {
      console.error("Error getting active banners:", error);
      throw error;
    }
  }

  // Get banner by ID
  static async getBannerById(bannerId: string) {
    try {
      const pool = await this.getGachaPool();
      if (!pool) return null;

      return pool.banners.find((banner) => banner.id === bannerId);
    } catch (error) {
      console.error("Error getting banner by ID:", error);
      throw error;
    }
  }
}
