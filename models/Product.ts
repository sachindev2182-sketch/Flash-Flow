import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: "men" | "women" | "kids" | "beauty" | "home";
  image: string;
  isNewArrival: boolean; 
  isTrending: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
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
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["men", "women", "kids", "beauty", "home"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    isNewArrival: {  
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Product = (mongoose.models.Product as Model<IProduct>) || 
  mongoose.model<IProduct>("Product", productSchema);

export default Product;