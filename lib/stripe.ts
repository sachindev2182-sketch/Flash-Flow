import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
});

export const formatAmountForStripe = (amount: number, currency: string): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number, currency: string): number => {
  return amount / 100;
};