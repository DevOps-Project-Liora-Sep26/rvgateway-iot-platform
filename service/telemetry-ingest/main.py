# ==================================================
# File:        main.py
# Author:      Markus Gerstenberg
#
# Description: MQTT telemetry ingestion service for 
# storing gateway data in InfluxDB.
# ==================================================

import json
import os
import ssl

import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision



# ==================================================
# Configuration
# ==================================================

MQTT_HOST = os.environ["MQTT_HOST"]
MQTT_PORT = int(os.getenv("MQTT_PORT", "8883"))
MQTT_USER_NAME = os.environ["MQTT_USER_NAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]
MQTT_TOPIC = "gateway/+/measurement"

INFLUX_DB_URL_DOCKER = os.environ["INFLUX_DB_URL_DOCKER"]
INFLUX_DB_WRITE_TOKEN = os.environ["INFLUX_DB_WRITE_TOKEN"]
INFLUX_DB_ORG = os.environ["INFLUX_DB_ORG"]
INFLUX_DB_BUCKET = os.environ["INFLUX_DB_BUCKET"]


# ==================================================
# InfluxDB
# ==================================================

influx_client = InfluxDBClient(
    url=INFLUX_DB_URL_DOCKER,
    token=INFLUX_DB_WRITE_TOKEN,
    org=INFLUX_DB_ORG
)

write_api = influx_client.write_api()

# ==================================================
# MQTT Callbacks
# ==================================================

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker", flush=True)
        client.subscribe(MQTT_TOPIC, qos=1)
        print(f"Subscribed to {MQTT_TOPIC}", flush=True)
    else:
        print(f"MQTT connection failed: {rc}", flush=True)


def on_message(client, userdata, msg):
    try:
        telemetry = json.loads(msg.payload.decode())
        gateway_uid = msg.topic.split("/")[1]

        print(f"Telemetry received [{gateway_uid}]: {telemetry}", flush=True)

        point = (
            Point("telemetry")
            .tag("gateway_uid", gateway_uid)
            .time(telemetry["timestamp"], WritePrecision.S)
            .field("telemetry_interval", telemetry["telemetryInterval"])
            .field("rssi", telemetry["rssi"])
            .field("network_type", telemetry["networkType"])
            .field("boot_epoch_id", telemetry["bootEpochId"])
            .field("house_battery_voltage", telemetry["houseBatteryVoltage"])
            .field("engine_battery_voltage", telemetry["engineBatteryVoltage"])
            .field("temperature", telemetry["temperature"])
            .field("humidity", telemetry["humidity"])
            .field("water_alarm", telemetry["waterAlarm"])
            .field("smoke_alarm", telemetry["smokeAlarm"])            
        )

        write_api.write(
            bucket=INFLUX_DB_BUCKET,
            org=INFLUX_DB_ORG,
            record=point
        )

        print(f"Telemetry stored [{gateway_uid}]", flush=True)

    except Exception as e:
        print(f"Failed to process telemetry: {e}", flush=True)


# ==================================================
# MQTT Client
# ==================================================

client = mqtt.Client()

client.username_pw_set(
    MQTT_USER_NAME,
    MQTT_PASSWORD
)

client.tls_set(
    cert_reqs=ssl.CERT_REQUIRED,
    tls_version=ssl.PROTOCOL_TLS_CLIENT
)

client.on_connect = on_connect
client.on_message = on_message


# ==================================================
# Main
# ==================================================

print(f"Connecting to MQTT broker {MQTT_HOST}:{MQTT_PORT}...", flush=True)

client.connect(
    MQTT_HOST,
    MQTT_PORT,
    keepalive=60
)

client.loop_forever()