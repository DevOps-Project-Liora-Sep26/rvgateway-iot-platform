-- ============================================================
-- File:                01_create_user.sql
-- Author:              Markus Gerstenberg
-- Last Changed At:     08.10.2026
-- Last Changed By:     Sebastian Röwer
--
-- Description:
--   Creates the database user for the RvGateway web application
--   and grants the required permissions.
-- ============================================================


-- ============================================================
-- DATABASE USER
-- ============================================================

CREATE USER IF NOT EXISTS '${MARIADB_USER}'@'%'
    IDENTIFIED BY '${MARIADB_PASSWORD}'; 

-- ============================================================
-- PERMISSIONS
-- ============================================================

GRANT ALL PRIVILEGES
    ON ${MARIADB_NAME}.*
    TO '${MARIADB_USER}'@'%';

FLUSH PRIVILEGES;