/* ============================================================
 * File:    timeRangeSelector.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides a selection of predefined time ranges for
 * historical telemetry data.
 * ============================================================ */

import type { TimeRange } from "../../../../hooks/useHistoricalData";

import styles from "./historicalChart.module.css";


/* ============================================================
 * TYPES
 * ============================================================ */

type TimeRangeSelectorProps = {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};


/* ============================================================
 * CONSTANTS
 * ============================================================ */

const TIME_RANGES: TimeRange[] = [
  "1h",
  "6h",
  "24h",
  "7d",
  "30d",
];


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function TimeRangeSelector({
  value,
  onChange,
}: TimeRangeSelectorProps) {

  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <div className={styles.timeRangeSelector}>

      {TIME_RANGES.map((timeRange) => (
        <button
          key={timeRange}
          type="button"
          className={`${styles.timeRangeButton} ${
            value === timeRange ? styles.active : ""
          }`}
          onClick={() => onChange(timeRange)}
        >
          {timeRange}
        </button>
      ))}

    </div>
  );
}