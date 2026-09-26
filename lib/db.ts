import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null
let ready: Promise<void> | null = null

async function initializeDatabase(target: mysql.Pool) {
  await target.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL,
      username VARCHAR(16) NOT NULL,
      email VARCHAR(320) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      role ENUM('user','moderator','admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_username (username),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB
  `)

  const [accountColumns] = await target.query<any[]>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name IN ('is_banned','ban_reason','banned_until')"
  )
  const accountColumnNames = new Set(accountColumns.map((row: any) => row.column_name))
  if (!accountColumnNames.has('is_banned')) await target.query("ALTER TABLE users ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT FALSE")
  if (!accountColumnNames.has('ban_reason')) await target.query("ALTER TABLE users ADD COLUMN ban_reason VARCHAR(500) NULL")
  if (!accountColumnNames.has('banned_until')) await target.query("ALTER TABLE users ADD COLUMN banned_until DATETIME NULL")

  const [roleColumns] = await target.query<any[]>(
    "SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role'"
  )
  if (Number(roleColumns[0]?.count ?? 0) === 0) {
    await target.query("ALTER TABLE users ADD COLUMN role ENUM('user','moderator','admin') NOT NULL DEFAULT 'user'")
  }

  if (process.env.ADMIN_EMAIL) {
    await target.execute("UPDATE users SET role = 'admin' WHERE email = ?", [process.env.ADMIN_EMAIL.trim().toLowerCase()])
  }

  const [profileColumns] = await target.query<any[]>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'profiles'"
  )
  const profileColumnNames = new Set(profileColumns.map((row: any) => row.column_name))
  if (!profileColumnNames.has('minecraft_uuid')) await target.query("ALTER TABLE profiles ADD COLUMN minecraft_uuid CHAR(36) NULL")
  if (!profileColumnNames.has('minecraft_nickname')) await target.query("ALTER TABLE profiles ADD COLUMN minecraft_nickname VARCHAR(16) NULL")
  if (!profileColumnNames.has('display_name')) await target.query("ALTER TABLE profiles ADD COLUMN display_name VARCHAR(32) NULL")
  if (!profileColumnNames.has('created_at')) await target.query("ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP")
  if (!profileColumnNames.has('updated_at')) await target.query("ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")

  await target.query(`
    CREATE TABLE IF NOT EXISTS profiles (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS players (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS news (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      ticket_id BIGINT UNSIGNED NOT NULL,
      user_id CHAR(36) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_ticket_messages_ticket (ticket_id, created_at),
      CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      CONSTRAINT fk_ticket_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)

  const [linkCodeColumns] = await target.query<any[]>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'minecraft_link_codes'"
  )
  const linkCodeColumnNames = new Set(linkCodeColumns.map((row: any) => row.column_name))
  if (linkCodeColumnNames.size > 0) {
    if (!linkCodeColumnNames.has('user_id')) await target.query("ALTER TABLE minecraft_link_codes ADD COLUMN user_id CHAR(36) NOT NULL")
    if (!linkCodeColumnNames.has('code')) await target.query("ALTER TABLE minecraft_link_codes ADD COLUMN code CHAR(8) NOT NULL")
    if (!linkCodeColumnNames.has('expires_at')) await target.query("ALTER TABLE minecraft_link_codes ADD COLUMN expires_at DATETIME NOT NULL")
    if (!linkCodeColumnNames.has('created_at')) await target.query("ALTER TABLE minecraft_link_codes ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP")
  }

  await target.query(`
    CREATE TABLE IF NOT EXISTS minecraft_link_codes (
      user_id CHAR(36) NOT NULL,
      code CHAR(8) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id),
      UNIQUE KEY uq_minecraft_link_code (code),
      CONSTRAINT fk_link_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS minecraft_server_registrations (
      installation_id CHAR(36) NOT NULL,
      token_hash CHAR(64) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (installation_id),
      UNIQUE KEY uq_minecraft_server_token (token_hash)
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS notifications (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS store_products (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS store_purchases (
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
    ) ENGINE=InnoDB
  `)

  await target.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(64) NOT NULL,
      user_id CHAR(36) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_sessions_user (user_id),
      KEY idx_sessions_expires (expires_at),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)
}

function getPool() {
  if (pool) return pool
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not configured')
  pool = mysql.createPool(url)
  ready = initializeDatabase(pool)
  return pool
}

export const db = new Proxy({} as mysql.Pool, {
  get(_, property) {
    const target = getPool() as any
    const value = target[property]
    if (typeof value !== 'function') return value
    return async (...args: any[]) => {
      await ready
      return value.apply(target, args)
    }
  }
})
