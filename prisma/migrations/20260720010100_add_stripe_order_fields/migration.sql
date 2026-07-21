-- Add Stripe support to ecommerce orders without dropping existing Razorpay data.
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT,
ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;

ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'STRIPE';
