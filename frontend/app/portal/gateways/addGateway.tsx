/* ============================================================
 * File:    addGateway.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides the interface and logic for associating a new
 * gateway with the current user.
 * ============================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddGatewayProps {
  onGatewayAdded: () => void;
}


export default function AddGateway(
  {
    onGatewayAdded,
  }: AddGatewayProps) {

  const router = useRouter();

  // ============================================================
  // ADD GATEWAY STATE
  // ============================================================

  const [gatewayUid, setGatewayUid] =
    useState("");

  const [gatewayMessage, setGatewayMessage] =
    useState("");

  const [gatewayError, setGatewayError] =
    useState("");

  const [gatewayInfo, setGatewayInfo] =
    useState("");

  const [gatewayLoading, setGatewayLoading] =
    useState(false);

  // ============================================================
  // ADD GATEWAY
  // ============================================================

  const handleAddGateway = async () => {
    setGatewayMessage("");
    setGatewayError("");
    setGatewayInfo("");

    // ----------------------------------------------------------
    // CLIENT VALIDATION
    // ----------------------------------------------------------

    const uid = gatewayUid.trim();

    if (!uid) {
      setGatewayInfo(
        "Missing UID."
      );

      return;
    }

    // ----------------------------------------------------------
    // API REQUEST
    // ----------------------------------------------------------

    setGatewayLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gateways`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            gateway_uid: uid,
          }),
        }
      );

      // Session expired
      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (response.status === 201) {
        setGatewayUid("");
        setGatewayMessage("Gateway added");
        onGatewayAdded();
        return;
      }

      if (response.status === 404) {
        setGatewayError("Gateway not found");
        return;
      }

      if (response.status === 409) {
        setGatewayInfo("Gateway already added");
        return;
      }

      if (response.status === 422) {
        setGatewayError("Invalid UID");
        return;
      }

      setGatewayError(
        "Unable to add gateway."
      );

    } catch (error) {
      console.error(
        "Add gateway failed:",
        error
      );

      setGatewayError(
        "Unable to connect to the server."
      );

    } finally {
      setGatewayLoading(false);
    }
  };

  // ============================================================
  // ADD GATEWAY FORM
  // ============================================================

  return (
    <div className="add-gateway-panel">

      <h2>
        Add Gateway
      </h2>

      <div className="add-gateway-form">

        {/* ------------------------------------------------------
            GATEWAY UID
            ------------------------------------------------------ */}

        <input
          type="text"
          placeholder="Gateway UID"
          className="gateway-name-input"
          value={gatewayUid}
          autoComplete="off"
          onChange={(event) => {
            setGatewayUid(event.target.value);
            setGatewayError("");
            setGatewayMessage("");
            setGatewayInfo("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAddGateway();
            }
          }}
          disabled={gatewayLoading}
        />


        {/* ------------------------------------------------------
            ADD BUTTON
            ------------------------------------------------------ */}

        <button
          type="button"
          className="add-gateway-button"
          aria-label="Add Gateway"
          onClick={handleAddGateway}
          disabled={gatewayLoading}
        >
          {gatewayLoading ? "..." : "+"}
        </button>


        {/* ------------------------------------------------------
            STATUS MESSAGES
            ------------------------------------------------------ */}

        {gatewayInfo && (
          <span className="gateway-add-message info">
            {gatewayInfo}
          </span>
        )}

        {gatewayError && (
          <span className="gateway-add-message error">
            {gatewayError}
          </span>
        )}

        {gatewayMessage && (
          <span className="gateway-add-message success">
            {gatewayMessage}
          </span>
        )}

      </div>

    </div>
  );
}