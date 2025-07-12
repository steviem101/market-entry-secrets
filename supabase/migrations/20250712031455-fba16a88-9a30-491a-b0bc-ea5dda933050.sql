-- Add sector field to events table
ALTER TABLE events ADD COLUMN sector text;

-- Add default values for existing events based on categories
UPDATE events 
SET sector = CASE 
    WHEN category IN ('Technology', 'Tech', 'Innovation', 'Digital') THEN 'Technology'
    WHEN category IN ('Healthcare', 'Medical', 'Health') THEN 'Healthcare'
    WHEN category IN ('Finance', 'Financial', 'Banking', 'Investment') THEN 'Finance'
    WHEN category IN ('Manufacturing', 'Industrial') THEN 'Manufacturing'
    WHEN category IN ('Education', 'Learning', 'Training') THEN 'Education'
    WHEN category IN ('Government', 'Public') THEN 'Government'
    WHEN category IN ('Retail', 'Commerce', 'Trade') THEN 'Retail'
    WHEN category IN ('Agriculture', 'Farming', 'Food') THEN 'Agriculture'
    WHEN category IN ('Energy', 'Renewable', 'Mining') THEN 'Energy'
    WHEN category IN ('Tourism', 'Travel', 'Hospitality') THEN 'Tourism'
    ELSE 'Other'
END;