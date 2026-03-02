import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  paymentId: string;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  paymentDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "inr",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeCustomerId: {
      type: String,
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = (mongoose.models.Payment as Model<IPayment>) || 
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;