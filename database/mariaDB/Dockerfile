# ============================================================
# File:         Dockerfile
# Author:       Sebastian Röwer

# Description:  Docker deployment configuration for the 
#               mariaDB service.
# Created At:   08.10.2026
# ============================================================




FROM mariadb:11.4
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/
    
COPY init.sh docker-entrypoint-initdb.d/init.sh
COPY schema.sql user.sql /scripts/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh
EXPOSE 3306
CMD ["mariadbd"]