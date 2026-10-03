/* ============================================================
 * File:    gatewayCard.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays a gateway and its current status
 * within the gateway overview.
 *
 * Provides navigation to the gateway dashboard
 * and gateway setup.
 * ============================================================ */

"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import { useGatewayStatus } from "../hooks/useGatewayStatus";


/* ============================================================
 * TYPES
 * ============================================================ */

interface GatewayCardProps {
  gatewayUid: string;
  name: string | null;
}


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function GatewayCard({
  gatewayUid,
  name,
}: GatewayCardProps) {
  const router = useRouter();

  const {
    status,
    loading,
    error,
    now,
  } = useGatewayStatus(gatewayUid);

  const displayName = name?.trim() || gatewayUid;
  const hasName = Boolean(name?.trim());


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const openDashboard = () => {
    router.push(`/portal/${gatewayUid}/dashboard`);
  };

  const openSetup = () => {
    router.push(`/portal/${gatewayUid}/setup`);
  };


  /* ==========================================================
     STATUS DISPLAY
     ========================================================== */

  const isOnline = status?.online ?? false;

  const statusText = loading
    ? "Loading"
    : error
      ? "Unknown"
      : isOnline
        ? "Online"
        : "Offline";

  const statusClass = loading || error
    ? "unknown"
    : isOnline
      ? "online"
      : "offline";


  /* ==========================================================
     LAST UPDATED
     ========================================================== */

  const formatLastTelemetry = () => {
    if (!status?.last_telemetry) {
      return "—";
    }

    const date = new Date(status.last_telemetry);

    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

/* ==========================================================
   RELATIVE TELEMETRY TIME
   ========================================================== */

const formatTimeSinceTelemetry = () => {
  if (!status?.last_telemetry) {
    return "No telemetry";
  }

  const telemetryTime =
    new Date(status.last_telemetry).getTime();

  if (!Number.isFinite(telemetryTime)) {
    return "—";
  }

  const seconds = Math.max(
    0,
    Math.floor((now - telemetryTime) / 1000)
  );


  /* ----------------------------------------------------------
     SECONDS
     ---------------------------------------------------------- */

  if (seconds < 180) {
    return `${seconds} sec ago`;
  }


  /* ----------------------------------------------------------
     MINUTES
     ---------------------------------------------------------- */

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min ago`;
    }


    /* ----------------------------------------------------------
      HOURS + MINUTES
      ---------------------------------------------------------- */

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      return `${hours} h ${remainingMinutes} min ago`;
    }


    /* ----------------------------------------------------------
      DAYS + HOURS
      ---------------------------------------------------------- */

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days} d ${remainingHours} h ago`;
  };

  /* ==========================================================
    FORMAT NETWORK TYPE
    ========================================================== */

  const formatNetworkType = () => {
    if (!status?.network_type) {
      return "—";
    }

    if (status.network_type === "CELLULAR") {
      return "Mobile";
    }

    if (status.network_type === "WIFI") {
      return "WiFi";
    }

    return status.network_type;
  };


  /* ==========================================================
    FORMAT RSSI
    ========================================================== */

  const formatRssi = () => {
    if (status?.rssi === null || status?.rssi === undefined) {
      return "—";
    }

    return `${status.rssi} dBm`;
  };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="gateway-card">

      {/* ======================================================
          GATEWAY HEADER
          ====================================================== */}

      <div className="gateway-card-header">

        <div className="gateway-card-header-main">

          <div className="gateway-card-identity">

            <div className="gateway-card-title">

              <h3
                className="gateway-card-name"
                title={displayName}
              >
                {displayName}
              </h3>

              <strong className={`gateway-status ${statusClass}`}>
                <span className="gateway-status-dot" />
                {statusText}
              </strong>

            </div>

            {hasName && (
              <span className="gateway-card-uid">
                {gatewayUid}
              </span>
            )}

          </div>

        </div>

        <button
          type="button"
          className="gateway-settings-button"
          aria-label="Gateway settings"
          onClick={openSetup}
        >
          <Settings size={24} />
        </button>

      </div>


      {/* ======================================================
          DIVIDER
          ====================================================== */}

      <div className="gateway-card-divider" />


      {/* ======================================================
          GATEWAY INFORMATION
          ====================================================== */}

      <div className="gateway-card-body">

        <div className="gateway-info gateway-info-updated">
          <span>Last updated</span>

          <strong>
            {formatLastTelemetry()}
          </strong>

          <span className="gateway-info-secondary">
            {formatTimeSinceTelemetry()}
          </span>
        </div>

        <div className="gateway-info gateway-info-connection">
          <span>Connection</span>

          <strong>
            {formatNetworkType()}
          </strong>

          <span className="gateway-info-secondary">
            {formatRssi()}
          </span>
        </div>

      </div>


      {/* ======================================================
          OPEN DASHBOARD
          ====================================================== */}

      <button
        type="button"
        className="portal-button primary gateway-open-button"
        onClick={openDashboard}
      >
        Open Dashboard
      </button>

    </div>
  );
}