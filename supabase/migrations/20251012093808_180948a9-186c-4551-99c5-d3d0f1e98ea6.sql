-- Make user_id nullable since this form should accept submissions from non-authenticated users
ALTER TABLE market_entry_reports 
ALTER COLUMN user_id DROP NOT NULL;