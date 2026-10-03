# ============================================================
# File:         main.py
# Author:       Markus Gerstenberg
#
# Description:
#   FastAPI application entry point for the RvGateway
#   web application. Configures the application, CORS
#   middleware and API routers.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.authentication import router as authentication_router
from routers.gateways import router as gateways_router
from routers.profile import router as profile_router


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

# switches from parent folder one level higher webapp/.env
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

app = FastAPI(
    title="RvGateway Web API",
    description=(
        "REST API for the RvGateway IoT Monitoring Platform.\n\n"
        "The API provides user registration, authentication, "
        "session management and profile management.\n\n"
        "Authentication is handled using server-side sessions. "
        "After successful login, the client receives an HttpOnly "
        "session cookie."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(authentication_router)
app.include_router(profile_router)
app.include_router(gateways_router)
