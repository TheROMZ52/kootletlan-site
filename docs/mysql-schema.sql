-- این فایل را بعد از انتخاب دیتابیس واقعی سایت اجرا کن.
-- نام دیتابیس از DATABASE_URL خوانده می‌شود و عمداً اینجا hard-code نشده است.

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role ENUM('user','moderator','admin') NOT NULL DEFAULT 'user',
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason VARCHAR(500) NULL,
  banned_until DATETIME NULL,
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
  rank_prefix TEXT NULL,
  rank_suffix TEXT NULL,
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

CREATE TABLE ticket_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT UNSIGNED NOT NULL,
  user_id CHAR(36) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ticket_messages_ticket (ticket_id, created_at),
  KEY idx_ticket_messages_user (user_id, created_at),
  CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE minecraft_link_codes (
  user_id CHAR(36) NOT NULL,
  code CHAR(8) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_minecraft_link_code (code),
  KEY idx_minecraft_link_expires (expires_at),
  CONSTRAINT fk_link_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE minecraft_server_registrations (
  installation_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (installation_id),
  UNIQUE KEY uq_minecraft_server_token (token_hash)
) ENGINE=InnoDB;

CREATE TABLE minecraft_servers (
  server_id VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  installation_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (server_id),
  UNIQUE KEY uq_minecraft_server_installation (installation_id)
) ENGINE=InnoDB;

CREATE TABLE player_server_stats (
  server_id VARCHAR(64) NOT NULL,
  uuid CHAR(36) NOT NULL,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  playtime_minutes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  coins BIGINT NOT NULL DEFAULT 0,
  kills BIGINT UNSIGNED NOT NULL DEFAULT 0,
  deaths BIGINT UNSIGNED NOT NULL DEFAULT 0,
  first_joined_at DATETIME NULL,
  last_seen_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (server_id, uuid),
  KEY idx_player_server_uuid (uuid),
  CONSTRAINT fk_player_server_stats_server FOREIGN KEY (server_id) REFERENCES minecraft_servers(server_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE admin_audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id CHAR(36) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_user_id CHAR(36) NULL,
  target_username VARCHAR(16) NULL,
  details VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at),
  KEY idx_audit_admin (admin_id, created_at),
  KEY idx_audit_target (target_user_id, created_at),
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'system',
  link VARCHAR(500) NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, read_at, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE store_products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  price INT UNSIGNED NOT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'COINS',
  command VARCHAR(500) NULL,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
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