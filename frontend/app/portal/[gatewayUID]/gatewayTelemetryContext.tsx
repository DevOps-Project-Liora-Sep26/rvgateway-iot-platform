/* ============================================================
 * File:    gatewayTelemetryContext.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides the latest gateway telemetry and calculated gateway
 * status to all components within the selected gateway layout.
 *
 * The context itself does not perform any polling.
 * ============================================================
 */

"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type {
  GatewayStatus,
  LatestTelemetry,
} from "../hooks/useLatestTelemetry";


/* ============================================================
 * TYPES
 * ============================================================ */

type GatewayTelemetryContextValue = {
  telemetry: LatestTelemetry | null;
  status: GatewayStatus | null;
  loading: boolean;
  error: string | null;
};


type GatewayTelemetryProviderProps = {
  children: ReactNode;
  value: GatewayTelemetryContextValue;
};


/* ============================================================
 * CONTEXT
 * ============================================================ */

const GatewayTelemetryContext =
  createContext<GatewayTelemetryContextValue | null>(null);


/* ============================================================
 * PROVIDER
 * ============================================================ */

export function GatewayTelemetryProvider({
  children,
  value,
}: GatewayTelemetryProviderProps) {

  return (
    <GatewayTelemetryContext.Provider value={value}>
      {children}
    </GatewayTelemetryContext.Provider>
  );
}


/* ============================================================
 * HOOK
 * ============================================================ */

export function useGatewayTelemetry() {

  const context =
    useContext(GatewayTelemetryContext);


  if (!context) {
    throw new Error(
      "useGatewayTelemetry must be used within GatewayTelemetryProvider"
    );
  }


  return context;
}