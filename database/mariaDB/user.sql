-- ============================================================
-- File:         01_create_user.sql
-- Author:       Markus Gerstenberg
--
-- Description:
--   Creates the database user for the RvGateway web application
--   and grants the required permissions.
-- ============================================================


-- ============================================================
-- DATABASE USER
-- ============================================================

CREATE USER IF NOT EXISTS 'webapp'@'localhost'
    IDENTIFIED BY 'CHANGE_ME';    --- <- !!! DEFINE PASSWORD !!!


-- ============================================================
-- PERMISSIONS
-- ============================================================

GRANT ALL PRIVILEGES
    ON webapp.*
    TO 'webapp'@'localhost';

FLUSH PRIVILEGES;