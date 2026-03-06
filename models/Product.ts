import mongoose, { Schema, Document, Model } from "mongoose";

export type MenSubcategory = "Clothing" | "Footwear" | "Sports" | "Accessories";
export type WomenSubcategory = "Clothing" | "Footwear" | "Accessories" | "Jewelery" | "Beauty";
export type KidsSubcategory = "Boys" | "Girls" | "Footwear" | "Toys";
export type HomeSubcategory = "Home decor" | "Furnishing" | "Kitchen" | "Groceries" | "Electronics" | "Gadgets" | "Books";
export type BeautySubcategory = "Makeup" | "Skincare" | "Haircare" | "Fragrance";

export type ProductSubcategory = 
  | MenSubcategory 
  | WomenSubcategory 
  | KidsSubcategory 
  | HomeSubcategory 
  | BeautySubcategory;

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: "men" | "women" | "kids" | "beauty" | "home";
  subcategory: ProductSubcategory; 
  image: string;
  isNewArrival: boolean; 
  isTrending: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const validSubcategories: Record<string, string[]> = {
  men: ["Clothing", "Footwear", "Sports", "Accessories"],
  women: ["Clothing", "Footwear", "Accessories", "Jewelery", "Beauty"],
  kids: ["Boys", "Girls", "Footwear", "Toys"],
  home: ["Home decor", "Furnishing", "Kitchen", "Groceries", "Electronics", "Gadgets", "Books"],
  beauty: ["Makeup", "Skincare", "Haircare", "Fragrance"],
};

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
    subcategory: {
      type: String,
      required: [true, "Product subcategory is required"],
      validate: {
        validator: function(this: any, value: string) {
          const category = this.category;
          return validSubcategories[category]?.includes(value) || false;
        },
        message: (props: { value: string }) => 
          `${props.value} is not a valid subcategory for the selected category`,
      },
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

(productSchema as any).pre('findOneAndUpdate', function(this: any, next: (err?: Error) => void) {
  try {
    const update = this.getUpdate() as any;
    
    if (update?.category && update?.subcategory) {
      if (!validSubcategories[update.category]?.includes(update.subcategory)) {
        return next(new Error(`"${update.subcategory}" is not a valid subcategory for ${update.category}`));
      }
    }
    
    if (!update?.category && update?.subcategory) {
      this.model.findOne(this.getQuery()).then((doc: any) => {
        if (doc && !validSubcategories[doc.category]?.includes(update.subcategory)) {
          next(new Error(`"${update.subcategory}" is not a valid subcategory for ${doc.category}`));
        } else {
          next();
        }
      }).catch(next);
    } else {
      next();
    }
  } catch (error) {
    next(error as Error);
  }
});

productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ title: 'text', description: 'text' }); 

const Product = (mongoose.models.Product as Model<IProduct>) || 
  mongoose.model<IProduct>("Product", productSchema);

export default Product;