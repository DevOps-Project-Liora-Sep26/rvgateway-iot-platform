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
#!/bin/bash

set -e

echo "Creating database schema..."
envsubst < /scripts/schema.sql | 
        mariadb -u root -p"${MARIADB_ROOT_PASSWORD}"

echo "Creating database user and permissions..."
envsubst < /scripts/user.sql |
    mariadb -u root -p"${MARIADB_ROOT_PASSWORD}"

echo "Database initialization completed."