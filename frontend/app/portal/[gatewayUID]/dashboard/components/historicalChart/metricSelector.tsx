/* ============================================================
 * File:    metricSelector.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides a selection of telemetry metrics available for
 * historical data visualization.
 * ============================================================ */

import { ChevronDown } from "lucide-react";

import type { Metric } from "../../../../hooks/useHistoricalData";
import styles from "./historicalChart.module.css";


/* ============================================================
 * TYPES
 * ============================================================ */

type MetricSelectorProps = {
  value: Metric;
  onChange: (metric: Metric) => void;
};


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function MetricSelector({
  value,
  onChange,
}: MetricSelectorProps) {

  /* ============================================================
   * RENDER
   * ============================================================ */

 return (
    <div className={styles.metricSelectorWrapper}>

      <select
        className={styles.metricSelector}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as Metric)
        }
      >
        <option value="houseBattery">House Battery</option>
        <option value="starterBattery">Starter Battery</option>
        <option value="temperature">Temperature</option>
        <option value="humidity">Humidity</option>
        <option value="waterAlarm">Water Detected</option>
        <option value="smokeAlarm">Smoke Detected</option>
        <option value="rssi">Signal Strength</option>
        <option value="bootEpoch">Boot Epoch</option>
        <option value="telemetryInterval">Telemetry Interval</option>
      </select>

      <ChevronDown
        className={styles.metricSelectorIcon}
        size={16}
      />

    </div>
  );
}