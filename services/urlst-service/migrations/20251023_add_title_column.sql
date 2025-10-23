-- Migration: Add title column to urls table
-- Date: 2025-10-23

-- Check if title column exists before adding
SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN 'ALTER TABLE urls ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER full_url;'
    ELSE 'SELECT "title column already exists" AS status;'
  END INTO @sql
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'shorturl' 
  AND TABLE_NAME = 'urls' 
  AND COLUMN_NAME = 'title';

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index for faster title searches (optional but recommended)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN 'CREATE INDEX idx_title ON urls(title);'
    ELSE 'SELECT "title index already exists" AS status;'
  END INTO @sql
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'shorturl' 
  AND TABLE_NAME = 'urls' 
  AND INDEX_NAME = 'idx_title';

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
