/* ============================================================
 * File:    sidebar/sidebar.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Displays the portal sidebar and provides navigation between
 * the portal sections.
 * ============================================================
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";


const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});


type SidebarProps = {
  userEmail: string;
  onLogout: () => void;
};


export default function Sidebar({
  userEmail,
  onLogout,
}: SidebarProps) {

  const router = useRouter();
  const pathname = usePathname();

  // ============================================================
  // ACTIVE NAVIGATION STATE
  // ============================================================

  const isGatewaySection =
    pathname === "/portal/gateways" ||
    /^\/portal\/[^/]+\/(dashboard|setup)$/.test(pathname);

  return (
    <aside className="sidebar">

      {/* ======================================================
          BRAND
          ====================================================== */}

      <div className="sidebar-brand">

        <h1 className={orbitron.className}>
          RvGateway
        </h1>

        <span>
          IoT Monitoring Platform
        </span>

      </div>


      {/* ======================================================
          CURRENT USER
          ====================================================== */}

      <div className="sidebar-user">

        <span className="sidebar-user-email">
          {userEmail}
        </span>

      </div>


      <div className="sidebar-divider" />


      {/* ======================================================
          MAIN NAVIGATION
          ====================================================== */}

      <nav className="sidebar-nav">

        <button
          type="button"
          className={`sidebar-item ${
            pathname.startsWith("/portal/profile")
              ? "active"
              : ""
          }`}
          onClick={() =>
            router.push("/portal/profile")
          }
        >
          <span className="sidebar-icon">
            <ProfileIcon />
          </span>

          <span>
            Profile
          </span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isGatewaySection
              ? "active"
              : ""
          }`}
          onClick={() =>
            router.push("/portal/gateways")
          }
        >
          <span className="sidebar-icon">
            <GatewayIcon />
          </span>

          <span>
            Gateways
          </span>
        </button>

      </nav>


      <div className="sidebar-divider" />


      {/* ======================================================
          SECONDARY NAVIGATION
          ====================================================== */}

      <nav className="sidebar-nav">

        <button
          type="button"
          className={`sidebar-item ${
            pathname.startsWith("/portal/info")
              ? "active"
              : ""
          }`}
          onClick={() =>
            router.push("/portal/info")
          }
        >
          <span className="sidebar-icon">
            <InfoIcon />
          </span>

          <span>
            Info
          </span>
        </button>


        <button
          type="button"
          className="sidebar-item"
          onClick={onLogout}
        >

          <span className="sidebar-icon">
            <LogoutIcon />
          </span>

          <span>
            Logout
          </span>

        </button>

      </nav>


      <div className="sidebar-divider" />

    </aside>
  );
}


/* ============================================================
   SVG ICONS
   ============================================================ */

/* ------------------------------------------------------------
   PROFILE ICON
   ------------------------------------------------------------ */
function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path
        d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
      />
    </svg>
  );
}


/* ------------------------------------------------------------
   GATEWAY ICON
   ------------------------------------------------------------ */
function GatewayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
      />

      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h4" />
    </svg>
  );
}

/* ------------------------------------------------------------
   INFO ICON
   ------------------------------------------------------------ */
function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------
   GATEWAY ICON
   ------------------------------------------------------------ */
function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M10 17l5-5-5-5"
      />

      <path
        d="M15 12H3"
      />

      <path
        d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
      />
    </svg>
  );
}