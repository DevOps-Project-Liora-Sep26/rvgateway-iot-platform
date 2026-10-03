/* ============================================================
 * File:    alarmCard.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays the current state of a gateway alarm input.
 *
 * Shows the alarm-specific icon during normal operation and
 * indicates an active alarm using a warning icon together with
 * the configured alarm message.
 * ============================================================ */

import { type LucideIcon } from "lucide-react";

import styles from "./alarmCard.module.css";


/* ============================================================
 * TYPES
 * ============================================================ */

type AlarmCardProps = {
  title: string;
  alarm: boolean;
  icon: LucideIcon;
  alarmText: string;
};


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function AlarmCard({
  title,
  alarm,
  icon: StatusIcon,
  alarmText,
}: AlarmCardProps) {

  /* ============================================================
   * RENDER
   * ============================================================ */

  return (
    <div
      className={`${styles.card} ${alarm ? styles.alarm : styles.normal}`}
    >

      {/* ========================================================
          TITLE
          ======================================================== */}

        <div className="dashboard-card-title">
        {title}
        </div>

      {/* ========================================================
          STATUS ICON
          ======================================================== */}

      <div className={styles.icon}>
        <StatusIcon
          size={48}
          strokeWidth={1.8}
        />
      </div>


      {/* ========================================================
          STATUS
          ======================================================== */}

      <div className={styles.status}>
        {alarm
          ? `${alarmText}`
          : "OK"
        }
      </div>

    </div>
  );
}