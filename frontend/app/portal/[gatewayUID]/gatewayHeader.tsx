/* ============================================================
 * File:    gatewayHeader.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays the header of the currently selected gateway.
 *
 * Shows the gateway identity, current status, last update
 * and network connection.
 *
 * Provides navigation back to the gateway overview and between
 * the dashboard and setup pages.
 * ============================================================
 */

"use client";

import { useEffect, useState } from "react";
import { ChartNoAxesCombined, Menu, Settings } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useGatewayTelemetry } from "./gatewayTelemetryContext";


/* ============================================================
 * TYPES
 * ============================================================ */

interface Gateway {
  gateway_uid: string;
  name: string | null;
}


/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function GatewayHeader() {

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ gatewayUID: string }>();

  const gatewayUid = params.gatewayUID;

  const [gateway, setGateway] = useState<Gateway | null>(null);


  /* ==========================================================
     TELEMETRY
     ========================================================== */

  const {
    telemetry,
    status,
    loading,
    error,
  } = useGatewayTelemetry();


  /* ==========================================================
     LOAD GATEWAY
     ========================================================== */

  useEffect(() => {

    const loadGateway = async () => {

      try {

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/gateways`,
          {
            method: "GET",
            credentials: "include",
          }
        );


        if (response.status === 401) {
          router.replace("/");
          return;
        }


        if (!response.ok) {
          throw new Error(
            `Failed to load gateways: ${response.status}`
          );
        }


        const data: Gateway[] = await response.json();


        const currentGateway = data.find(
          (item) => item.gateway_uid === gatewayUid
        );


        if (!currentGateway) {
          console.error(`Gateway not found: ${gatewayUid}`);
          router.replace("/portal/gateways");
          return;
        }


        setGateway(currentGateway);

      } catch (error) {

        console.error(
          "Failed to load gateway:",
          error
        );

      }

    };


    loadGateway();

  }, [gatewayUid, router]);


  /* ==========================================================
     GATEWAY NAME UPDATE
     ========================================================== */

  useEffect(() => {

    const handleGatewayRenamed = (event: Event) => {

      const customEvent = event as CustomEvent<{
        gatewayUid: string;
        name: string;
      }>;


      if (customEvent.detail.gatewayUid !== gatewayUid) {
        return;
      }


      setGateway((current) =>
        current
          ? {
              ...current,
              name: customEvent.detail.name,
            }
          : current
      );

    };


    window.addEventListener(
      "gateway-renamed",
      handleGatewayRenamed
    );


    return () => {

      window.removeEventListener(
        "gateway-renamed",
        handleGatewayRenamed
      );

    };

  }, [gatewayUid]);


  /* ==========================================================
     PAGE STATE
     ========================================================== */

  const isSetupPage =
    pathname.endsWith("/setup");


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const openGatewayOverview = () => {
    router.push("/portal/gateways");
  };


  const openDashboard = () => {
    router.push(`/portal/${gatewayUid}/dashboard`);
  };


  const openSetup = () => {
    router.push(`/portal/${gatewayUid}/setup`);
  };


  /* ==========================================================
     GATEWAY IDENTITY
     ========================================================== */

  const displayName =
    gateway?.name?.trim() || gatewayUid;


  const hasName =
    Boolean(gateway?.name?.trim());


  /* ==========================================================
     GATEWAY STATUS DISPLAY
     ========================================================== */

  const isOnline =
    status?.online ?? false;


  const statusText = loading
    ? "Loading"
    : error
      ? "Unknown"
      : isOnline
        ? "Online"
        : "Offline";


  const statusClass = loading || error
    ? "unknown"
    : isOnline
      ? "online"
      : "offline";


  /* ==========================================================
     FORMAT LAST TELEMETRY
     ========================================================== */

  const formatLastTelemetry = () => {

    if (!telemetry?.timestamp) {
      return "—";
    }


    const date =
      new Date(telemetry.timestamp);


    if (!Number.isFinite(date.getTime())) {
      return "—";
    }


    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  };


  /* ==========================================================
     FORMAT TIME SINCE LAST TELEMETRY
     ========================================================== */

  const formatTimeSinceTelemetry = () => {

    if (!status) {
      return "No telemetry";
    }


    const seconds =
      status.time_since_last_telemetry;


    /* ----------------------------------------------------------
       SECONDS
       ---------------------------------------------------------- */

    if (seconds < 180) {
      return `${seconds} sec ago`;
    }


    /* ----------------------------------------------------------
       MINUTES
       ---------------------------------------------------------- */

    const minutes =
      Math.floor(seconds / 60);


    if (minutes < 60) {
      return `${minutes} min ago`;
    }


    /* ----------------------------------------------------------
       HOURS + MINUTES
       ---------------------------------------------------------- */

    const hours =
      Math.floor(minutes / 60);


    const remainingMinutes =
      minutes % 60;


    if (hours < 24) {
      return `${hours} h ${remainingMinutes} min ago`;
    }


    /* ----------------------------------------------------------
       DAYS + HOURS
       ---------------------------------------------------------- */

    const days =
      Math.floor(hours / 24);


    const remainingHours =
      hours % 24;


    return `${days} d ${remainingHours} h ago`;

  };


  /* ==========================================================
     FORMAT NETWORK TYPE
     ========================================================== */

  const formatNetworkType = () => {

    if (!telemetry?.network_type) {
      return "—";
    }


    if (telemetry.network_type === "CELLULAR") {
      return "Mobile";
    }


    if (telemetry.network_type === "WIFI") {
      return "WiFi";
    }


    return telemetry.network_type;

  };


  /* ==========================================================
     FORMAT RSSI
     ========================================================== */

  const formatRssi = () => {

    if (
      telemetry?.rssi === null ||
      telemetry?.rssi === undefined
    ) {
      return "—";
    }


    return `${telemetry.rssi} dBm`;

  };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="add-gateway-panel gateway-header-panel">

      <div className="gateway-header">


        {/* ====================================================
            BACK TO GATEWAY OVERVIEW
            ==================================================== */}

        <button
          type="button"
          className="gateway-header-back"
          onClick={openGatewayOverview}
          aria-label="Back to gateway overview"
          title="Back to gateways"
        >
          <Menu size={28} />
        </button>


        {/* ====================================================
            GATEWAY IDENTITY
            ==================================================== */}

        <div className="gateway-header-identity">

          <div className="gateway-header-title">

            <h2
              className="gateway-header-name"
              title={displayName}
            >
              {displayName}
            </h2>


            {/* ------------------------------------------------
                STATUS
                ------------------------------------------------ */}

            <span
              className={`gateway-status ${statusClass}`}
            >
              <span className="gateway-status-dot" />
              {statusText}
            </span>

          </div>


          {/* ------------------------------------------------
              GATEWAY UID
              ------------------------------------------------ */}

          {hasName && (
            <span className="gateway-header-uid">
              {gatewayUid}
            </span>
          )}

        </div>


        {/* ====================================================
            LAST UPDATED
            ==================================================== */}

        <div className="gateway-header-updated">

          <span>
            Last updated:
          </span>

          <strong>
            {formatLastTelemetry()}
          </strong>

          <span className="gateway-header-secondary">
            {formatTimeSinceTelemetry()}
            {telemetry?.telemetry_interval != null && (
              <> · Interval: {telemetry.telemetry_interval} s</>
            )}
          </span>

        </div>


        {/* ====================================================
            CONNECTION
            ==================================================== */}

        <div className="gateway-header-connection">

          <span>
            Connection:
          </span>

          <strong>
            {formatNetworkType()}
          </strong>

          <span className="gateway-header-secondary">
            {formatRssi()}
          </span>

        </div>

        {/* ====================================================
            BOOT EPOCH
            ==================================================== */}

        <div className="gateway-header-boot-epoch">

          <span>
            Boot epoch:
          </span>

          <strong>
            {telemetry?.boot_epoch_id ?? "—"}
          </strong>

        </div>

        {/* ====================================================
            PAGE ACTION
            ==================================================== */}

        <div className="gateway-header-action">

          {isSetupPage ? (

            <button
              type="button"
              className="gateway-header-action-button"
              onClick={openDashboard}
              aria-label="Open dashboard"
              title="Dashboard"
            >
              <ChartNoAxesCombined size={26} />
            </button>

          ) : (

            <button
              type="button"
              className="gateway-header-action-button"
              onClick={openSetup}
              aria-label="Open gateway setup"
              title="Setup"
            >
              <Settings size={26} />
            </button>

          )}

        </div>

      </div>

    </div>
  );
}
