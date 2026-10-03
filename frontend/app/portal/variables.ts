/* ============================================================
 * File:    variables.ts
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Defines global configuration values used by the portal.
 * ============================================================ */

/* -------------------------------------------------------------
 * REFRESH INTERVALS
 * ------------------------------------------------------------- */

// Refresh interval for the dashboard telemetry data
export const DASHBOARD_REFRESH_INTERVAL = 1_000; // 10 seconds

// Refresh interval for the gateway status data
export const GATEWAY_REFRESH_INTERVAL = 10_000; // 1 second

/* -------------------------------------------------------------
 * TELEMETRY
 * ------------------------------------------------------------- */

// Allowed delay before a gap is shown in historical charts
export const TELEMETRY_ALLOWED_CHART_DELAY = 180;

// Allowed delay before a gateway is considered offline
export const TELEMETRY_ALLOWED_ONLINE_DELAY = 100;

