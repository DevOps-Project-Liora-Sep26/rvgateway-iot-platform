# RvGateway – Local Setup

This document describes how to set up the local development environment for the RvGateway project.

The application consists of a Next.js frontend, a FastAPI backend, an MQTT telemetry ingestion service, an MQTT simulator, and MariaDB and InfluxDB for persistent data storage.

After completing the initial setup, the complete development environment can be started with:

```bash
./start-services.sh
```

## System Requirements

The following software must be installed on the host system:

| Dependency | Purpose |
| :--- | :--- |
| Python 3.12+ | FastAPI backend |
| python3-venv / pip | Python virtual environment and package management |
| Node.js / npm | Next.js frontend |
| Docker | Telemetry Ingest and MQTT Test services |
| MariaDB | User, gateway, and configuration data |
| InfluxDB 2.x | Telemetry time-series data |
| Git | Repository management |

Network access to the configured MQTT broker and valid broker credentials are also required.

## Project Structure

```text
webapp/
├── .env
├── .env.example
├── README.md
├── SETUP.md
├── start-services.sh
├── cleanup.sh
│
├── api/
│   ├── .venv/
│   ├── main.py
│   ├── auth.py
│   ├── requirements.txt
│   └── routers/
│
├── database/
│   ├── influxDB/
│   │   └── SETUP_INFLUXDB.md
│   └── mariaDB/
│       ├── schema.sql
│       └── user.sql
│
├── frontend/
│   ├── app/
│   ├── package.json
│   └── package-lock.json
│
├── service/
│   ├── setup-telemetry-ingest.sh
│   └── telemetry-ingest/
│
└── test/
    ├── setup-mqtt-test.sh
    └── mqtt-test/
```

The local `.env` file contains credentials and environment-specific configuration and must not be committed to Git.

`.env.example` documents the required environment variables without containing actual credentials.

## Installation

The following steps are required once when setting up the project on a new system.

Afterwards, normal development only requires:

```bash
./start-services.sh
```

### 1. Configure Environment Variables

From the project root:

```bash
cp .env.example .env
```

Configure the required values in `.env`.

The central configuration contains settings and credentials for:
* **MQTT:** Broker address, port, username, password, and subscription topics for the telemetry stream.
* **MariaDB:** Database host, port, root/application user credentials, and database name.
* **InfluxDB:** Organization name, target bucket, and the secure API access token.
* **FastAPI Security:** JWT secret keys (`JWT_SECRET`) and token expiration times for the user authentication system.

### 2. Manual Dependency Installation

Before the master orchestration script can run smoothly, you must provision the individual subsystem dependencies:

#### A. Backend Setup
Navigate into the API directory, initialize the local virtual environment, and install the required Python packages:
```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

#### B. Frontend Setup
Navigate into the frontend directory and install the necessary Node modules:
```bash
cd frontend
npm install
cd ..
```

### 3. Database Initialization

* **MariaDB Setup:** Import the core relational tables and configuration data into your local MariaDB instance:
  ```bash
  mysql -u [username] -p [database_name] < database/mariaDB/schema.sql
  mysql -u [username] -p [database_name] < database/mariaDB/user.sql
  ```
  
  > ⚠️ **CRITICAL SECURITY NOTE:** The `user.sql` script creates a default database user with the following template:
  > ```sql
  > CREATE USER IF NOT EXISTS 'webapp'@'localhost' IDENTIFIED BY 'CHANGE_ME';
  > ```
  > Before or immediately after importing this file, you **MUST** open `database/mariaDB/user.sql` and replace `'CHANGE_ME'` with a secure password. Ensure that this exact same password is also set as your database password variable inside your active local `.env` file.

* **InfluxDB Setup:** Follow the explicit data-bucket and token configuration instructions located in `database/influxDB/SETUP_INFLUXDB.md`.

### 4. Service & Test Environment Setup

Build and initialize the dockerized background services using the provided setup scripts:
```bash
# Set up the MQTT telemetry ingestion service
cd service
./setup-telemetry-ingest.sh
cd ..

# Set up the MQTT simulator test rig
cd test
./setup-mqtt-test.sh
cd ..
```

---

## Local Development & Usage

Once the one-time installation is complete, execute the master script from the root directory to spin up all services, frontends, and background workers simultaneously:

```bash
./start-services.sh
```

### Network Endpoints & Ports

When the environment is running, you can access the various components at the following local addresses:

* **Frontend Web Application:** `http://localhost:3000`
* **FastAPI Backend Core:** `http://localhost:8000`
* **Interactive API Documentation (Swagger UI):** `http://localhost:8000/docs`
* **Alternative API Documentation (ReDoc):** `http://localhost:8000/redoc`

### Stopping & Cleaning Services

To gracefully stop all background services, shut down Docker containers, and clear temporary execution states, use the cleanup script:

```bash
./cleanup.sh
```
