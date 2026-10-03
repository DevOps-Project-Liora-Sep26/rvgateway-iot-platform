# ============================================================
# File:         auth.py
# Author:       Markus Gerstenberg
#
# Description:
#   Authentication and server-side session helpers for
#   the RvGateway Web API.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from fastapi import HTTPException, Request

from db_mariadb import get_db_connection


# ============================================================
# PASSWORD HASHING
# ============================================================

ph = PasswordHasher()


# ============================================================
# SESSION CONFIGURATION
# ============================================================

SESSION_COOKIE_NAME = "session_id"
SESSION_DURATION = timedelta(days=7)


# ============================================================
# AUTHENTICATION
# ============================================================

# *************************************************
# Function:    get_current_user
# Description: Resolves the currently authenticated
#              user from the session cookie.
# Parameters:  request - FastAPI request containing
#                        the session cookie
# Returns:     Dictionary containing user ID, email
#              and session ID
# Notes:       Raises HTTP 401 if the session does
#              not exist, is invalid or has expired.
# *************************************************
def get_current_user(request: Request):

    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Load user and session information
        cursor.execute(
            """
            SELECT
                users.id,
                users.email,
                sessions.expires_at
            FROM sessions
            JOIN users
                ON users.id = sessions.user_id
            WHERE sessions.session_id = ?
            """,
            (session_id,),
        )

        result = cursor.fetchone()

        if result is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid session",
            )

        user_id = result[0]
        email = result[1]
        expires_at = result[2]

        # MariaDB DATETIME does not contain timezone information
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # Remove expired session
        if expires_at <= now:
            cursor.execute(
                """
                DELETE FROM sessions
                WHERE session_id = ?
                """,
                (session_id,),
            )

            conn.commit()

            raise HTTPException(
                status_code=401,
                detail="Session expired",
            )

        return {
            "id": user_id,
            "email": email,
            "session_id": session_id,
        }

    finally:
        cursor.close()
        conn.close()

