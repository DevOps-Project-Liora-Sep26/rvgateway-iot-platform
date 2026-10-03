/* ============================================================
 * File:    profile/page.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays and manages the user profile.
 *
 * Loads the current user information and provides functionality
 * for changing the password and deleting the user profile.
 * ============================================================
 */
"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

/* ============================================================
 * TYPES
 * ============================================================ */

interface User {
  id: number;
  email: string;
}

/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function Profile() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPasswords, setShowNewPasswords] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ==========================================================
     LOAD CURRENT USER
     ========================================================== */

  useEffect(() => {
    const loadUser = async () => {
      setUserError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.status === 401) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load user.");
        }

        const data: User = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        console.error("Failed to load user:", error);
        setUserError("Unable to load account information.");
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, [router]);

  /* ==========================================================
     CHANGE PASSWORD
     ========================================================== */

  const handleChangePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !repeatPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("New passwords do not match.");
      setNewPassword("");
      setRepeatPassword("");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setRepeatPassword("");
        setPasswordMessage("Password changed successfully.");
        return;
      }

      if (response.status === 403) {
        setCurrentPassword("");
        setPasswordError("Current password is incorrect.");
        return;
      }

      setPasswordError("Unable to change password.");
    } catch (error) {
      console.error("Password change failed:", error);
      setPasswordError("Unable to connect to the server.");
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ==========================================================
     DELETE PROFILE
     ========================================================== */

  const handleDeleteProfile = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        setDeleteError("Unable to delete profile.");
        return;
      }

      router.replace("/");
    } catch (error) {
      console.error("Delete profile failed:", error);
      setDeleteError("Unable to connect to the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="settings-panel">
      <h2>Profile</h2>

      {/* ======================================================
          ACCOUNT
          ====================================================== */}

      <div className="settings-section">
        <label>Email</label>
        <div className="profile-email">
          {userLoading
            ? "Loading..."
            : userError
              ? userError
              : userEmail}
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      <div className="settings-divider" />
      {/* ------------------------------------------------------ */}

      {/* ======================================================
          CHANGE PASSWORD
          ====================================================== */}

      <div className="settings-section">
        <h3>Change Password</h3>

        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleChangePassword();
          }}
        >
          <div className="settings-input-group">
            <label htmlFor="current-password">Current Password</label>

            <div className="password-input-wrapper">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setPasswordError("");
                  setPasswordMessage("");
                }}
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
              >
                {showCurrentPassword
                  ? <Eye size={20} />
                  : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="settings-input-group">
            <label htmlFor="new-password">New Password</label>

            <div className="password-input-wrapper">
              <input
                id="new-password"
                type={showNewPasswords ? "text" : "password"}
                placeholder="New Password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError("");
                  setPasswordMessage("");
                }}
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowNewPasswords(!showNewPasswords)}
                aria-label={
                  showNewPasswords ? "Hide passwords" : "Show passwords"
                }
              >
                {showNewPasswords
                  ? <Eye size={20} />
                  : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="settings-input-group">
            <label htmlFor="repeat-new-password">Repeat Password</label>

            <div className="password-input-wrapper">
              <input
                id="repeat-new-password"
                type={showNewPasswords ? "text" : "password"}
                placeholder="Repeat Password"
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(event) => {
                  setRepeatPassword(event.target.value);
                  setPasswordError("");
                  setPasswordMessage("");
                }}
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowNewPasswords(!showNewPasswords)}
                aria-label={
                  showNewPasswords ? "Hide passwords" : "Show passwords"
                }
              >
                {showNewPasswords
                  ? <Eye size={20} />
                  : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="settings-error">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="settings-success">
              {passwordMessage}
            </div>
          )}

          <button
            type="submit"
            className="portal-button primary settings-button"
            disabled={passwordLoading}
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* ------------------------------------------------------ */}
      <div className="settings-divider" />
      {/* ------------------------------------------------------ */}

      {/* ======================================================
          DANGER ZONE
          ====================================================== */}

      <div className="settings-section danger-section">
        <h3>Danger Zone</h3>

        <p>
          Permanently delete your profile and all associated data.
        </p>

        {!deleteConfirm ? (
          <button
            type="button"
            className="portal-button danger"
            onClick={() => {
              setDeleteConfirm(true);
              setDeleteError("");
            }}
          >
            Delete Profile
          </button>
        ) : (
          <div className="delete-confirmation">
            <p>
              Are you sure you want to permanently delete your profile?
            </p>

            {deleteError && (
              <div className="settings-error">
                {deleteError}
              </div>
            )}

            <div className="delete-confirmation-buttons">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteError("");
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="portal-button danger"
                onClick={handleDeleteProfile}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}