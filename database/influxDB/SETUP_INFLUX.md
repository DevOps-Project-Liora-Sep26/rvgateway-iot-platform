# InfluxDB Setup

This document describes the initial setup of InfluxDB for the RvGateway WebApp.

The setup consists of:

1. Install InfluxDB
2. Create the administrator account
3. Create the telemetry bucket
4. Create a read-only API token
5. Create a write-only API token
6. Add the configuration to `.env`

---

## 1. Install InfluxDB

Install **InfluxDB 2.x** on the host system.

After installation, enable and start the service:

```bash id="v7fn43"
sudo systemctl enable influxdb
sudo systemctl start influxdb
```

Verify that InfluxDB is running:

```bash id="q55ws1"
sudo systemctl status influxdb
```

InfluxDB is available by default at:

```text id="ouj1hs"
http://localhost:8086
```

---

## 2. Create Administrator

Open the InfluxDB web interface:

```text id="6i1ngj"
http://localhost:8086
```

Complete the initial setup and create the administrator account.

Create the organization:

```text id="u0ylnf"
RvGateway
```

Store the administrator credentials securely.

The administrator token should **not** be used by the RvGateway application.

---

## 3. Create Telemetry Bucket

Create the following bucket:

```text id="onvhjj"
telemetry
```

Organization:

```text id="kvnlnp"
RvGateway
```

This bucket stores telemetry data received from the gateways.

---

## 4. Create Read API Token

Create a dedicated API token with **read-only access** to the `telemetry` bucket.

Recommended description:

```text id="zhc2kk"
service-read
```

Permissions:

```text id="qcl2f9"
telemetry → Read
```

Copy the generated token and store it in the root `.env` file:

```text id="d3xf10"
INFLUX_DB_READ_TOKEN=<token>
```

This token is used by services that query telemetry data.

---

## 5. Create Write API Token

Create a second API token with **write-only access** to the `telemetry` bucket.

Recommended description:

```text id="f2qrml"
service-write
```

Permissions:

```text id="a0a2ts"
telemetry → Write
```

Copy the generated token and store it in the root `.env` file:

```text id="jny1l3"
INFLUX_DB_WRITE_TOKEN=<token>
```

This token is used by the Telemetry Ingest service.

---

## 6. Environment Configuration

The final InfluxDB configuration in `webapp/.env` should contain:

```dotenv id="k1c49w"
# InfluxDB
INFLUX_DB_URL=http://localhost:8086
INFLUX_DB_URL_DOCKER=http://172.17.0.1:8086

INFLUX_DB_READ_TOKEN=<read-token>
INFLUX_DB_WRITE_TOKEN=<write-token>

INFLUX_DB_ORG=RvGateway
INFLUX_DB_BUCKET=telemetry
```

`INFLUX_DB_URL` is used by services running directly on the host.

`INFLUX_DB_URL_DOCKER` is used by Docker containers that need to access the InfluxDB instance running on the host.

---

## Token Separation

RvGateway deliberately uses separate tokens for reading and writing telemetry:

```text id="ogj2sg"
FastAPI
   │
   │ service-read
   ▼
InfluxDB telemetry


Telemetry Ingest
   │
   │ service-write
   ▼
InfluxDB telemetry
```

This follows the principle of least privilege:

- The API can read telemetry but cannot modify it.
- The Telemetry Ingest service can write telemetry but does not require read access.
- The InfluxDB administrator token is not used by application services.