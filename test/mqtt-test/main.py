import json
import os
import random
import ssl
import time

import paho.mqtt.client as mqtt

# ==================================================
# Secrets Configuration
# ==================================================

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

MQTT_HOST = os.environ["MQTT_HOST"]
MQTT_PORT = int(os.getenv("MQTT_PORT", "8883"))

MQTT_USER_NAME = os.environ["MQTT_USER_NAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]

GATEWAY_ID = os.getenv("GATEWAY_ID", "806CF2A172E0")

MQTT_TOPIC = f"gateway/{GATEWAY_ID}/measurement"
CLIENT_ID = f"test-{GATEWAY_ID}"

PUBLISH_INTERVAL = int(os.getenv("PUBLISH_INTERVAL_SEC", "900"))

NETWORK_TYPE = os.getenv("NETWORK_TYPE", "WIFI")
INITIAL_RSSI = int(os.getenv("RSSI", "-50"))


# -----------------------------------------------------------------------------
# Simulation configuration
# -----------------------------------------------------------------------------

BOOT_EPOCH_ID = random.randint(100, 999)

house_battery_voltage = 12.7
engine_battery_voltage = 12.6
temperature = 21.0
humidity = 55.0
rssi = INITIAL_RSSI

water_alarm_cycles = 0
smoke_alarm_cycles = 0


# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------

def clamp(value, minimum, maximum):
    return max(minimum, min(value, maximum))


def simulate_telemetry():
    global house_battery_voltage
    global engine_battery_voltage
    global temperature
    global humidity
    global rssi
    global water_alarm_cycles
    global smoke_alarm_cycles

    # Slowly changing battery voltages
    house_battery_voltage += random.uniform(-0.08, 0.08)
    engine_battery_voltage += random.uniform(-0.05, 0.05)

    house_battery_voltage = clamp(
        house_battery_voltage,
        11.2,
        13.8,
    )

    engine_battery_voltage = clamp(
        engine_battery_voltage,
        11.5,
        13.8,
    )

    # Slowly changing environmental values
    temperature += random.uniform(-0.4, 0.4)
    humidity += random.uniform(-1.5, 1.5)

    temperature = clamp(
        temperature,
        -10.0,
        40.0,
    )

    humidity = clamp(
        humidity,
        20.0,
        95.0,
    )

    # Simulate changing signal strength
    rssi += random.randint(-2, 2)
    rssi = int(clamp(rssi, -95, -35))

     # Simulate water alarm
    if water_alarm_cycles > 0:
        water_alarm_cycles -= 1
    elif random.random() < 0.05:
        water_alarm_cycles = random.randint(3, 6)

    # Simulate smoke alarm
    if smoke_alarm_cycles > 0:
        smoke_alarm_cycles -= 1
    elif random.random() < 0.03:
        smoke_alarm_cycles = random.randint(3, 6)

    return {
        "bootEpochId": BOOT_EPOCH_ID,
        "timestamp": int(time.time()),
        "houseBatteryVoltage": round(house_battery_voltage, 2),
        "engineBatteryVoltage": round(engine_battery_voltage, 2),
        "temperature": round(temperature, 1),
        "humidity": round(humidity, 1),
        "waterAlarm": water_alarm_cycles > 0,
        "smokeAlarm": smoke_alarm_cycles > 0,
        "networkType": NETWORK_TYPE,
        "rssi": rssi,
        "telemetryInterval": PUBLISH_INTERVAL,
    }


# -----------------------------------------------------------------------------
# MQTT callbacks
# -----------------------------------------------------------------------------

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker", flush=True)
    else:
        print(f"MQTT connection failed: {rc}", flush=True)


def on_publish(client, userdata, mid):
    print(f"Message published [mid={mid}]", flush=True)


# -----------------------------------------------------------------------------
# MQTT client
# -----------------------------------------------------------------------------

client = mqtt.Client(
    client_id=CLIENT_ID
)

client.username_pw_set(
    MQTT_USER_NAME,
    MQTT_PASSWORD
)

client.tls_set(
    cert_reqs=ssl.CERT_REQUIRED,
    tls_version=ssl.PROTOCOL_TLS_CLIENT
)

client.on_connect = on_connect
client.on_publish = on_publish


# -----------------------------------------------------------------------------
# Connect
# -----------------------------------------------------------------------------

print(f"Connecting to {MQTT_HOST}:{MQTT_PORT}...", flush=True)

client.connect(
    MQTT_HOST,
    MQTT_PORT,
    keepalive=60
)

client.loop_start()

time.sleep(1)


# -----------------------------------------------------------------------------
# Publish telemetry
# -----------------------------------------------------------------------------

try:
    while True:

        telemetry = simulate_telemetry()

        payload = json.dumps(telemetry)

        print(f"Topic: {MQTT_TOPIC}", flush=True)
        print(f"Payload: {payload}", flush=True)

        result = client.publish(
            MQTT_TOPIC,
            payload,
            qos=1
        )

        result.wait_for_publish()

        print(
            f"Next measurement in {PUBLISH_INTERVAL} seconds\n",
            flush=True
        )

        time.sleep(PUBLISH_INTERVAL)

except KeyboardInterrupt:
    print("Stopping telemetry publisher...", flush=True)

finally:
    client.disconnect()
    client.loop_stop()

    print("Disconnected", flush=True)