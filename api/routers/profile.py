# ============================================================
# File:         profile.py
# Author:       Markus Gerstenberg
#
# Description:
#   Profile API routes for retrieving, updating and
#   deleting the authenticated user profile.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, Depends, HTTPException, Response

from auth import get_current_user, ph, SESSION_COOKIE_NAME
from db_mariadb import get_db_connection
from models import ChangePasswordRequest, PasswordChangeResponse, ProfileDeleteResponse, UserResponse


# ============================================================
# ROUTER CONFIGURATION
# ============================================================

router = APIRouter()


# ============================================================
# API - CURRENT USER
# ============================================================

# *************************************************
# Function:    get_me
# Description: Returns information about the
#              currently authenticated user.
# Parameters:  user - Authenticated user resolved
#                     by get_current_user
# Returns:     User ID and email address
# Notes:       Requires a valid server-side session.
# *************************************************
@router.get(
    "/api/me",
    response_model=UserResponse,
    tags=["Profile"],
    summary="Get current user",
    description=(
        "Returns the unique user ID and email address of the "
        "currently authenticated user. A valid session cookie "
        "is required."
    ),
    responses={
        200: {
            "description": "Current user information.",
        },
        401: {
            "description": "No valid session exists.",
        },
    },
)
def get_me(
    user=Depends(get_current_user),
):

    return {
        "id": user["id"],
        "email": user["email"],
    }


# ============================================================
# API - CHANGE PASSWORD
# ============================================================

# *************************************************
# Function:    change_password
# Description: Changes the password of the
#              currently authenticated user.
# Parameters:  credentials - Current and new
#                            password
#              user        - Authenticated user
# Returns:     Password change status
# Notes:       The current password must be valid
#              and the new password must differ
#              from the existing password.
# *************************************************
@router.put(
    "/api/profile/password",
    response_model=PasswordChangeResponse,
    tags=["Profile"],
    summary="Change user password",
    description=(
        "Changes the password of the currently authenticated user. "
        "The current password must be provided and must be valid. "
        "The new password must differ from the current password."
    ),
    responses={
        200: {
            "description": "Password successfully changed.",
        },
        400: {
            "description": "New password matches the current password.",
        },
        401: {
            "description": "No valid session exists.",
        },
        403: {
            "description": "Current password is incorrect.",
        },
        404: {
            "description": "User does not exist.",
        },
    },
)
def change_password(
    credentials: ChangePasswordRequest,
    user=Depends(get_current_user),
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Load current password hash
        cursor.execute(
            """
            SELECT password_hash
            FROM users
            WHERE id = ?
            """,
            (user["id"],),
        )

        result = cursor.fetchone()

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        password_hash = result[0]

        # Verify current password
        try:
            ph.verify(
                password_hash,
                credentials.current_password,
            )

        except VerifyMismatchError:
            raise HTTPException(
                status_code=403,
                detail="Current password is incorrect",
            )

        # Verify that the new password differs from the current one
        try:
            ph.verify(
                password_hash,
                credentials.new_password,
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "New password must be different "
                    "from current password"
                ),
            )

        except VerifyMismatchError:
            pass

        # Generate hash for new password
        new_password_hash = ph.hash(
            credentials.new_password
        )

        # Update password in database
        cursor.execute(
            """
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            """,
            (
                new_password_hash,
                user["id"],
            ),
        )

        conn.commit()

        return {
            "password_changed": True,
        }

    finally:
        cursor.close()
        conn.close()

# ============================================================
# API - DELETE PROFILE
# ============================================================

# *************************************************
# Function:    delete_profile
# Description: Deletes the currently authenticated
#              user account.
# Parameters:  response - FastAPI response
#              user     - Authenticated user
# Returns:     Profile deletion status
# Notes:       Associated sessions are deleted by
#              the database through ON DELETE
#              CASCADE. The browser session cookie
#              is removed after successful deletion.
# *************************************************
@router.delete(
    "/api/profile",
    response_model=ProfileDeleteResponse,
    tags=["Profile"],
    summary="Delete user profile",
    description=(
        "Permanently deletes the currently authenticated user "
        "account. Associated sessions are automatically removed "
        "through the database foreign key constraint and the "
        "session cookie is deleted from the client."
    ),
    responses={
        200: {
            "description": "User profile successfully deleted.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "User does not exist.",
        },
    },
)
def delete_profile(
    response: Response,
    user=Depends(get_current_user),
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Delete user account.
        # Associated sessions are removed by ON DELETE CASCADE.
        cursor.execute(
            """
            DELETE FROM users
            WHERE id = ?
            """,
            (user["id"],),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        conn.commit()

        # Remove session cookie from browser
        response.delete_cookie(
            key=SESSION_COOKIE_NAME,
            path="/",
        )

        return {
            "profile_deleted": True,
        }

    finally:
        cursor.close()
        conn.close()

