
-- Migration 009: Create survey feedback table for blogger signup survey responses
-- This stores data from the mandatory survey completed during blogger registration

CREATE TABLE survey_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Survey responses
  blogger_experience VARCHAR(50) NOT NULL, -- '0-6months', '6months-1year', '1-2years', '2-5years', '5plus'
  primary_goal TEXT NOT NULL,
  audience_size VARCHAR(50) NOT NULL, -- Expected values like 'under-100', '100-1000', etc.
  content_frequency VARCHAR(50) NOT NULL,
  discovery_methods TEXT[] DEFAULT '{}', -- Array of discovery methods
  challenges_faced TEXT NOT NULL,
  platforms_used TEXT[] DEFAULT '{}', -- Array of platforms used
  current_monetization_methods TEXT[] DEFAULT '{}', -- Array of monetization methods
  community_interest VARCHAR(50) NOT NULL,
  additional_features TEXT, -- Optional field
  feedback TEXT, -- Optional field
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_survey_feedback_user_id ON survey_feedback(user_id);
CREATE INDEX idx_survey_feedback_submitted_at ON survey_feedback(submitted_at);
CREATE INDEX idx_survey_feedback_blogger_experience ON survey_feedback(blogger_experience);
CREATE INDEX idx_survey_feedback_audience_size ON survey_feedback(audience_size);

-- Add RLS (Row Level Security) policies
ALTER TABLE survey_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own survey responses
CREATE POLICY "Users can insert their own survey feedback" ON survey_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own survey responses
CREATE POLICY "Users can view their own survey feedback" ON survey_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all survey responses (for analytics)
CREATE POLICY "Admins can view all survey feedback" ON survey_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_survey_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_feedback_updated_at
  BEFORE UPDATE ON survey_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_feedback_updated_at();

-- Add comments for documentation
COMMENT ON TABLE survey_feedback IS 'Stores survey responses from bloggers during signup process';
COMMENT ON COLUMN survey_feedback.blogger_experience IS 'How long the blogger has been blogging';
COMMENT ON COLUMN survey_feedback.primary_goal IS 'Primary goal for their blog';
COMMENT ON COLUMN survey_feedback.audience_size IS 'Current audience size range';
COMMENT ON COLUMN survey_feedback.content_frequency IS 'How often they publish content';
COMMENT ON COLUMN survey_feedback.discovery_methods IS 'How they currently get discovered';
COMMENT ON COLUMN survey_feedback.challenges_faced IS 'Main challenges they face as a blogger';
COMMENT ON COLUMN survey_feedback.platforms_used IS 'Platforms they currently use for blogging';
COMMENT ON COLUMN survey_feedback.current_monetization_methods IS 'How they currently monetize their blog';
COMMENT ON COLUMN survey_feedback.community_interest IS 'Interest level in blogger community features';
COMMENT ON COLUMN survey_feedback.additional_features IS 'Requested features for the platform';
COMMENT ON COLUMN survey_feedback.feedback IS 'General feedback and suggestions';
