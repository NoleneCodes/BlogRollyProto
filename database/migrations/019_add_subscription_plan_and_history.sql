-- Migration: Add subscription_plan and stripe_subscription_id to blogger_profiles
-- Also create a subscription_history table for tracking all subscription events

ALTER TABLE blogger_profiles
  ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  plan VARCHAR(20), -- 'monthly' or 'yearly'
  status VARCHAR(20), -- 'active', 'canceled', 'past_due', etc.
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  event_type VARCHAR(50), -- e.g. 'created', 'renewed', 'canceled', 'payment_failed', etc.
  raw_event JSONB, -- Store the full Stripe event for audit/debug
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(stripe_subscription_id);
