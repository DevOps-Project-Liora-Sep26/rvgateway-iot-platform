# ============================================================
# File:         db_mariadb.py
# Author:       Markus Gerstenberg
#
# Description:
#   MariaDB database connection and helper functions for
#   the RvGateway Web API.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

import os

import mariadb


# ============================================================
# MARIADB - CONNECTION
# ============================================================

# *************************************************
# Function:    get_db_connection
# Description: Creates a new connection to the
#              MariaDB database.
# Parameters:  None
# Returns:     MariaDB database connection
# Notes:       Database configuration is loaded
#              from environment variables.
# *************************************************
def get_db_connection():
    return mariadb.connect(
        host=os.getenv("MARIA_DB_HOST"),
        port=int(os.getenv("MARIA_DB_PORT", "3306")),
        user=os.getenv("MARIA_DB_USER"),
        password=os.getenv("MARIA_DB_PASSWORD"),
        database=os.getenv("MARIA_DB_NAME"),
    )


# ============================================================
# GATEWAYS
# ============================================================

# *************************************************
# Function:    get_gateways_by_user
# Description: Returns all gateways assigned to a
#              specific user.
# Parameters:  user_id - Database ID of the user
# Returns:     List of assigned gateways
# *************************************************
def get_gateways_by_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                g.gateway_uid,
                ug.name
            FROM user_gateways ug
            JOIN gateways g
                ON g.id = ug.gateway_id
            WHERE ug.user_id = ?
            ORDER BY g.id
            """,
            (user_id,),
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


# *************************************************
# Function:    get_gateway_id
# Description: Returns the database ID of a gateway
#              identified by its gateway UID.
# Parameters:  gateway_uid - Unique gateway identifier
# Returns:     Gateway database ID or None
# *************************************************
def get_gateway_id(gateway_uid: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM gateways
            WHERE gateway_uid = ?
            """,
            (gateway_uid,),
        )

        result = cursor.fetchone()

        if result is None:
            return None

        return result[0]

    finally:
        cursor.close()
        conn.close()


# *************************************************
# Function:    create_gateway
# Description: Creates a new gateway entry.
# Parameters:  gateway_uid - Unique gateway identifier
# Returns:     Database ID of the created gateway
# *************************************************
def create_gateway(gateway_uid: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO gateways (
                gateway_uid
            )
            VALUES (?)
            """,
            (gateway_uid,),
        )

        conn.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        conn.close()


# *************************************************
# Function:    is_gateway_assigned_to_user
# Description: Checks whether a gateway is already
#              assigned to a specific user.
# Parameters:  user_id    - Database ID of the user
#              gateway_id - Database ID of the gateway
# Returns:     True if assigned, otherwise False
# *************************************************
def is_gateway_assigned_to_user(
    user_id: int,
    gateway_id: int,
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT 1
            FROM user_gateways
            WHERE user_id = ?
            AND gateway_id = ?
            """,
            (
                user_id,
                gateway_id,
            ),
        )

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        conn.close()


# *************************************************
# Function:    assign_gateway_to_user
# Description: Assigns a gateway to a user and
#              stores the user-defined gateway name.
# Parameters:  user_id    - Database ID of the user
#              gateway_id - Database ID of the gateway
#              name       - User-defined gateway name
# Returns:     None
# *************************************************
def assign_gateway_to_user(
    user_id: int,
    gateway_id: int,
    name: str | None,
):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO user_gateways (
                user_id,
                gateway_id,
                name
            )
            VALUES (?, ?, ?)
            """,
            (
                user_id,
                gateway_id,
                name,
            ),
        )

        conn.commit()

    finally:
        cursor.close()
        conn.close()

# *************************************************
# Function:    rename_gateway_for_user
# Description: Updates the user-defined name of a
#              gateway assigned to a specific user.
# Parameters:  user_id     - Database ID of the user
#              gateway_uid - Unique gateway identifier
#              name        - New gateway name
# Returns:     True if updated, otherwise False
# *************************************************
def rename_gateway_for_user(
    user_id: int,
    gateway_uid: str,
    name: str,
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT ug.gateway_id
            FROM user_gateways ug
            JOIN gateways g
                ON g.id = ug.gateway_id
            WHERE ug.user_id = ?
            AND g.gateway_uid = ?
            """,
            (
                user_id,
                gateway_uid,
            ),
        )

        if cursor.fetchone() is None:
            return False

        cursor.execute(
            """
            UPDATE user_gateways ug
            JOIN gateways g
                ON g.id = ug.gateway_id
            SET ug.name = ?
            WHERE ug.user_id = ?
            AND g.gateway_uid = ?
            """,
            (
                name,
                user_id,
                gateway_uid,
            ),
        )

        conn.commit()

        return True

    finally:
        cursor.close()
        conn.close()

# *************************************************
# Function:    delete_gateway_for_user
# Description: Removes the assignment of a gateway
#              from a specific user.
# Parameters:  user_id     - Database ID of the user
#              gateway_uid - Unique gateway identifier
# Returns:     True if deleted, otherwise False
# *************************************************
def delete_gateway_for_user(
    user_id: int,
    gateway_uid: str,
) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            DELETE ug
            FROM user_gateways ug
            JOIN gateways g
                ON g.id = ug.gateway_id
            WHERE ug.user_id = ?
            AND g.gateway_uid = ?
            """,
            (
                user_id,
                gateway_uid,
            ),
        )

        deleted = cursor.rowcount > 0
        conn.commit()

        return deleted

    finally:
        cursor.close()
        conn.close()