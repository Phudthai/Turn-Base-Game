import { Item } from "../models/item.model";
import { UserItem } from "../models/item.model";
import { UserCharacter } from "../models/user-character.model";
import { UserPet } from "../models/user-pet.model";
import { User } from "../models/user.model";

export class ItemController {
  // Get all item templates
  static async getAllItems() {
    try {
      const items = await Item.find({}).sort({ rarity: -1, name: 1 });

      return {
        success: true,
        items: items,
        summary: {
          total: items.length,
          byRarity: {
            SSR: items.filter((i) => i.rarity === "SSR").length,
            SR: items.filter((i) => i.rarity === "SR").length,
            R: items.filter((i) => i.rarity === "R").length,
          },
          byType: {
            consumable: items.filter((i) => i.type === "consumable").length,
            material: items.filter((i) => i.type === "material").length,
            enhancement: items.filter((i) => i.type === "enhancement").length,
            currency: items.filter((i) => i.type === "currency").length,
            special: items.filter((i) => i.type === "special").length,
          },
        },
      };
    } catch (error: any) {
      console.error("Error getting items:", error);
      return {
        success: false,
        message: error.message || "Failed to get items",
      };
    }
  }

  // Get user's item inventory
  static async getUserItems({ params }: { params: { userId: string } }) {
    try {
      const { userId } = params;

      const userItems = await UserItem.find({
        userId,
        quantity: { $gt: 0 },
      }).sort({ "metadata.obtainedAt": -1 });

      // Group by item type for easier management
      const groupedItems = {
        consumables: userItems.filter((item) =>
          this.isItemType(item.itemId, "consumable")
        ),
        materials: userItems.filter((item) =>
          this.isItemType(item.itemId, "material")
        ),
        enhancements: userItems.filter((item) =>
          this.isItemType(item.itemId, "enhancement")
        ),
        currencies: userItems.filter((item) =>
          this.isItemType(item.itemId, "currency")
        ),
        specials: userItems.filter((item) =>
          this.isItemType(item.itemId, "special")
        ),
      };

      return {
        success: true,
        items: userItems,
        grouped: groupedItems,
        summary: {
          total: userItems.length,
          totalQuantity: userItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        },
      };
    } catch (error: any) {
      console.error("Error getting user items:", error);
      return {
        success: false,
        message: error.message || "Failed to get user items",
      };
    }
  }

