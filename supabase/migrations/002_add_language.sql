-- Add language column to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tr'));

-- Add language column to user_profiles table  
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tr'));

-- Update existing records to have default language
UPDATE organizations SET language = 'en' WHERE language IS NULL;
UPDATE user_profiles SET language = 'en' WHERE language IS NULL;

