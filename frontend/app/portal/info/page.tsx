/**
 * ============================================================
 * File: Info.tsx
 * Author: Markus Gerstenberg
 * ============================================================
 *
 * Description:
 * Displays general information about the RvGateway platform.
 * ============================================================
 */

export default function Info() {

  // ============================================================
  // INFO
  // ============================================================

return (
  <div className="info-panel">
    <h2>Info</h2>

    {/* ========================================================
        GETTING STARTED
        ======================================================== */}

    <div className="info-section">
      <h3>Getting Started</h3>

      <p>
        To start monitoring with RvGateway, your physical gateway
        must first be configured, connected to a network and
        successfully connected to the RvGateway backend.
      </p>

      <p>
        Once the gateway has been registered by the backend, open
        <strong> Gateways</strong> and enter the unique
        <strong> Gateway UID</strong> of your device in the
        <strong> Add Gateway</strong> section. The gateway will then
        appear in your gateway overview.
      </p>

      <p>
        You can now open the <strong>Dashboard</strong> to view the
        current gateway status and available telemetry data.
      </p>

      <p>
        Under <strong>Gateway Settings</strong>, you can assign a
        custom name to make your gateways easier to identify.
        Descriptive names such as <em>Camper</em>, <em>Boat</em> or
        <em>Motorhome</em> are especially useful when multiple
        gateways are linked to your account. You can also remove a
        gateway from your account at any time.
      </p>
    </div>

    <div className="info-divider" />

    {/* ========================================================
        VERSION
        ======================================================== */}

    <div className="info-section">
      <h3>Version</h3>
      <p>0.1.0</p>
    </div>
  </div>
);
}