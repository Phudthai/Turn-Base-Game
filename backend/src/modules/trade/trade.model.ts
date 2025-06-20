import mongoose, { Schema, Document } from "mongoose";

// Trade Transaction Model (for marketplace)
export interface ITrade extends Document {
  _id: string;
  sellerId: string;
  buyerId?: string;
  status: "active" | "sold" | "cancelled" | "expired";
  tradeType: "sell" | "auction" | "exchange";
  items: Array<{
    type: "character" | "equipment" | "item";
    itemId: string; // UserCharacter._id, UserEquipment._id, or UserItem.itemId
    instanceId?: string; // for unique items
    quantity?: number; // for stackable items
  }>;
  pricing: {
    currency: "gems" | "coins";
    amount: number;
    originalPrice?: number; // for discounts
  };
  auction?: {
    startingBid: number;
    currentBid: number;
    currentBidderId?: string;
    endTime: Date;
    bidHistory: Array<{
      bidderId: string;
      amount: number;
      timestamp: Date;
    }>;
  };
  exchange?: {
    requestedItems: Array<{
      type: "character" | "equipment" | "item";
      itemId: string;
      minRarity?: string;
      maxQuantity?: number;
    }>;
  };
  fees: {
    listingFee: number;
    salesTax: number;
    totalFees: number;
  };
  metadata: {
    listedAt: Date;
    expiresAt: Date;
    viewCount: number;
    favoriteCount: number;
    tags: string[];
    description?: string;
  };
  transaction?: {
    completedAt: Date;
    transactionId: string;
    escrowReleased: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    sellerId: { type: String, required: true, index: true },
    buyerId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ["active", "sold", "cancelled", "expired"],
      required: true,
      default: "active",
      index: true,
    },
    tradeType: {
      type: String,
      enum: ["sell", "auction", "exchange"],
      required: true,
      index: true,
    },
    items: [
      {
        type: {
          type: String,
          enum: ["character", "equipment", "item"],
          required: true,
        },
        itemId: { type: String, required: true },
        instanceId: { type: String },
        quantity: { type: Number, min: 1 },
      },
    ],
    pricing: {
      currency: {
        type: String,
        enum: ["gems", "coins"],
        required: true,
      },
      amount: { type: Number, required: true, min: 0 },
      originalPrice: { type: Number, min: 0 },
    },
    auction: {
      startingBid: { type: Number, min: 0 },
      currentBid: { type: Number, min: 0 },
      currentBidderId: { type: String },
      endTime: { type: Date },
      bidHistory: [
        {
          bidderId: { type: String, required: true },
          amount: { type: Number, required: true, min: 0 },
          timestamp: { type: Date, required: true, default: Date.now },
        },
      ],
    },
    exchange: {
      requestedItems: [
        {
          type: {
            type: String,
            enum: ["character", "equipment", "item"],
            required: true,
          },
          itemId: { type: String, required: true },
          minRarity: { type: String, enum: ["R", "SR", "SSR"] },
          maxQuantity: { type: Number, min: 1 },
        },
      ],
    },
    fees: {
      listingFee: { type: Number, required: true, min: 0, default: 0 },
      salesTax: { type: Number, required: true, min: 0, default: 0 },
      totalFees: { type: Number, required: true, min: 0, default: 0 },
    },
    metadata: {
      listedAt: { type: Date, required: true, default: Date.now },
      expiresAt: { type: Date, required: true },
      viewCount: { type: Number, default: 0, min: 0 },
      favoriteCount: { type: Number, default: 0, min: 0 },
      tags: [{ type: String }],
      description: { type: String, maxlength: 1000 },
    },
    transaction: {
      completedAt: { type: Date },
      transactionId: { type: String },
      escrowReleased: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: "trades",
  }
);

// Indexes for better performance
TradeSchema.index({ sellerId: 1, status: 1 });
TradeSchema.index({ buyerId: 1, status: 1 });
TradeSchema.index({ status: 1, tradeType: 1 });
TradeSchema.index({ "pricing.currency": 1, "pricing.amount": 1 });
TradeSchema.index({ "metadata.listedAt": -1 });
TradeSchema.index({ "metadata.expiresAt": 1 });
TradeSchema.index({ "items.type": 1, "items.itemId": 1 });

// Virtual for time remaining
TradeSchema.virtual("timeRemaining").get(function () {
  if (this.status !== "active") return 0;

  const now = new Date();
  const expires = new Date(this.metadata.expiresAt);
  return Math.max(0, expires.getTime() - now.getTime());
});

// Virtual for is auction active
TradeSchema.virtual("isAuctionActive").get(function () {
  if (this.tradeType !== "auction" || this.status !== "active") return false;

  const now = new Date();
  return this.auction && new Date(this.auction.endTime) > now;
});

TradeSchema.set("toJSON", { virtuals: true });

export const Trade = mongoose.model<ITrade>("Trade", TradeSchema);

// Trade Escrow Model (for secure transactions)
export interface ITradeEscrow extends Document {
  _id: string;
  tradeId: string;
  sellerId: string;
  buyerId: string;
  items: Array<{
    type: "character" | "equipment" | "item";
    fromUserId: string;
    toUserId: string;
    itemReference: string;
    quantity?: number;
  }>;
  currency: {
    type: "gems" | "coins";
    amount: number;
    fromUserId: string;
    toUserId: string;
  };
  status: "pending" | "completed" | "disputed" | "cancelled";
  timeline: Array<{
    action: string;
    timestamp: Date;
    userId?: string;
    details?: any;
  }>;
  dispute?: {
    reason: string;
    reporterId: string;
    reportedAt: Date;
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TradeEscrowSchema = new Schema<ITradeEscrow>(
  {
    tradeId: { type: String, required: true, unique: true, index: true },
    sellerId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    items: [
      {
        type: {
          type: String,
          enum: ["character", "equipment", "item"],
          required: true,
        },
        fromUserId: { type: String, required: true },
        toUserId: { type: String, required: true },
        itemReference: { type: String, required: true },
        quantity: { type: Number, min: 1 },
      },
    ],
    currency: {
      type: {
        type: String,
        enum: ["gems", "coins"],
        required: true,
      },
      amount: { type: Number, required: true, min: 0 },
      fromUserId: { type: String, required: true },
      toUserId: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "disputed", "cancelled"],
      required: true,
      default: "pending",
      index: true,
    },
    timeline: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        userId: { type: String },
        details: { type: Schema.Types.Mixed },
      },
    ],
    dispute: {
      reason: { type: String },
      reporterId: { type: String },
      reportedAt: { type: Date },
      resolution: { type: String },
      resolvedAt: { type: Date },
      resolvedBy: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "trade_escrows",
  }
);

TradeEscrowSchema.index({ tradeId: 1 });
TradeEscrowSchema.index({ status: 1, createdAt: -1 });

export const TradeEscrow = mongoose.model<ITradeEscrow>(
  "TradeEscrow",
  TradeEscrowSchema
);
