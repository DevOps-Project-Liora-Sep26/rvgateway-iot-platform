# ============================================================
# File:         models.py
# Author:       Markus Gerstenberg
#
# Description:
#   Pydantic request and response models for the
#   RvGateway Web API.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from pydantic import BaseModel, Field
from datetime import datetime


# ============================================================
# REQUEST MODELS
# ============================================================

class LoginRequest(BaseModel):
    email: str = Field(
        ...,
        description="Registered email address of the user.",
        examples=["user@example.com"],
    )

    password: str = Field(
        ...,
        description="Password of the user.",
        examples=["MySecurePassword"],
    )

class RegisterRequest(BaseModel):
    email: str = Field(
        ...,
        description="Email address for the new user account.",
        examples=["user@example.com"],
    )

    password: str = Field(
        ...,
        description="Password for the new user account.",
        examples=["MySecurePassword"],
    )

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        ...,
        description="Current password of the authenticated user.",
        examples=["CurrentPassword"],
    )

    new_password: str = Field(
        ...,
        description="New password for the authenticated user.",
        examples=["NewSecurePassword"],
    )

class AddGatewayRequest(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

class RenameGatewayRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="New user-defined name of the gateway.",
        examples=["My Camper"],
    )

# ============================================================
# RESPONSE MODELS
# ============================================================

class RegisterResponse(BaseModel):
    registered: bool = Field(
        ...,
        description="Indicates whether the user was registered.",
        examples=[True],
    )

class LoginResponse(BaseModel):
    authenticated: bool = Field(
        ...,
        description="Indicates whether authentication succeeded.",
        examples=[True],
    )

class LogoutResponse(BaseModel):
    authenticated: bool = Field(
        ...,
        description="Authentication state after logout.",
        examples=[False],
    )

class UserResponse(BaseModel):
    id: int = Field(
        ...,
        description="Unique database identifier of the user.",
        examples=[1],
    )

    email: str = Field(
        ...,
        description="Email address of the user.",
        examples=["user@example.com"],
    )

class PasswordChangeResponse(BaseModel):
    password_changed: bool = Field(
        ...,
        description="Indicates whether the password was changed.",
        examples=[True],
    )

class ProfileDeleteResponse(BaseModel):
    profile_deleted: bool = Field(
        ...,
        description="Indicates whether the user profile was deleted.",
        examples=[True],
    )

class AddGatewayResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

    added: bool = Field(
        ...,
        description="Indicates whether the gateway was added to the user.",
        examples=[True],
    )

class GatewayListItemResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

    name: str | None = Field(
        default=None,
        description="User-defined name of the gateway.",
        examples=["My Camper"],
    )

class RenameGatewayResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the renamed gateway.",
        examples=["GW12345678"],
    )

    name: str = Field(
        ...,
        description="New user-defined name of the gateway.",
        examples=["My Camper"],
    )

class DeleteGatewayResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the deleted gateway.",
        examples=["GW12345678"],
    )


class GatewayStatusResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

    last_telemetry: datetime = Field(
        ...,
        description="Timestamp of the last received telemetry data.",
        examples=["2026-09-30T12:49:52Z"],
    )

    network_type: str | None = Field(
        None,
        description="Network type used for the last telemetry transmission.",
        examples=["CELLULAR"],
    )

    rssi: int | None = Field(
        None,
        description="Received signal strength indicator of the last telemetry transmission.",
        examples=[20],
    )

    telemetry_interval: int = Field(
        ...,
        description="Telemetry interval in seconds at the time of the last transmission.",
        examples=[50],
    )

class LatestTelemetryResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

    timestamp: datetime = Field(
        ...,
        description="Timestamp of the latest telemetry data.",
        examples=["2026-10-01T12:34:56Z"],
    )

    boot_epoch_id: int = Field(
        ...,
        description="Boot epoch ID of the gateway at the time of the last telemetry transmission.",
        examples=[1999],
    )

    network_type: str | None = Field(
        None,
        description="Network type used for the last telemetry transmission.",
        examples=["CELLULAR"],
    )

    rssi: int | None = Field(
        None,
        description="Received signal strength indicator of the last telemetry transmission.",
        examples=[20],
    )

    telemetry_interval: int = Field(
        ...,
        description="Telemetry interval in seconds at the time of the last transmission.",
        examples=[50],
    )

    house_battery_voltage: float = Field(
        ...,
        description="Current house battery voltage in volts.",
        examples=[12.7],
    )

    engine_battery_voltage: float = Field(
        ...,
        description="Current engine battery voltage in volts.",
        examples=[12.6],
    )

    temperature: float = Field(
        ...,
        description="Current temperature in degrees Celsius.",
        examples=[21.4],
    )

    humidity: float = Field(
        ...,
        description="Current relative humidity in percent.",
        examples=[61.2],
    )

    water_alarm: bool = Field(
        ...,
        description="Indicates whether the water alarm is active.",
        examples=[False],
    )

    smoke_alarm: bool = Field(
        ...,
        description="Indicates whether the smoke alarm is active.",
        examples=[False],
    )
    
class HistoricalTelemetryDataPoint(BaseModel):
    timestamp: datetime = Field(
        ...,
        description="Timestamp of the telemetry measurement.",
        examples=["2026-10-01T17:00:00Z"],
    )

    telemetry_interval: int = Field(
        ...,
        description=(
            "Configured telemetry interval in seconds "
            "at the time of the measurement."
        ),
        examples=[50],
    )

    value: float = Field(
        ...,
        description="Measured telemetry value.",
        examples=[25.6],
    )


class HistoricalTelemetryResponse(BaseModel):
    gateway_uid: str = Field(
        ...,
        description="Unique identifier of the gateway.",
        examples=["GW12345678"],
    )

    metric: str = Field(
        ...,
        description="Telemetry metric returned by the request.",
        examples=["temperature"],
    )

    range: str = Field(
        ...,
        description="Requested historical time range.",
        examples=["24h"],
    )

    data: list[HistoricalTelemetryDataPoint] = Field(
        ...,
        description="Historical telemetry measurements.",
    )