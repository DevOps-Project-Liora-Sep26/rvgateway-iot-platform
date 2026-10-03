/* ============================================================
 * File:    gatewayStatus.ts
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides helper functions for calculating the current
 * gateway status from the latest telemetry data.
 * ============================================================
 */

import { TELEMETRY_ALLOWED_ONLINE_DELAY } from "../variables";


/* ============================================================
 * TYPES
 * ============================================================ */

export type GatewayStatus = {
  online: boolean;
  time_since_last_telemetry: number;
};


/* ============================================================
 * CALCULATE TELEMETRY STATUS
 * ============================================================ */

export function calculateTelemetryStatus(
  timestamp: string,
  telemetryInterval: number,
  now: number = Date.now()
): GatewayStatus {

  const telemetryTime =
    new Date(timestamp).getTime();


  const elapsedTime =
    Math.max(0, now - telemetryTime);


  const timeSinceLastTelemetry =
    Math.floor(elapsedTime / 1000);


  const online =
    elapsedTime <=
    (
      telemetryInterval +
      TELEMETRY_ALLOWED_ONLINE_DELAY
    ) * 1000;


  return {
    online,
    time_since_last_telemetry:
      timeSinceLastTelemetry,
  };
}