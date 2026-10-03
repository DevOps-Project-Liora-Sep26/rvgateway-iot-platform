# ============================================================
# File:         db_influxdb.py
# Author:       Markus Gerstenberg
#
# Description:
#   InfluxDB client and telemetry helper functions for
#   the RvGateway Web API.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

import os

from influxdb_client import InfluxDBClient


# ============================================================
# INFLUX_DB_ - HELPERFUNCTIONS
# ============================================================

# *************************************************
# Function:    get_influxdb
# Description: Creates a new connection to the
#              InfluxDB database.
# Parameters:  None
# Returns:     InfluxDB client
# Notes:       Database configuration is loaded
#              from environment variables.
# *************************************************
def get_influxdb_client():
    return InfluxDBClient(
        url=os.getenv("INFLUX_DB_URL"),
        token=os.getenv("INFLUX_DB_READ_TOKEN"),
        org=os.getenv("INFLUX_DB_ORG"),
    )

# *************************************************
# Function:    gateway_exists_in_influxdb
# Description: Checks whether telemetry data for
#              the specified gateway exists.
# Parameters:  gateway_uid - Unique gateway ID
# Returns:     True if gateway exists, otherwise
#              False
# *************************************************
def gateway_exists_in_influxdb(gateway_uid: str):

    client = get_influxdb_client()

    try:
        query_api = client.query_api()

        query = f'''
        from(bucket: "{os.getenv("INFLUX_DB_BUCKET")}")
            |> range(start: 0)
            |> filter(fn: (r) => r.gateway_uid == "{gateway_uid}")
            |> limit(n: 1)
        '''

        tables = query_api.query(
            query=query,
            org=os.getenv("INFLUX_DB_ORG"),
        )

        return any(
            len(table.records) > 0
            for table in tables
        )

    finally:
        client.close()

# *************************************************
# Function:    get_latest_gateway_telemetry
# Description: Retrieves the latest telemetry data
#              for the specified gateway.
# Parameters:  gateway_uid - Unique gateway ID
# Returns:     Dictionary containing the latest
#              telemetry values and timestamp,
#              or None if no data exists
# *************************************************
def get_latest_gateway_telemetry(gateway_uid: str):

    client = get_influxdb_client()

    try:
        query_api = client.query_api()

        query = f'''
        from(bucket: "{os.getenv("INFLUX_DB_BUCKET")}")
            |> range(start: 0)
            |> filter(fn: (r) => r.gateway_uid == "{gateway_uid}")
            |> last()
        '''

        tables = query_api.query(
            query=query,
            org=os.getenv("INFLUX_DB_ORG"),
        )

        telemetry = {}
        latest_timestamp = None

        for table in tables:
            for record in table.records:

                telemetry[record.get_field()] = record.get_value()

                record_time = record.get_time()

                if latest_timestamp is None or record_time > latest_timestamp:
                    latest_timestamp = record_time

        if not telemetry:
            return None

        telemetry["timestamp"] = latest_timestamp

        return telemetry

    finally:
        client.close()

# *************************************************
# Function:    get_historical_gateway_telemetry
# Description: Retrieves historical telemetry data
#              for the specified gateway, metric,
#              and time range.
# Parameters:  gateway_uid - Unique gateway ID
#              metric      - Telemetry field name
#              time_range  - InfluxDB time range
# Returns:     List of dictionaries containing
#              timestamp, value, and telemetry interval
# *************************************************
def get_historical_gateway_telemetry(
    gateway_uid: str,
    metric: str,
    time_range: str,
):

    client = get_influxdb_client()

    try:
        query_api = client.query_api()

        query = f'''
        from(bucket: "{os.getenv("INFLUX_DB_BUCKET")}")
            |> range(start: -{time_range})
            |> filter(fn: (r) => r.gateway_uid == "{gateway_uid}")
            |> filter(fn: (r) =>
                r._field == "{metric}" or
                r._field == "telemetry_interval"
            )
            |> pivot(
                rowKey: ["_time"],
                columnKey: ["_field"],
                valueColumn: "_value"
            )
            |> sort(columns: ["_time"])
        '''

        tables = query_api.query(
            query=query,
            org=os.getenv("INFLUX_DB_ORG"),
        )

        telemetry = []

        for table in tables:
            for record in table.records:
                telemetry.append({
                    "timestamp": record.get_time(),
                    "value": record.values.get(metric),
                    "telemetry_interval": record.values.get(
                        "telemetry_interval"
                    ),
                })

        return telemetry

    finally:
        client.close()