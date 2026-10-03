/* ============================================================
 * File:    useHistoricalData.ts
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Retrieves historical telemetry data of a gateway.
 *
 * Fetches historical measurements for a selected metric and
 * time range from the backend API.
 * ============================================================ */

"use client";

import { useCallback, useEffect, useState } from "react";


/* ============================================================
 * TYPES
 * ============================================================ */

export type Metric =
  | "houseBattery"
  | "starterBattery"
  | "temperature"
  | "humidity"
  | "waterAlarm"
  | "smokeAlarm"
  | "rssi"
  | "bootEpoch"
  | "telemetryInterval";

export type TimeRange =
  | "1h"
  | "6h"
  | "24h"
  | "7d"
  | "30d";

export type HistoricalDataPoint = {
  timestamp: string;
  value: number;
  telemetry_interval: number;
};

type HistoricalTelemetryResponse = {
  gateway_uid: string;
  metric: string;
  range: string;
  data: HistoricalDataPoint[];
};


/* ============================================================
 * API MAPPING
 * ============================================================ */

const metricApiMap: Record<Metric, string> = {
  houseBattery: "house_battery_voltage",
  starterBattery: "engine_battery_voltage",
  temperature: "temperature",
  humidity: "humidity",
  waterAlarm: "water_alarm",
  smokeAlarm: "smoke_alarm",
  rssi: "rssi",
  bootEpoch: "boot_epoch_id",
  telemetryInterval: "telemetry_interval"
};


/* ============================================================
 * HOOK
 * ============================================================ */

export function useHistoricalData(
  gatewayUID: string,
  metric: Metric,
  timeRange: TimeRange
) {

  const [data, setData] =
    useState<HistoricalDataPoint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  /* ============================================================
   * FETCH HISTORICAL DATA
   * ============================================================ */

  const refresh = useCallback(async () => {

    if (!gatewayUID) {
      return;
    }

    try {

      setLoading(true);
      setError(null);

      const apiMetric = metricApiMap[metric];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gateways/${gatewayUID}/telemetry/historical` +
        `?metric=${apiMetric}&range=${timeRange}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch historical telemetry: ${response.status}`
        );
      }

      const result: HistoricalTelemetryResponse =
        await response.json();

      setData(result.data);

    } catch (error) {

      console.error(
        "Failed to fetch historical gateway telemetry:",
        error
      );

      setData([]);
      setError("Failed to load historical telemetry.");

    } finally {

      setLoading(false);

    }

  }, [gatewayUID, metric, timeRange]);


  /* ============================================================
  * INITIAL FETCH
  * ============================================================ */

  useEffect(() => {

    refresh();

  }, [refresh]);


  /* ============================================================
   * RETURN
   * ============================================================ */

  return {
    data,
    loading,
    error,
    refresh,
  };
}