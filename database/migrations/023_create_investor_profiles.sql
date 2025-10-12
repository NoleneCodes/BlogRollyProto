-- Migration 023: Create investor_profiles table
-- Stores investor sign-up info and LinkedIn profile URL


CREATE TABLE IF NOT EXISTS investor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    investment_range VARCHAR(20) NOT NULL,
    investor_type VARCHAR(30) NOT NULL,
    linkedin_url VARCHAR(255),
    interests VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id ON investor_profiles(user_id);
