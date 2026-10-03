# ============================================================
# File:         gateways.py
# Author:       Markus Gerstenberg
#
# Description:
#   Gateway API routes for retrieving, assigning, and managing
#   gateways of authenticated users.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user
from db_influxdb import (
    gateway_exists_in_influxdb,
    get_latest_gateway_telemetry,
    get_historical_gateway_telemetry,
)
from db_mariadb import (
    assign_gateway_to_user,
    create_gateway,
    get_gateway_id,
    get_gateways_by_user,
    is_gateway_assigned_to_user,
    rename_gateway_for_user,
    delete_gateway_for_user,
)
from models import (
    AddGatewayRequest,
    AddGatewayResponse,
    GatewayListItemResponse,
    RenameGatewayRequest,
    RenameGatewayResponse,
    DeleteGatewayResponse,
    GatewayStatusResponse,
    LatestTelemetryResponse,
    HistoricalTelemetryResponse,
)


# ============================================================
# ROUTER CONFIGURATION
# ============================================================

router = APIRouter(
    prefix="/api/gateways",
    tags=["Gateways"],
)


# ============================================================
# API - GET GATEWAYS
# ============================================================

# *************************************************
# Function:    get_gateways
# Description: Returns all gateways assigned to the
#              currently authenticated user.
# Parameters:  user - Authenticated user
# Returns:     List of assigned gateways
# *************************************************
@router.get(
    "",
    response_model=list[GatewayListItemResponse],
    summary="Get gateways",
    description=(
        "Returns all gateways assigned to the currently "
        "authenticated user."
    ),
    responses={
        200: {
            "description": "Gateways successfully retrieved.",
        },
        401: {
            "description": "No valid session exists.",
        },
    },
)
def get_gateways(user=Depends(get_current_user)):
    return get_gateways_by_user(user["id"])


# ============================================================
# API - ADD GATEWAY
# ============================================================

# *************************************************
# Function:    add_gateway
# Description: Adds an existing gateway to the
#              currently authenticated user.
# Parameters:  gateway - Gateway UID and user-
#                        defined gateway name
#              user    - Authenticated user
# Returns:     Gateway registration status
# Notes:       The gateway must already exist in
#              InfluxDB. Gateways are shared
#              entities and can be assigned to
#              multiple users.
# *************************************************
@router.post(
    "",
    status_code=201,
    response_model=AddGatewayResponse,
    summary="Add gateway",
    description=(
        "Adds an existing gateway to the currently authenticated "
        "user. The gateway UID must already exist in InfluxDB."
    ),
    responses={
        201: {
            "description": "Gateway successfully added.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway does not exist in InfluxDB.",
        },
        409: {
            "description": "Gateway is already assigned to the user.",
        },
    },
)
def add_gateway(
    gateway: AddGatewayRequest,
    user=Depends(get_current_user),
):
    # Verify that the gateway exists in InfluxDB
    if not gateway_exists_in_influxdb(gateway.gateway_uid):
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    # Get existing gateway or create it
    gateway_id = get_gateway_id(gateway.gateway_uid)

    if gateway_id is None:
        gateway_id = create_gateway(gateway.gateway_uid)

    # Check whether gateway is already assigned to this user
    if is_gateway_assigned_to_user(
        user["id"],
        gateway_id,
    ):
        raise HTTPException(
            status_code=409,
            detail="Gateway already assigned to user",
        )

    # Assign gateway to user
    assign_gateway_to_user(
        user["id"],
        gateway_id,
        None,
    )

    return {
        "gateway_uid": gateway.gateway_uid,
        "added": True,
    }


# ============================================================
# API - RENAME GATEWAY
# ============================================================

