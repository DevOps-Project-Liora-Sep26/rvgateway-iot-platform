/* ============================================================
 * File:    layout.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides the common layout for all pages of a selected
 * gateway.
 *
 * Loads the latest gateway telemetry and provides it to the
 * gateway header and the currently selected gateway page.
 * ============================================================
 */

"use client";

import { useParams } from "next/navigation";

import GatewayHeader from "./gatewayHeader";
import { GatewayTelemetryProvider } from "./gatewayTelemetryContext";

import { useLatestTelemetry } from "../hooks/useLatestTelemetry";


/* ============================================================
 * LAYOUT
 * ============================================================ */

export default function GatewayLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /* ============================================================
   * GATEWAY
   * ============================================================ */

  const params =
    useParams<{ gatewayUID: string }>();

  const gatewayUID =
    params.gatewayUID;


  /* ============================================================
   * TELEMETRY
   * ============================================================ */

  const {
    telemetry,
    status,
    loading,
    error,
  } = useLatestTelemetry(gatewayUID);


  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <GatewayTelemetryProvider
      value={{
        telemetry,
        status,
        loading,
        error,
      }}
    >

      {/* ======================================================
          GATEWAY HEADER
          ====================================================== */}

      <GatewayHeader />


      {/* ======================================================
          GATEWAY CONTENT
          ====================================================== */}

      {children}

    </GatewayTelemetryProvider>
  );
}
