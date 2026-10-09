-- ============================================================
-- DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS `${MARIADB_NAME}`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE '${MARIADB_NAME}';


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
);


-- ============================================================
-- SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,

    PRIMARY KEY (session_id),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- GATEWAYS
-- ============================================================

CREATE TABLE IF NOT EXISTS gateways (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    gateway_uid VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_gateways_uid (gateway_uid)
);


-- ============================================================
-- USER GATEWAYS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_gateways (
    user_id BIGINT UNSIGNED NOT NULL,
    gateway_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100),

    PRIMARY KEY (user_id, gateway_id),

    CONSTRAINT fk_user_gateways_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_gateways_gateway
        FOREIGN KEY (gateway_id)
        REFERENCES gateways(id)
        ON DELETE CASCADE
);