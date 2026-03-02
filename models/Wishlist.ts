import mongoose from "mongoose";

export interface IWishlistItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  addedAt: Date;
}

export interface IWishlist extends mongoose.Document {
  userId: string;
  items: IWishlistItem[];
  totalItems: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, "Product ID is required"],
  },
  title: {
    type: String,
    required: [true, "Product title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
  },
  image: {
    type: String,
    required: [true, "Product image is required"],
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: ["Men", "Women", "Kids", "Beauty", "Home"],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistSchema.virtual('totalItems').get(function(this: IWishlist) {
  return this.items.length;
});

wishlistSchema.virtual('totalValue').get(function(this: IWishlist) {
  return this.items.reduce((sum, item) => sum + item.price, 0);
});

const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;