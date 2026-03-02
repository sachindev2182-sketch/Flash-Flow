import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: "home" | "work" | "other";
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Please enter a valid 10-digit phone number",
      },
    },
    houseNumber: {
      type: String,
      required: [true, "House/Flat number is required"],
      trim: true,
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9]{6}$/.test(v);
        },
        message: "Please enter a valid 6-digit pincode",
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
const Address = (mongoose.models.Address as Model<IAddress>) || mongoose.model<IAddress>("Address", addressSchema);

export default Address;