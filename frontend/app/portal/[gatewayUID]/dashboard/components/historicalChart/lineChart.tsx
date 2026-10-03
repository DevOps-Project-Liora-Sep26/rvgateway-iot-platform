/* ============================================================
 * File:    lineChart.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays historical telemetry data as a time-series
 * line chart.
 *
 * All chart colors are defined globally using CSS variables.
 * ============================================================ */

"use client";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

import "chartjs-adapter-date-fns";

import { Line } from "react-chartjs-2";
import {TELEMETRY_ALLOWED_CHART_DELAY} from "../../../../variables";

import type {
  Metric,
  TimeRange,
  HistoricalDataPoint,
} from "../../../../hooks/useHistoricalData";

import styles from "./historicalChart.module.css";



/* ============================================================
 * CHART.JS REGISTRATION
 * ============================================================ */

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


/* ============================================================
 * TYPES
 * ============================================================ */

type LineChartProps = {
  metric: Metric;
  timeRange: TimeRange;
  data: HistoricalDataPoint[];
};


/* ============================================================
 * CSS VARIABLES
 * ============================================================ */

function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}


/* ============================================================
 * METRIC CONFIGURATION
 * ============================================================ */

const metricConfig: Record<
  Metric,
  {
    label: string;
    unit: string;
    colorVariable: string;
  }
> = {
  houseBattery: {
    label: "House Battery",
    unit: "V",
    colorVariable: "--color-metric-red",
  },

  starterBattery: {
    label: "Starter Battery",
    unit: "V",
    colorVariable: "--color-metric-dark-red",
  },

  temperature: {
    label: "Temperature",
    unit: "°C",
    colorVariable: "--color-metric-blue",
  },

  humidity: {
    label: "Humidity",
    unit: "%",
    colorVariable: "--color-metric-dark-blue",
  },

  rssi: {
    label: "RSSI",
    unit: "dBm",
    colorVariable: "--color-metric-green",
  },

  bootEpoch: {
    label: "Boot Epoch",
    unit: "s",
    colorVariable: "--color-metric-yellow",
  },

  telemetryInterval: {
    label: "Telemetry Interval",
    unit: "s",
    colorVariable: "--color-metric-purple",
  },

  waterAlarm: {
    label: "Water Detected",
    unit: "",
    colorVariable: "--color-metric-blue",
  },

  smokeAlarm: {
    label: "Smoke Detected",
    unit: "",
    colorVariable: "--color-metric-red",
  }
};


/* ============================================================
 * TIME RANGE
 * ============================================================ */

const timeRangeMilliseconds: Record<TimeRange, number> = {
  "1h": 1 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/* ============================================================
 * TELEMETRY GAP HANDLING
 * ============================================================ */

const TELEMETRY_BUFFER_TIME = 100;

function createChartData(
  historicalData: HistoricalDataPoint[]
) {

  const chartData: {
    x: number;
    y: number | null;
  }[] = [];

  historicalData.forEach((dataPoint, index) => {

    const timestamp =
      new Date(dataPoint.timestamp).getTime();

    if (index > 0) {

      const previousDataPoint =
        historicalData[index - 1];

      const previousTimestamp =
        new Date(
          previousDataPoint.timestamp
        ).getTime();

      const telemetryTimeout =
        (
          previousDataPoint.telemetry_interval +
          TELEMETRY_ALLOWED_CHART_DELAY
        ) * 1000;

      const timeDifference =
        timestamp - previousTimestamp;

      if (timeDifference > telemetryTimeout) {

        chartData.push({
          x: previousTimestamp + telemetryTimeout,
          y: null,
        });
      }
    }

    chartData.push({
      x: timestamp,
      y: dataPoint.value,
    });
  });

  return chartData;
}

/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function LineChart({
  metric,
  timeRange,
  data: historicalData,
}: LineChartProps) {

  const config = metricConfig[metric];

  const values = historicalData.map(
    (dataPoint) => dataPoint.value
  );


  /* ============================================================
   * EMPTY DATA
   * ============================================================ */

  if (historicalData.length === 0) {
    return (
      <div className={styles.chart}>
        No historical data available.
      </div>
    );
  }


  /* ============================================================
   * TIME AXIS RANGE
   * ============================================================ */

  const endTime = Date.now();

  const startTime =
    endTime - timeRangeMilliseconds[timeRange];


  /* ============================================================
   * COLORS
   * ============================================================ */

  const chartColor = getCssVariable(
    config.colorVariable
  );

  const axisColor = getCssVariable(
    "--color-chart-axis"
  );

  const gridColor = getCssVariable(
    "--color-chart-grid"
  );

  const tooltipBackgroundColor = getCssVariable(
    "--color-chart-tooltip-background"
  );

  const tooltipTextColor = getCssVariable(
    "--color-chart-tooltip-text"
  );

  const pointBorderColor = getCssVariable(
    "--color-chart-point-border"
  );


  /* ============================================================
   * Y-AXIS RANGE
   * ============================================================ */

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const valueRange = maxValue - minValue;

  const minimumPadding =
    metric === "temperature"
      ? 1
      : metric === "humidity"
        ? 2
        : 0.1;

  const padding = Math.max(
    valueRange * 0.15,
    minimumPadding
  );

  const yMin = minValue - padding;
  const yMax = maxValue + padding;


  /* ============================================================
   * CHART DATA
   * ============================================================ */

  const chartData: ChartData<"line"> = {
    datasets: [
      {
        label: config.label,

        data: createChartData(historicalData),

        borderColor: chartColor,
        backgroundColor: chartColor,

        borderWidth: 2,
        tension: 0.35,

        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,

        pointHoverBackgroundColor: chartColor,
        pointHoverBorderColor: pointBorderColor,

        spanGaps: false,
      },
    ],
  };


  /* ============================================================
   * CHART OPTIONS
   * ============================================================ */

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "nearest",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        displayColors: false,

        backgroundColor: tooltipBackgroundColor,
        titleColor: tooltipTextColor,
        bodyColor: tooltipTextColor,

        padding: 10,
        cornerRadius: 6,

        callbacks: {
          label: (context) =>
            `${context.parsed.y} ${config.unit}`,
        },
      },
    },

    scales: {
      x: {
        type: "time",

        min: startTime,
        max: endTime,

        border: {
          display: false,
        },

        grid: {
          display: false,
        },

        ticks: {
          color: axisColor,
          maxRotation: 0,

          font: {
            size: 14,
            weight: 500,
          },
        },
      },

      y: {
        min: yMin,
        max: yMax,

        border: {
          display: false,
        },

        grid: {
          color: gridColor,
        },

        ticks: {
          color: axisColor,
          padding: 8,

          font: {
            size: 14,
            weight: 500,
          },

          callback: (value) =>
            `${Number(value).toFixed(
              metric === "humidity" ? 0 : 1
            )} ${config.unit}`,
        },
      },
    },
  };


  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <div className={styles.chart}>
      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}