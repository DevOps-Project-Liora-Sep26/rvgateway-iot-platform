/* ============================================================
 * File:    useLatestTelemetry.ts
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Retrieves the latest telemetry data of a gateway.
 *
 * Fetches the latest sensor measurements and alarm states from
 * the backend API and provides the telemetry data together with
 * loading and error states.
 * ============================================================ */

"use client";

import { useEffect, useState } from "react";

import { DASHBOARD_REFRESH_INTERVAL } from "../variables";
import { calculateTelemetryStatus } from "../utils/gatewayStatus";


/* ============================================================
 * EXPORT TYPES
 * ============================================================ */

export type GatewayStatus = {
  online: boolean;
  time_since_last_telemetry: number;
};

export type GatewayHeader = {
  gateway_uid: string;
  timestamp: string;
  boot_epoch_id: number;
  network_type: "WIFI" | "CELLULAR" | null;
  rssi: number | null;
  telemetry_interval: number;
};

export type GatewayDashboard = {
  house_battery_voltage: number;
  engine_battery_voltage: number;
  temperature: number;
  humidity: number;
  water_alarm: boolean;
  smoke_alarm: boolean;
};

export type LatestTelemetry = GatewayHeader & GatewayDashboard;


/* ============================================================
 * HOOK
 * ============================================================ */

export function useLatestTelemetry(gatewayUID: string) {

  const [telemetry, setTelemetry] =
    useState<LatestTelemetry | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [now, setNow] =
    useState(() => Date.now());


  /* ============================================================
   * LOCAL CLOCK
   * ============================================================ */

  useEffect(() => {

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };

  }, []);


  /* ============================================================
   * FETCH TELEMETRY
   * ============================================================ */

  useEffect(() => {

    if (!gatewayUID) {
      return;
    }

    let active = true;

    const fetchTelemetry = async () => {

      try {

        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/gateways/${gatewayUID}/telemetry/latest`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch telemetry: ${response.status}`
          );
        }

        const data: LatestTelemetry =
          await response.json();

        if (active) {
          setTelemetry(data);
        }

      } catch (error) {

        console.error(
          "Failed to fetch latest gateway telemetry:",
          error
        );

        if (active) {
          setError("Failed to load telemetry.");
        }

      } finally {

        if (active) {
          setLoading(false);
        }
      }
    };


    /* ============================================================
     * INITIAL FETCH
     * ============================================================ */

    fetchTelemetry();


    /* ============================================================
     * TELEMETRY POLLING
     * ============================================================ */

    const interval = window.setInterval(
      fetchTelemetry,
      DASHBOARD_REFRESH_INTERVAL
    );


    /* ============================================================
     * CLEANUP
     * ============================================================ */

    return () => {
      active = false;
      window.clearInterval(interval);
    };

  }, [gatewayUID]);


  /* ============================================================
   * CALCULATE CURRENT STATUS
   * ============================================================ */

  const status = telemetry
    ? calculateTelemetryStatus(
        telemetry.timestamp,
        telemetry.telemetry_interval,
        now
      )
    : null;


  /* ============================================================
   * RETURN
   * ============================================================ */

  return {
    telemetry,
    status,
    loading,
    error,
  };
}