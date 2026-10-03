/* ============================================================
 * File:    page.tsx
 * Author:  Markus Gerstenberg
 *
 * Description:
 * Redirects the portal root to the gateway overview.
 * ============================================================
 */

import { redirect } from "next/navigation";


export default function Portal() {

  redirect("/portal/gateways");

}