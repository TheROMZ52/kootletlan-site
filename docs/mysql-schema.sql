CREATE DATABASE IF NOT EXISTS kootletland CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kootletland;

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE profiles (
  user_id CHAR(36) NOT NULL,
  minecraft_uuid CHAR(36) NULL,
  minecraft_nickname VARCHAR(16) NULL,
  display_name VARCHAR(32) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_profiles_minecraft_uuid (minecraft_uuid),
  KEY idx_profiles_minecraft_nickname (minecraft_nickname),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE players (
  uuid CHAR(36) NOT NULL,
  username VARCHAR(16) NOT NULL,
  skin_url VARCHAR(512) NULL,
  rank_name VARCHAR(64) NULL,
  rank_prefix VARCHAR(64) NULL,
  rank_suffix VARCHAR(64) NULL,
  rank_weight INT NOT NULL DEFAULT 0,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  playtime_minutes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  coins BIGINT NOT NULL DEFAULT 0,
  kills BIGINT UNSIGNED NOT NULL DEFAULT 0,
  deaths BIGINT UNSIGNED NOT NULL DEFAULT 0,
  first_joined_at DATETIME NULL,
  last_seen_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (uuid),
  UNIQUE KEY uq_players_username (username),
  KEY idx_players_last_seen (last_seen_at)
) ENGINE=InnoDB;

CREATE TABLE news (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(200) NOT NULL,
  excerpt VARCHAR(500) NOT NULL,
  category VARCHAR(64) NOT NULL,
  content LONGTEXT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_slug (slug),
  KEY idx_news_listing (pinned, published_at)
) ENGINE=InnoDB;

CREATE TABLE support_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  subject VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','pending','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tickets_user (user_id),
  KEY idx_tickets_status (status, created_at),
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE store_products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  price INT UNSIGNED NOT NULL,
  command VARCHAR(500) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_active (active, id)
) ENGINE=InnoDB;

CREATE TABLE store_purchases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_uuid CHAR(36) NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  price_paid INT UNSIGNED NOT NULL,
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_purchases_player (player_uuid, created_at),
  KEY idx_purchases_product (product_id),
  CONSTRAINT fk_purchases_player FOREIGN KEY (player_uuid) REFERENCES players(uuid) ON DELETE RESTRICT,
  CONSTRAINT fk_purchases_product FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sessions (
  id CHAR(64) NOT NULL,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
