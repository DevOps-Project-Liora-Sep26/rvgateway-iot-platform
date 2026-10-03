/* ============================================================
 * File:    useGatewayStatus.ts
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides the current status of a gateway and periodically
 * updates the status from the backend.
 *
 * Can be used by components that require live gateway status
 * information, such as the gateway card and gateway header.
 * ============================================================ */

"use client";

import { useEffect, useState } from "react";
import { GATEWAY_REFRESH_INTERVAL } from "../variables";
import { calculateTelemetryStatus } from "../utils/gatewayStatus";


/* ============================================================
 * TYPES
 * ============================================================ */

interface GatewayStatusResponse {
  gateway_uid: string;
  last_telemetry: string;
  telemetry_interval: number;
  network_type: "WIFI" | "CELLULAR" | null;
  rssi: number | null;
}

export type GatewayStatus = {
  gateway_uid: string;
  online: boolean;
  last_telemetry: string;
  time_since_last_telemetry: number;
  telemetry_interval: number;
  network_type: "WIFI" | "CELLULAR" | null;
  rssi: number | null;
}


/* ============================================================
 * GATEWAY STATUS HOOK
 * ============================================================ */

export function useGatewayStatus(gatewayUid: string) {
  const [status, setStatus] = useState<GatewayStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [now, setNow] = useState(() => Date.now());



 /* ==========================================================
     LOCAL CLOCK
     ========================================================== */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);


  /* ==========================================================
     STATUS POLLING
     ========================================================== */

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/gateways/${gatewayUid}/status`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: GatewayStatusResponse = await response.json();

        if (active) {
          setStatus(data);
          setError(false);
        }
      } catch (error) {
        console.error(
          `Failed to fetch gateway status [${gatewayUid}]:`,
          error
        );

        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    const interval = window.setInterval(
      fetchStatus,
      GATEWAY_REFRESH_INTERVAL
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [gatewayUid]);

  /* ==========================================================
    CALCULATE CURRENT STATUS
    ========================================================== */

  const telemetryStatus = status
    ? calculateTelemetryStatus(
        status.last_telemetry,
        status.telemetry_interval,
        now
      )
    : null;

  const currentStatus: GatewayStatus | null =
    status && telemetryStatus
      ? {
          ...status,
          ...telemetryStatus,
        }
      : null;

  /* ==========================================================
     RETURN
     ========================================================== */

  return {
    status: currentStatus,
    loading,
    error,
    now,
  };
}