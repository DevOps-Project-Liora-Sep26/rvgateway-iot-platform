/* ============================================================
 * File:    portal/[gatewayUID]/dashboard/page.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays the dashboard of the selected gateway.
 *
 * Shows the current gateway telemetry, alarm states and
 * historical measurement data.
 * ============================================================
 */

"use client";

import { WavesArrowUp, AlarmSmoke } from "lucide-react";

import MetricCard from "./components/metricCard";
import AlarmCard from "./components/alarmCard";
import HistoricalChart from "./components/historicalChart/historicalChart";

import { useGatewayTelemetry } from "../gatewayTelemetryContext";


/* ============================================================
 * DASHBOARD
 * ============================================================ */

export default function GatewayDashboard() {

  /* ============================================================
   * TELEMETRY
   * ============================================================ */

  const {
    telemetry,
    loading,
    error,
  } = useGatewayTelemetry();


  /* ============================================================
   * LOADING
   * ============================================================ */

  if (loading) {
    return (
      <div className="dashboard-panel">

        <div className="dashboard-panel-header">
          <h2>
            Dashboard
          </h2>
        </div>

        <p>
          Loading telemetry...
        </p>

      </div>
    );
  }


  /* ============================================================
   * ERROR
   * ============================================================ */

  if (error || !telemetry) {
    return (
      <div className="dashboard-panel">

        <div className="dashboard-panel-header">
          <h2>
            Dashboard
          </h2>
        </div>

        <p>
          Telemetry unavailable.
        </p>

      </div>
    );
  }


  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <div className="dashboard-panel">

      <div className="dashboard-layout">

        {/* ========================================================
            HEADER
            ======================================================== */}

        <div className="dashboard-panel-header">

          <h2>
            Dashboard
          </h2>

        </div>


        {/* ========================================================
            DASHBOARD CARDS
            ======================================================== */}

        <div className="dashboard-grid">

          <MetricCard
            title="House Battery"
            value={telemetry.house_battery_voltage}
            unit="V"
            min={0}
            max={18}
            markers={[12]}
            colorRanges={[
              { min: 0,  max: 8,  color: "var(--color-metric-dark-red)" },
              { min: 8,  max: 11, color: "var(--color-metric-red)" },
              { min: 11, max: 12, color: "var(--color-metric-orange)" },
              { min: 12, max: 18, color: "var(--color-metric-green)" },
            ]}
          />

          <MetricCard
            title="Starter Battery"
            value={telemetry.engine_battery_voltage}
            unit="V"
            min={0}
            max={18}
            markers={[12]}
            colorRanges={[
              { min: 0,  max: 8,  color: "var(--color-metric-dark-red)" },
              { min: 8,  max: 11, color: "var(--color-metric-red)" },
              { min: 11, max: 12, color: "var(--color-metric-orange)" },
              { min: 12, max: 18, color: "var(--color-metric-green)" },
            ]}
          />

          <MetricCard
            title="Temperature"
            value={telemetry.temperature}
            unit="°C"
            min={-20}
            max={60}
            markers={[0, 20]}
            colorRanges={[
              { min: -20, max: -10, color: "var(--color-metric-violet)" },
              { min: -10, max: -5,  color: "var(--color-metric-dark-blue)" },
              { min: -5,  max: 5,   color: "var(--color-metric-blue)" },
              { min: 5,   max: 15,  color: "var(--color-metric-green)" },
              { min: 15,  max: 22,  color: "var(--color-metric-yellow)" },
              { min: 22,  max: 30,  color: "var(--color-metric-orange)" },
              { min: 30,  max: 35,  color: "var(--color-metric-red)" },
              { min: 35,  max: 40,  color: "var(--color-metric-dark-red)" },
              { min: 40,  max: 60,  color: "var(--color-metric-pink)" },
            ]}
          />

          <MetricCard
            title="Humidity"
            value={telemetry.humidity}
            unit="%"
            min={0}
            max={100}
            markers={[25, 50, 75]}
            colorRanges={[
              { min: 0, max: 100, color: "var(--color-metric-blue)" },
            ]}
          />

          <AlarmCard
            title="Water Detection"
            alarm={telemetry.water_alarm}
            icon={WavesArrowUp}
            alarmText="WATER DETECTED"
          />

          <AlarmCard
            title="Smoke Detection"
            alarm={telemetry.smoke_alarm}
            icon={AlarmSmoke}
            alarmText="SMOKE DETECTED"
          />

        </div>


        {/* ========================================================
            HISTORICAL DATA
            ======================================================== */}

        <HistoricalChart />

      </div>
    </div>
  );
}