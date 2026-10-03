/* ============================================================
 * File:    [gatewayUID]/setup/page.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Gateway settings component for renaming and deleting
 * an existing gateway.
 * ============================================================
 */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function GatewaySetup() {
  const router = useRouter();
  const params = useParams<{ gatewayUID: string }>();
  const gatewayUid = params.gatewayUID;

  const [name, setName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renameMessage, setRenameMessage] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ==========================================================
     RENAME GATEWAY
     ========================================================== */

  const handleRenameGateway = async () => {
    setRenameError("");
    setRenameMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setRenameError("Gateway name must not be empty.");
      return;
    }

    setRenameLoading(true);

    try {
      const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/gateways/${encodeURIComponent(gatewayUid)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      if (response.status === 401) {
        setRenameError("Your session has expired. Please log in again.");
        return;
      }

      if (response.status === 404) {
        setRenameError("Gateway not found.");
        return;
      }

      if (response.status === 422) {
        setRenameError("Invalid gateway name.");
        return;
      }

      if (!response.ok) {
        setRenameError("Failed to rename gateway.");
        return;
      }

      const data = await response.json();

      window.dispatchEvent(
        new CustomEvent("gateway-renamed", {
          detail: {
            gatewayUid: data.gateway_uid,
            name: data.name,
          },
        })
      );

      setName("");
      setRenameMessage(`Gateway renamed to "${data.name}".`);
    } catch {
      setRenameError("Failed to connect to the server.");
    } finally {
      setRenameLoading(false);
    }
  };

  /* ==========================================================
     DELETE GATEWAY
     ========================================================== */

  const handleDeleteGateway = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gateways/${encodeURIComponent(gatewayUid)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setDeleteError("Your session has expired. Please log in again.");
        return;
      }

      if (response.status === 404) {
        setDeleteError("Gateway not found.");
        return;
      }

      if (!response.ok) {
        setDeleteError("Failed to delete gateway.");
        return;
      }

      router.replace("/portal/gateways");
    } catch {
      setDeleteError("Failed to connect to the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      {/* ======================================================
          RENAME GATEWAY
          ====================================================== */}

      <div className="settings-section">
        <h3>Rename Gateway</h3>

        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleRenameGateway();
          }}
        >
          <div className="settings-input-group">
            <input
              id="gateway-name"
              type="text"
              placeholder="New Name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setRenameError("");
                setRenameMessage("");
              }}
              disabled={renameLoading}
            />
          </div>

          {renameError && (
            <div className="settings-error">
              {renameError}
            </div>
          )}

          {renameMessage && (
            <div className="settings-success">
              {renameMessage}
            </div>
          )}

            <button
              type="submit"
              className="portal-button primary settings-button"
              disabled={renameLoading}
            >
            {renameLoading ? "Renaming..." : "Rename Gateway"}
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
          Permanently delete this gateway and
          all associated data.
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
            Delete Gateway
          </button>
        ) : (
          <div className="delete-confirmation">
            <p>
              Are you sure you want to permanently
              delete this gateway?
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
                onClick={handleDeleteGateway}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Gateway"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}