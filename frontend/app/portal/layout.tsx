/* ============================================================
 * File:    layout.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Provides the common layout for all portal pages.
 *
 * Handles session validation, current user state and logout.
 * Displays the portal sidebar and renders the selected portal
 * page within the main content area.
 * ============================================================
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./sidebar/sidebar";

import "./portal.css";


type User = {
  id: number;
  email: string;
};


export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();


  // ============================================================
  // CURRENT USER STATE
  // ============================================================

  const [user, setUser] =
    useState<User | null>(null);

  const [userLoading, setUserLoading] =
    useState(true);


  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {

    const loadUser = async () => {

      try {

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        // Redirect if no valid session exists
        if (response.status === 401) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load user."
          );
        }

        const data: User =
          await response.json();

        setUser(data);

      } catch (error) {

        console.error(
          "Failed to load user:",
          error
        );

        router.replace("/");

      } finally {

        setUserLoading(false);

      }
    };


    loadUser();

  }, [router]);


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {

    try {

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout request failed:",
        error
      );

    } finally {

      router.replace("/");

    }
  };


  // ============================================================
  // SESSION CHECK
  // ============================================================

  if (userLoading) {

    return (
      <main className="portal-loading">
        Loading...
      </main>
    );
  }


  // Prevent portal from rendering without an authenticated user
  if (!user) {
    return null;
  }


  // ============================================================
  // PORTAL LAYOUT
  // ============================================================

  return (
    <main className="portal">

      {/* ========================================================
          SIDEBAR
          ======================================================== */}

      <Sidebar
        userEmail={user.email}
        onLogout={handleLogout}
      />


      {/* ========================================================
          CONTENT
          ======================================================== */}

      <section className="portal-content">

        {children}

      </section>

    </main>
  );
}