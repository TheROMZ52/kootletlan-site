-- MariaDB schema for the store. (The old file used PostgreSQL syntax, which MariaDB rejects.)
-- The `players` table is created by the kootletland-sync plugin; this file only adds the store tables.
-- Run once on the same database the plugin uses.

CREATE TABLE IF NOT EXISTS store_products (
  id          VARCHAR(64)  NOT NULL PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT         NULL,
  price       BIGINT       NOT NULL DEFAULT 0,
  currency    VARCHAR(16)  NOT NULL DEFAULT 'COINS',
  category    VARCHAR(64)  NULL,
  accent      VARCHAR(32)  NULL,
  popular     TINYINT(1)   NOT NULL DEFAULT 0,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS store_purchases (
  id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_uuid VARCHAR(36)  NOT NULL,
  product_id  VARCHAR(64)  NOT NULL,
  amount      BIGINT       NOT NULL,
  currency    VARCHAR(16)  NOT NULL DEFAULT 'COINS',
  status      VARCHAR(24)  NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_purchases_player (player_uuid, created_at),
  INDEX idx_purchases_product (product_id)
) DEFAULT CHARSET = utf8mb4;

-- Add a rank/package (edit and run for each product). `price` is in `currency` units.
-- INSERT INTO store_products (id, name, slug, description, price, currency, category, popular, active)
-- VALUES ('vip', 'VIP', 'vip', 'توضیح کوتاه پکیج', 250, 'COINS', 'rank', 0, 1)
-- ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price),
--                         popular = VALUES(popular), active = VALUES(active);
