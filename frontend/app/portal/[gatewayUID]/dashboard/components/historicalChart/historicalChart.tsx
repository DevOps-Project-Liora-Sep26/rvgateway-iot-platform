/* ============================================================
 * File:    historicalChart.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays historical telemetry data for a selected metric
 * and time range.
 * ============================================================ */

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import {
  useHistoricalData,
  type Metric,
  type TimeRange,
} from "../../../../hooks/useHistoricalData";

import MetricSelector from "./metricSelector";
import TimeRangeSelector from "./timeRangeSelector";
import LineChart from "./lineChart";

import styles from "./historicalChart.module.css";


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function HistoricalChart() {

  const params = useParams();
  const gatewayUID = params.gatewayUID as string;

  const [metric, setMetric] = useState<Metric>(() => {
    const storedMetric = localStorage.getItem("historicalChart.metric");

    return storedMetric
      ? (storedMetric as Metric)
      : "houseBattery";
  });

  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const storedTimeRange = localStorage.getItem("historicalChart.timeRange");

    return storedTimeRange
      ? (storedTimeRange as TimeRange)
      : "24h";
  });


  /* ============================================================
   * HISTORICAL DATA
   * ============================================================ */

  const {
    data: historicalData,
    loading,
    error,
    refresh,
  } = useHistoricalData(
    gatewayUID,
    metric,
    timeRange
  );


  /* ============================================================
   * EVENT HANDLERS
   * ============================================================ */

  function handleMetricChange(metric: Metric) {
    setMetric(metric);
    localStorage.setItem("historicalChart.metric", metric);
  }

  function handleTimeRangeChange(timeRange: TimeRange) {
    setTimeRange(timeRange);
    localStorage.setItem("historicalChart.timeRange", timeRange);
  }


  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <section className={styles.card}>

      <div className={styles.header}>
        <h2>Historical Data</h2>

        <MetricSelector
          value={metric}
          onChange={handleMetricChange}
        />

        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
        />

        <button
          type="button"
          className={styles.refreshButton}
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={16} />
            Update chart
        </button>
      </div>

      <LineChart
        metric={metric}
        timeRange={timeRange}
        data={historicalData}
      />

    </section>
  );
}