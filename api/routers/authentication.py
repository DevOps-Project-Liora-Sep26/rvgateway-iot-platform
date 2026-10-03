# ============================================================
# File:         authentication.py
# Author:       Markus Gerstenberg
#
# Description:
#   Authentication API routes for user registration,
#   login and logout.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

import secrets

from datetime import datetime, timezone

from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, HTTPException, Request, Response

from auth import ph, SESSION_COOKIE_NAME, SESSION_DURATION
from db_mariadb import get_db_connection
from models import LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse


# ============================================================
# ROUTER CONFIGURATION
# ============================================================

router = APIRouter()


# ============================================================
# API - REGISTER
# ============================================================

# *************************************************
# Function:    register
# Description: Creates a new user account.
# Parameters:  credentials - User registration data
# Returns:     Registration status
# Notes:       Passwords are stored as Argon2
#              password hashes. Duplicate email
#              addresses are rejected.
# *************************************************
@router.post(
    "/api/register",
    status_code=201,
    response_model=RegisterResponse,
    tags=["Authentication"],
    summary="Register a new user",
    description=(
        "Creates a new user account using an email address and "
        "password. The password is hashed using Argon2 before it "
        "is stored in the database."
    ),
    responses={
        201: {
            "description": "User successfully registered.",
        },
        409: {
            "description": "Email address is already registered.",
        },
    },
)
def register(credentials: RegisterRequest):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if email address is already registered
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = ?
            """,
            (credentials.email,),
        )

        if cursor.fetchone() is not None:
            raise HTTPException(
                status_code=409,
                detail="Email already registered",
            )

        # Hash password before storing it
        password_hash = ph.hash(credentials.password)

        # Create user
        cursor.execute(
            """
            INSERT INTO users (
                email,
                password_hash
            )
            VALUES (?, ?)
            """,
            (
                credentials.email,
                password_hash,
            ),
        )

        conn.commit()

        return {
            "registered": True,
        }

    finally:
        cursor.close()
        conn.close()

# ============================================================
# API - LOGIN
# ============================================================

# *************************************************
# Function:    login
# Description: Authenticates a user and creates
#              a new server-side session.
# Parameters:  credentials - User login data
#              response    - FastAPI response
# Returns:     Authentication status
# Notes:       Stores the session in MariaDB and
#              sends the session ID as an HttpOnly
#              cookie to the client.
# *************************************************
@router.post(
    "/api/login",
    response_model=LoginResponse,
    tags=["Authentication"],
    summary="Authenticate user",
    description=(
        "Authenticates a registered user using email address and "
        "password. A new server-side session is created after "
        "successful authentication. The session identifier is "
        "stored in an HttpOnly cookie on the client."
    ),
    responses={
        200: {
            "description": "Authentication successful.",
        },
        401: {
            "description": "Invalid email address or password.",
        },
    },
)
def login(
    credentials: LoginRequest,
    response: Response,
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Load user credentials
        cursor.execute(
            """
            SELECT
                id,
                password_hash
            FROM users
            WHERE email = ?
            """,
            (credentials.email,),
        )

        result = cursor.fetchone()

        if result is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials",
            )

        user_id = result[0]
        password_hash = result[1]

        # Verify supplied password
        try:
            ph.verify(
                password_hash,
                credentials.password,
            )

        except VerifyMismatchError:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials",
            )

        # Upgrade password hash if Argon2 settings have changed
        if ph.check_needs_rehash(password_hash):

            new_hash = ph.hash(credentials.password)

            cursor.execute(
                """
                UPDATE users
                SET password_hash = ?
                WHERE id = ?
                """,
                (
                    new_hash,
                    user_id,
                ),
            )

        # Generate cryptographically secure session ID
        session_id = secrets.token_urlsafe(32)

        expires_at = (
            datetime.now(timezone.utc)
            + SESSION_DURATION
        ).replace(tzinfo=None)

        # Store server-side session
        cursor.execute(
            """
            INSERT INTO sessions (
                session_id,
                user_id,
                expires_at
            )
            VALUES (?, ?, ?)
            """,
            (
                session_id,
                user_id,
                expires_at,
            ),
        )

        conn.commit()

        # Store session ID in HttpOnly browser cookie
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,

            # Prevent JavaScript access to the cookie
            httponly=True,

            # Disabled for localhost HTTP development.
            # Must be enabled when using HTTPS in production.
            secure=False,

            # Restrict cross-site cookie transmission
            samesite="lax",

            # Keep cookie lifetime synchronized with server session
            max_age=int(
                SESSION_DURATION.total_seconds()
            ),

            path="/",
        )

        return {
            "authenticated": True,
        }

    finally:
        cursor.close()
        conn.close()



# ============================================================
# API - LOGOUT
# ============================================================

# *************************************************
# Function:    logout
# Description: Terminates the current user session.
# Parameters:  request  - FastAPI request
#              response - FastAPI response
# Returns:     Authentication status
# Notes:       Deletes both the server-side session
#              and the browser session cookie.
# *************************************************
@router.post(
    "/api/logout",
    response_model=LogoutResponse,
    tags=["Authentication"],
    summary="Logout current user",
    description=(
        "Terminates the current server-side session and removes "
        "the session cookie from the client."
    ),
    responses={
        200: {
            "description": "User successfully logged out.",
        },
    },
)
def logout(
    request: Request,
    response: Response,
):

    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    # Delete server-side session if available
    if session_id:

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                DELETE FROM sessions
                WHERE session_id = ?
                """,
                (session_id,),
            )

            conn.commit()

        finally:
            cursor.close()
            conn.close()

    # Remove session cookie from browser
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
    )

    return {
        "authenticated": False,
    }

