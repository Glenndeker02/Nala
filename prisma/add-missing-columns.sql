-- Add missing stripe_account_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT UNIQUE;

-- Add missing updated_at column to users table if needed
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing updated_at column to video_formats table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'video_formats') THEN
        ALTER TABLE video_formats 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
