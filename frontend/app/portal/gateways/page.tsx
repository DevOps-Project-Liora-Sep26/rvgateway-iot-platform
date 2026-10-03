"use client";

/* ============================================================
 * File:    gateways.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays the gateway overview, including gateway management
 * and the gateways associated with the current user.
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AddGateway from "./addGateway";
import GatewayCard from "./gatewayCard";


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

export default function Gateways() {

  const router = useRouter();

  const [gateways, setGateways] =
    useState<Gateway[]>([]);


  // ============================================================
  // LOAD GATEWAYS
  // ============================================================

  const loadGateways = async () => {

    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gateways`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      // Session expired
      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load gateways: ${response.status}`
        );
      }

      const data: Gateway[] =
        await response.json();

      setGateways(data);

    } catch (error) {

      console.error(
        "Failed to load gateways:",
        error
      );

    }

  };


// ============================================================
// INITIAL LOAD
// ============================================================

useEffect(() => {
  loadGateways();
}, [router]);


  return (
    <>
      {/* ========================================================
          ADD GATEWAY
          ======================================================== */}

      <AddGateway
        onGatewayAdded={loadGateways}
      />


      {/* ========================================================
          MY GATEWAYS
          ======================================================== */}

      <div className="gateway-panel">

        {/* ------------------------------------------------------
            HEADER
            ------------------------------------------------------ */}

        <div className="gateway-panel-header">

          <h2>
            My Gateways
          </h2>

        </div>


        {/* ------------------------------------------------------
            GATEWAYS
            ------------------------------------------------------ */}

        <div className="gateway-grid">

          {gateways.map((gateway) => (
            <GatewayCard
              key={gateway.gateway_uid}
              gatewayUid={gateway.gateway_uid}
              name={gateway.name}
            />
          ))}

        </div>

      </div>
    </>
  );
}