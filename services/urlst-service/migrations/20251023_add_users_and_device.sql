-- Migration: create users table and add owner_id/device_id to urls 

-- 1) create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) add owner_id column if missing
SET @cnt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'urls' AND COLUMN_NAME = 'owner_id'
);
SET @sql := IF(@cnt = 0, 'ALTER TABLE urls ADD COLUMN owner_id INT NULL', 'SELECT "owner_id exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) add device_id column if missing
SET @cnt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'urls' AND COLUMN_NAME = 'device_id'
);
SET @sql := IF(@cnt = 0, "ALTER TABLE urls ADD COLUMN device_id VARCHAR(128) NULL", 'SELECT "device_id exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) create idx_urls_owner_id if missing
SET @cnt := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'urls' AND INDEX_NAME = 'idx_urls_owner_id'
);
SET @sql := IF(@cnt = 0, 'CREATE INDEX idx_urls_owner_id ON urls (owner_id)', 'SELECT "idx owner exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5) create idx_urls_device_id if missing
SET @cnt := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'urls' AND INDEX_NAME = 'idx_urls_device_id'
);
SET @sql := IF(@cnt = 0, 'CREATE INDEX idx_urls_device_id ON urls (device_id)', 'SELECT "idx device exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6) add foreign key fk_urls_user if missing
SET @cnt := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'urls' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_urls_user'
);
SET @sql := IF(@cnt = 0, 'ALTER TABLE urls ADD CONSTRAINT fk_urls_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL', 'SELECT "fk exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
