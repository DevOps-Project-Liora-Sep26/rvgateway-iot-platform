#!/bin/bash

# ============================================================
# File:         init_db.sh
# Author:       Markus Gerstenberg
#
# Description:
#   Initializes the RvGateway web application database.
#   Creates the database schema, application user and
#   required database permissions.
#
# Note:
#   !!! Change the default password in user.sql !!!
#   !!! before running this script.             !!!
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Creating database schema..."
sudo mariadb < "$SCRIPT_DIR/schema.sql"

echo "Creating database user and permissions..."
sudo mariadb < "$SCRIPT_DIR/user.sql"

echo "Database initialization completed."