# *************************************************
# Function:    rename_gateway
# Description: Updates the user-defined name of a
#              gateway assigned to the currently
#              authenticated user.
# Parameters:  gateway_uid - Unique gateway identifier
#              gateway     - New gateway name
#              user        - Authenticated user
# Returns:     Updated gateway name
# *************************************************
@router.patch(
    "/{gateway_uid}",
    response_model=RenameGatewayResponse,
    summary="Rename gateway",
    description=(
        "Updates the user-defined name of a gateway assigned "
        "to the currently authenticated user."
    ),
    responses={
        200: {
            "description": "Gateway successfully renamed.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway is not assigned to the user.",
        },
    },
)
def rename_gateway(
    gateway_uid: str,
    gateway: RenameGatewayRequest,
    user=Depends(get_current_user),
):
    updated = rename_gateway_for_user(
        user["id"],
        gateway_uid,
        gateway.name,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    return {
        "gateway_uid": gateway_uid,
        "name": gateway.name,
    }


# ============================================================
# API - DELETE GATEWAY
# ============================================================

# *************************************************
# Function:    delete_gateway
# Description: Deletes a gateway assignment from
#              the currently authenticated user.
# Parameters:  gateway_uid - Unique gateway identifier
#              user        - Authenticated user
# Returns:     UID of the deleted gateway
# *************************************************
@router.delete(
    "/{gateway_uid}",
    response_model=DeleteGatewayResponse,
    summary="Delete gateway",
    description=(
        "Deletes a gateway assigned to the currently "
        "authenticated user."
    ),
    responses={
        200: {
            "description": "Gateway successfully deleted.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway is not assigned to the user.",
        },
    },
)
def delete_gateway(
    gateway_uid: str,
    user=Depends(get_current_user),
):
    deleted = delete_gateway_for_user(
        user["id"],
        gateway_uid,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    return {
        "gateway_uid": gateway_uid,
    }


# ============================================================
# API - GET GATEWAY STATUS
# ============================================================

# *************************************************
# Function:    get_gateway_status
# Description: Returns the current status data of a
#              gateway assigned to the currently
#              authenticated user.
# Parameters:  gateway_uid - Unique gateway identifier
#              user        - Authenticated user
# Returns:     Current gateway status data
# *************************************************
@router.get(
    "/{gateway_uid}/status",
    response_model=GatewayStatusResponse,
    summary="Get gateway status",
    description=(
        "Returns the current status data of a gateway assigned "
        "to the authenticated user."
    ),
    responses={
        200: {
            "description": "Gateway status successfully retrieved.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway or telemetry data not found.",
        },
    },
)
def get_gateway_status(
    gateway_uid: str,
    user=Depends(get_current_user),
):
    # Get gateway database ID
    gateway_id = get_gateway_id(gateway_uid)

    # Verify that the gateway is assigned to this user
    if gateway_id is None or not is_gateway_assigned_to_user(
        user["id"],
        gateway_id,
    ):
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    # Get latest telemetry data from InfluxDB
    telemetry = get_latest_gateway_telemetry(gateway_uid)

    if telemetry is None:
        raise HTTPException(
            status_code=404,
            detail="Telemetry data not found",
        )

    return {
        "gateway_uid": gateway_uid,
        "last_telemetry": telemetry["timestamp"],
        "network_type": telemetry.get("network_type"),
        "rssi": telemetry.get("rssi"),
        "telemetry_interval": telemetry["telemetry_interval"],
    }

# ============================================================
# API - GET LATEST GATEWAY TELEMETRY
# ============================================================


# *************************************************
# Function:    get_latest_gateway_telemetry_data
# Description: Returns the latest telemetry data of
#              a gateway assigned to the currently
#              authenticated user.
# Parameters:  gateway_uid - Unique gateway identifier
#              user        - Authenticated user
# Returns:     Latest gateway telemetry data
# *************************************************
@router.get(
    "/{gateway_uid}/telemetry/latest",
    response_model=LatestTelemetryResponse,
    summary="Get latest gateway telemetry",
    description=(
        "Returns the latest telemetry data of a gateway assigned "
        "to the authenticated user."
    ),
    responses={
        200: {
            "description": "Latest telemetry successfully retrieved.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway or telemetry data not found.",
        },
    },
)
def get_latest_gateway_telemetry_data(
    gateway_uid: str,
    user=Depends(get_current_user),
):

    # Get gateway database ID
    gateway_id = get_gateway_id(gateway_uid)

    # Verify that the gateway is assigned to this user
    if gateway_id is None or not is_gateway_assigned_to_user(
        user["id"],
        gateway_id,
    ):
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    # Get latest telemetry data from InfluxDB
    telemetry = get_latest_gateway_telemetry(gateway_uid)

    if telemetry is None:
        raise HTTPException(
            status_code=404,
            detail="Telemetry data not found",
        )

    return {
        "gateway_uid": gateway_uid,
        "timestamp": telemetry["timestamp"],
        "boot_epoch_id": telemetry["boot_epoch_id"],
        "network_type": telemetry.get("network_type"),
        "rssi": telemetry.get("rssi"),
        "telemetry_interval": telemetry["telemetry_interval"],
        "house_battery_voltage": telemetry["house_battery_voltage"],
        "engine_battery_voltage": telemetry["engine_battery_voltage"],
        "temperature": telemetry["temperature"],
        "humidity": telemetry["humidity"],
        "water_alarm": telemetry["water_alarm"],
        "smoke_alarm": telemetry["smoke_alarm"],
    }

# ============================================================
# API - GET HISTORICAL GATEWAY TELEMETRY
# ============================================================


# *************************************************
# Function:    get_historical_gateway_telemetry_data
# Description: Returns historical telemetry data
#              for a selected metric of a gateway
#              assigned to the currently
#              authenticated user.
# Parameters:  gateway_uid - Unique gateway identifier
#              metric      - Telemetry metric
#              time_range  - Requested time range
#              user        - Authenticated user
# Returns:     Historical gateway telemetry data
# *************************************************
@router.get(
    "/{gateway_uid}/telemetry/historical",
    response_model=HistoricalTelemetryResponse,
    summary="Get historical gateway telemetry",
    description=(
    "Returns historical telemetry data for a selected metric "
    "of a gateway assigned to the authenticated user. "
    ),
    responses={
        200: {
            "description": "Historical telemetry successfully retrieved.",
        },
        401: {
            "description": "No valid session exists.",
        },
        404: {
            "description": "Gateway or telemetry data not found.",
        },
    },
)
def get_historical_gateway_telemetry_data(
    gateway_uid: str,
    metric: str = Query(
        ...,
        description=(
            "Supported values: `house_battery_voltage`, "
            "`engine_battery_voltage`, `temperature`, `humidity`."
        ),
        examples=["temperature"],
    ),
    time_range: str = Query(
        ...,
        alias="range",
        description=(
            "Supported units: minutes (`m`), hours (`h`), "
            "days (`d`), and weeks (`w`). "
            "Examples: `30m`, `13h`, `7d`, `4w`."
        ),
        examples=["24h"],
    ),
    user=Depends(get_current_user),
):

    # Get gateway database ID
    gateway_id = get_gateway_id(gateway_uid)

    # Verify that the gateway is assigned to this user
    if gateway_id is None or not is_gateway_assigned_to_user(
        user["id"],
        gateway_id,
    ):
        raise HTTPException(
            status_code=404,
            detail="Gateway not found",
        )

    # Get historical telemetry data from InfluxDB
    telemetry = get_historical_gateway_telemetry(
        gateway_uid,
        metric,
        time_range,
    )

    return {
        "gateway_uid": gateway_uid,
        "metric": metric,
        "range": time_range,
        "data": telemetry,
    }