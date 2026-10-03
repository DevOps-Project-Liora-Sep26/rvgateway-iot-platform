/* ============================================================
 * File:    metricCard.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays a configurable metric card for gateway telemetry.
 *
 * Shows the current metric value and unit together with a
 * proportional scale indicating the value within a defined
 * measurement range.
 * Supports configurable scale markers and value-dependent colors.
 * ============================================================ */

import styles from "./metricCard.module.css";

/* ============================================================
 * TYPES
 * ============================================================ */

type ColorRange = {
  min: number;
  max: number;
  color: string;
};

type MetricCardProps = {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  markers?: number[];
  colorRanges?: ColorRange[];
};

type ScaleMarkerProps = {
  value: number;
  position: number;
};

/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function MetricCard({
  title,
  value,
  unit,
  min,
  max,
  markers = [],
  colorRanges = [],
}: MetricCardProps) {

  /* ============================================================
   * VALUE CALCULATION
   * ============================================================ */

  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );


  /* ============================================================
   * COLOR SELECTION
   * ============================================================ */

  const currentRange = colorRanges.find(
    (range) => value >= range.min && value < range.max
  );

  const currentColor =
    currentRange?.color ?? "inherit"; 

  /* ============================================================
   * SCALE MARKER POSITION
   * ============================================================ */

  const getMarkerPosition = (marker: number) => {
    return ((marker - min) / (max - min)) * 100;
  };
  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <div className={styles.card}>

    <div className="dashboard-card-title">
      {title}
    </div>

      <div
        className={styles.value}
        style={{ color: currentColor }}
      >
        {value}
        <span className={styles.unit}>
          {unit}
        </span>
      </div>

      <div className={styles.scale}>

        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{
              width: `${percentage}%`,
              backgroundColor: currentColor,
            }}
          />
        </div>

        <div className={styles.markers}>

          <ScaleMarker
            value={min}
            position={0}
          />

          {markers.map((marker) => (
            <ScaleMarker
              key={marker}
              value={marker}
              position={getMarkerPosition(marker)}
            />
          ))}

          <ScaleMarker
            value={max}
            position={100}
          />
        </div>
      </div>
    </div>
  );
}


/* ============================================================
 * SCALE MARKER
 * ============================================================ */

function ScaleMarker({ value, position }: ScaleMarkerProps) {
  return (
    <div
      className={styles.marker}
      style={{ left: `${position}%` }}
    >
      <div className={styles.markerLine} />
      <span>{value}</span>
    </div>
  );
}
