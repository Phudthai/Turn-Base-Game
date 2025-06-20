import { Item, IItem, UserItem, IUserItem } from "../models/item.model";

export class ItemService {
  // Get item template by ID
  static async getItemById(itemId: string): Promise<IItem | null> {
    try {
      return await Item.findOne({ id: itemId });
    } catch (error) {
      console.error("Error getting item by ID:", error);
      throw error;
    }
  }

  // Get all item templates
  static async getAllItems(): Promise<IItem[]> {
    try {
      return await Item.find({}).sort({ rarity: -1, name: 1 });
    } catch (error) {
      console.error("Error getting all items:", error);
      throw error;
    }
  }

  // Add item to user inventory (stackable)
  static async addUserItem(
    userId: string,
    itemId: string,
    quantity: number = 1,
    obtainedFrom:
      | "gacha"
      | "event"
      | "trade"
      | "gift"
      | "purchase"
      | "craft" = "gacha"
  ): Promise<IUserItem> {
    try {
      // Check if item template exists
      const itemTemplate = await Item.findOne({ id: itemId });
      if (!itemTemplate) {
        throw new Error(`Item template not found: ${itemId}`);
      }

      // Check if user already has this item
      let userItem = await UserItem.findOne({ userId, itemId });

      if (userItem) {
        // Add to existing stack (respect stack limit)
        const newQuantity = Math.min(
          userItem.quantity + quantity,
          itemTemplate.stackLimit
        );
        userItem.quantity = newQuantity;
        userItem.metadata.lastUsed = new Date();

        return await userItem.save();
      } else {
        // Create new user item
        userItem = new UserItem({
          userId,
          itemId,
          quantity: Math.min(quantity, itemTemplate.stackLimit),
          metadata: {
            obtainedAt: new Date(),
            obtainedFrom,
            isLocked: false,
            lastUsed: new Date(),
          },
        });

        return await userItem.save();
      }
    } catch (error) {
      console.error("Error adding user item:", error);
      throw error;
    }
  }

  // Remove item from user inventory
  static async removeUserItem(
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<boolean> {
    try {
      const userItem = await UserItem.findOne({ userId, itemId });

      if (!userItem) {
        throw new Error("Item not found in user inventory");
      }

      if (userItem.metadata.isLocked) {
        throw new Error("Cannot remove locked item");
      }

      if (userItem.quantity < quantity) {
        throw new Error("Insufficient item quantity");
      }

      userItem.quantity -= quantity;

      if (userItem.quantity <= 0) {
        // Remove item completely if quantity reaches 0
        await UserItem.deleteOne({ _id: userItem._id });
      } else {
        // Update quantity
        await userItem.save();
      }

      return true;
    } catch (error) {
      console.error("Error removing user item:", error);
      throw error;
    }
  }

  // Get user's items
  static async getUserItems(userId: string): Promise<IUserItem[]> {
    try {
      return await UserItem.find({ userId, quantity: { $gt: 0 } }).sort({
        "metadata.obtainedAt": -1,
      });
    } catch (error) {
      console.error("Error getting user items:", error);
      throw error;
    }
  }

  // Get user item by item ID
  static async getUserItem(
    userId: string,
    itemId: string
  ): Promise<IUserItem | null> {
    try {
      return await UserItem.findOne({ userId, itemId, quantity: { $gt: 0 } });
    } catch (error) {
      console.error("Error getting user item:", error);
      throw error;
    }
  }

  // Use item (consumable)
  static async useItem(
    userId: string,
    itemId: string,
    quantity: number = 1,
    targetId?: string // character ID if applicable
  ): Promise<{ success: boolean; effects: any[] }> {
    try {
      const userItem = await UserItem.findOne({ userId, itemId });
      const itemTemplate = await Item.findOne({ id: itemId });

      if (!userItem || !itemTemplate) {
        throw new Error("Item not found");
      }

      if (userItem.quantity < quantity) {
        throw new Error("Insufficient item quantity");
      }

      if (itemTemplate.type !== "consumable") {
        throw new Error("Item is not consumable");
      }

      // Apply item effects
      const effects = [];
      for (const effect of itemTemplate.effects) {
        effects.push({
          type: effect.type,
          value: effect.value * quantity,
          target: effect.target,
          duration: effect.duration,
        });
      }

      // Remove used items
      await this.removeUserItem(userId, itemId, quantity);

      // Update last used
      userItem.metadata.lastUsed = new Date();
      await userItem.save();

      return { success: true, effects };
    } catch (error) {
      console.error("Error using item:", error);
      throw error;
    }
  }

  // Get user's item count
  static async getUserItemCount(userId: string): Promise<number> {
    try {
      const items = await UserItem.find({ userId, quantity: { $gt: 0 } });
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Error getting user item count:", error);
      throw error;
    }
  }

  // Get user items with template details
  static async getUserItemsWithTemplates(userId: string) {
    try {
      const userItems = await UserItem.find({
        userId,
        quantity: { $gt: 0 },
      }).sort({
        "metadata.obtainedAt": -1,
      });

      const itemsWithTemplates = await Promise.all(
        userItems.map(async (userItem) => {
          const template = await Item.findOne({ id: userItem.itemId });
          return {
            userItem,
            template,
          };
        })
      );

      return itemsWithTemplates.filter((item) => item.template !== null);
    } catch (error) {
      console.error("Error getting user items with templates:", error);
      throw error;
    }
  }

  // Update item metadata
  static async updateItemMetadata(
    userId: string,
    itemId: string,
    updates: {
      isLocked?: boolean;
    }
  ): Promise<IUserItem | null> {
    try {
      return await UserItem.findOneAndUpdate(
        { userId, itemId },
        {
          $set: {
            ...(updates.isLocked !== undefined && {
              "metadata.isLocked": updates.isLocked,
            }),
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating item metadata:", error);
      throw error;
    }
  }

  // Get items by type
  static async getUserItemsByType(
    userId: string,
    type: "consumable" | "material" | "enhancement" | "currency" | "special"
  ) {
    try {
      const userItems = await UserItem.find({ userId, quantity: { $gt: 0 } });

      const filteredItems = [];
      for (const userItem of userItems) {
        const template = await Item.findOne({ id: userItem.itemId, type });
        if (template) {
          filteredItems.push({
            userItem,
            template,
          });
        }
      }

      return filteredItems;
    } catch (error) {
      console.error("Error getting user items by type:", error);
      throw error;
    }
  }
}
