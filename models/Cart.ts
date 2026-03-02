import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  size?: string;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  selectedItems: string[]; 
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
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
    enum: ["men", "women", "kids", "beauty", "home"],
  },
  size: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity cannot be less than 1"],
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    selectedItems: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

cartSchema.virtual('subtotal').get(function(this: ICart) {
  const selectedItems = this.items.filter(item => 
    this.selectedItems.includes(item.productId.toString())
  );
  return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const Cart = (mongoose.models.Cart as Model<ICart>) || 
  mongoose.model<ICart>("Cart", cartSchema);

export default Cart;