  // Add item to user inventory
  static async addItemToUser({
    body,
  }: {
    body: {
      userId: string;
      itemId: string;
      quantity: number;
      obtainedFrom?: string;
    };
  }) {
    try {
      const { userId, itemId, quantity, obtainedFrom = "gacha" } = body;

      // Check if item exists
      const itemTemplate = await Item.findOne({ id: itemId });
      if (!itemTemplate) {
        return {
          success: false,
          message: "Item not found",
        };
      }

      // Use atomic upsert operation to handle race conditions
      const result = await UserItem.findOneAndUpdate(
        { userId, itemId },
        {
          $inc: { quantity: quantity },
          $setOnInsert: {
            userId,
            itemId,
            metadata: {
              obtainedAt: new Date(),
              obtainedFrom,
              isLocked: false,
            },
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      // Check stack limit after update
      if (result.quantity > itemTemplate.stackLimit) {
        // Revert the change if it exceeds stack limit
        const excessQuantity = result.quantity - itemTemplate.stackLimit;
        await UserItem.findByIdAndUpdate(result._id, {
          $inc: { quantity: -excessQuantity },
        });

        return {
          success: false,
          message: `Cannot exceed stack limit of ${
            itemTemplate.stackLimit
          }. Added ${quantity - excessQuantity} items instead.`,
        };
      }

      return {
        success: true,
        message: `Added ${quantity} ${itemTemplate.name} to inventory`,
        userItem: result,
      };
    } catch (error: any) {
      console.error("Error adding item to user:", error);
      return {
        success: false,
        message: error.message || "Failed to add item to user",
      };
    }
  }

  // Use item
  static async useItem({
    body,
  }: {
    body: {
      userId: string;
      itemId: string;
      quantity?: number;
      targetId?: string;
      targetType?: "character" | "pet";
    };
  }) {
    try {
      const { userId, itemId, quantity = 1, targetId, targetType } = body;

      // Get user item
      const userItem = await UserItem.findOne({ userId, itemId });
      if (!userItem || userItem.quantity < quantity) {
        return {
          success: false,
          message: "Insufficient item quantity",
        };
      }

      // Get item template
      const itemTemplate = await Item.findOne({ id: itemId });
      if (!itemTemplate) {
        return {
          success: false,
          message: "Item template not found",
        };
      }

      // Check if it's a consumable item
      if (
        itemTemplate.type !== "consumable" &&
        itemTemplate.type !== "enhancement"
      ) {
        return {
          success: false,
          message: "This item cannot be used",
        };
      }

      // Apply item effects
      const results = [];
      for (const effect of itemTemplate.effects) {
        const result = await this.applyItemEffect(
          effect,
          userId,
          targetId,
          targetType,
          quantity
        );
        results.push(result);
      }

      // Reduce item quantity
      userItem.quantity -= quantity;
      userItem.metadata.lastUsed = new Date();

      if (userItem.quantity <= 0) {
        await UserItem.findByIdAndDelete(userItem._id);
      } else {
        await userItem.save();
      }

      return {
        success: true,
        message: `Used ${quantity} ${itemTemplate.name}`,
        effects: results,
        remainingQuantity: Math.max(0, userItem.quantity),
      };
    } catch (error: any) {
      console.error("Error using item:", error);
      return {
        success: false,
        message: error.message || "Failed to use item",
      };
    }
  }

  // Remove item from user inventory
  static async removeItemFromUser({
    body,
  }: {
    body: { userId: string; itemId: string; quantity: number };
  }) {
    try {
      const { userId, itemId, quantity } = body;

      const userItem = await UserItem.findOne({ userId, itemId });
      if (!userItem || userItem.quantity < quantity) {
        return {
          success: false,
          message: "Insufficient item quantity",
        };
      }

      userItem.quantity -= quantity;

      if (userItem.quantity <= 0) {
        await UserItem.findByIdAndDelete(userItem._id);
      } else {
        await userItem.save();
      }

      return {
        success: true,
        message: `Removed ${quantity} items from inventory`,
        remainingQuantity: Math.max(0, userItem.quantity),
      };
    } catch (error: any) {
      console.error("Error removing item from user:", error);
      return {
        success: false,
        message: error.message || "Failed to remove item from user",
      };
    }
  }

  // Lock/unlock item
  static async toggleItemLock({
    body,
  }: {
    body: { userId: string; itemId: string; isLocked: boolean };
  }) {
    try {
      const { userId, itemId, isLocked } = body;

      const userItem = await UserItem.findOne({ userId, itemId });
      if (!userItem) {
        return {
          success: false,
          message: "Item not found in inventory",
        };
      }

      userItem.metadata.isLocked = isLocked;
      await userItem.save();

      return {
        success: true,
        message: `Item ${isLocked ? "locked" : "unlocked"} successfully`,
        userItem: userItem,
      };
    } catch (error: any) {
      console.error("Error toggling item lock:", error);
      return {
        success: false,
        message: error.message || "Failed to toggle item lock",
      };
    }
  }

  // Helper method to apply item effects
  private static async applyItemEffect(
    effect: any,
    userId: string,
    targetId?: string,
    targetType?: "character" | "pet",
    quantity: number = 1
  ) {
    try {
      const effectValue = effect.value * quantity;

      switch (effect.type) {
        case "heal":
          if (targetType === "character" && targetId) {
            const character = await UserCharacter.findOne({
              _id: targetId,
              userId,
            });

            if (character) {
              // Heal character (this is a simplified implementation)
              // In a real game, you'd want to track current HP vs max HP
              return {
                type: "heal",
                target: "character",
                value: effectValue,
                message: `Healed ${effectValue} HP`,
              };
            }
          }
          break;

        case "buff":
          if (targetType === "character" && targetId) {
            // Apply temporary buff (would need buff system implementation)
            return {
              type: "buff",
              target: "character",
              value: effectValue,
              duration: effect.duration || 300, // 5 minutes default
              message: `Applied buff: +${effectValue} for ${
                effect.duration || 300
              }s`,
            };
          }
          break;

        case "experience":
          if (targetType === "character" && targetId) {
            const character = await UserCharacter.findOne({
              _id: targetId,
              userId,
            });

            if (character) {
              character.experience += effectValue;
              await character.save();

              return {
                type: "experience",
                target: "character",
                value: effectValue,
                message: `Gained ${effectValue} experience`,
              };
            }
          }
          break;

        case "currency":
          const user = await User.findOne({ _id: userId });
          if (user) {
            // Add currency to user (this would depend on your currency system)
            return {
              type: "currency",
              target: "user",
              value: effectValue,
              message: `Gained ${effectValue} currency`,
            };
          }
          break;

        default:
          return {
            type: effect.type,
            target: effect.target,
            value: effectValue,
            message: `Applied ${effect.type} effect`,
          };
      }

      return {
        type: effect.type,
        success: false,
        message: "Effect could not be applied",
      };
    } catch (error) {
      console.error("Error applying item effect:", error);
      return {
        type: effect.type,
        success: false,
        message: "Error applying effect",
      };
    }
  }

  // Helper method to check item type
  private static isItemType(itemId: string, type: string): boolean {
    // This is a simple implementation based on itemId prefix
    // In a real implementation, you'd query the Item collection
    return itemId.toLowerCase().includes(type.toLowerCase());
  }

  // Get user's inventory summary
  static async getUserInventorySummary({
    params,
  }: {
    params: { userId: string };
  }) {
    try {
      const { userId } = params;

      const userItems = await UserItem.find({ userId, quantity: { $gt: 0 } });

      // Calculate total value and space used
      let totalValue = 0;
      let totalSpace = userItems.length;

      const summary = {
        totalItems: userItems.length,
        totalSpace: totalSpace,
        maxSpace: 500, // Could be configurable per user
        totalValue: totalValue,
        categories: {
          consumables: userItems.filter((item) =>
            this.isItemType(item.itemId, "consumable")
          ).length,
          materials: userItems.filter((item) =>
            this.isItemType(item.itemId, "material")
          ).length,
          enhancements: userItems.filter((item) =>
            this.isItemType(item.itemId, "enhancement")
          ).length,
          currencies: userItems.filter((item) =>
            this.isItemType(item.itemId, "currency")
          ).length,
          specials: userItems.filter((item) =>
            this.isItemType(item.itemId, "special")
          ).length,
        },
        recentItems: userItems
          .sort(
            (a, b) =>
              b.metadata.obtainedAt.getTime() - a.metadata.obtainedAt.getTime()
          )
          .slice(0, 10),
      };

      return {
        success: true,
        summary: summary,
      };
    } catch (error: any) {
      console.error("Error getting inventory summary:", error);
      return {
        success: false,
        message: error.message || "Failed to get inventory summary",
      };
    }
  }
}
