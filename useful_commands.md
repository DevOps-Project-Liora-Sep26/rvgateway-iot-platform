# Important Commands

Quick reference for the RV Gateway / DevOps project.

## Venv

### Activate virtual environment

``` bash
source .venv/bin/activate
```

### Deactivate virtual environment

``` bash
deactivate
```

### Create virtual environment

``` bash
python3 -m venv .venv
```

### Install dependencies

``` bash
pip install -r requirements.txt
```

### Save installed dependencies

``` bash
pip freeze > requirements.txt
```

### Show installed packages

``` bash
pip list
```

------------------------------------------------------------------------

## FastAPI

### Start development server

``` bash
uvicorn main:app --reload
```

### Start on a specific host and port

``` bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Open API documentation

``` text
http://localhost:8000/docs
```

### Open alternative API documentation

``` text
http://localhost:8000/redoc
```

### Test API endpoint

``` bash
curl http://localhost:8000/api/me
```

### Test API endpoint with headers

``` bash
curl -i http://localhost:8000/api/me
```

------------------------------------------------------------------------

## Next.js

### Install dependencies

``` bash
npm install
```

### Start development server

``` bash
npm run dev
```

### Create production build

``` bash
npm run build
```

### Start production build

``` bash
npm start
```

### Run linter

``` bash
npm run lint
```

### Install a package

``` bash
npm install <PACKAGE_NAME>
```

### Remove a package

``` bash
npm uninstall <PACKAGE_NAME>
```

### Check installed packages

``` bash
npm list
```

### Open development frontend

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## InfluxDB

### Check service status

``` bash
sudo systemctl status influxdb
```

### Start InfluxDB

``` bash
sudo systemctl start influxdb
```

### Stop InfluxDB

``` bash
sudo systemctl stop influxdb
```

### Restart InfluxDB

``` bash
sudo systemctl restart influxdb
```

### Enable InfluxDB at system startup

``` bash
sudo systemctl enable influxdb
```

### Show InfluxDB logs

``` bash
sudo journalctl -u influxdb
```

### Follow InfluxDB logs

``` bash
sudo journalctl -u influxdb -f
```

### Check InfluxDB CLI

``` bash
influx version
```

### Show configured CLI connections

``` bash
influx config list
```

### List organizations

``` bash
influx org list
```

### List buckets

``` bash
influx bucket list
```

### List authentication tokens

``` bash
influx auth list
```

### Query data with Flux

``` bash
influx query '
from(bucket: "<BUCKET_NAME>")
  |> range(start: -1h)
'
```

### Query a specific measurement

``` bash
influx query '
from(bucket: "<BUCKET_NAME>")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "<MEASUREMENT>")
'
```

### Delete all data from a bucket

``` bash
influx delete \
  --bucket "<BUCKET_NAME>" \
  --start 1970-01-01T00:00:00Z \
  --stop 2100-01-01T00:00:00Z
```

### Open InfluxDB Web UI

``` text
http://localhost:8086
```

------------------------------------------------------------------------

## MariaDB

### Check service status

``` bash
sudo systemctl status mariadb
```

### Start MariaDB

``` bash
sudo systemctl start mariadb
```

### Stop MariaDB

``` bash
sudo systemctl stop mariadb
```

### Restart MariaDB

``` bash
sudo systemctl restart mariadb
```

### Open MariaDB shell

``` bash
sudo mariadb
```

### Login with username and password

``` bash
mariadb -u <USERNAME> -p
```

### List databases

``` sql
SHOW DATABASES;
```

### Select database

``` sql
USE <DATABASE_NAME>;
```

### List tables

``` sql
SHOW TABLES;
```

### Show table structure

``` sql
DESCRIBE <TABLE_NAME>;
```

### Show table contents

``` sql
SELECT * FROM <TABLE_NAME>;
```

### Show selected rows

``` sql
SELECT * FROM <TABLE_NAME>
WHERE <CONDITION>;
```

### Insert a row

``` sql
INSERT INTO <TABLE_NAME> (<COLUMN_1>, <COLUMN_2>)
VALUES (<VALUE_1>, <VALUE_2>);
```

### Update rows

``` sql
UPDATE <TABLE_NAME>
SET <COLUMN_NAME> = <VALUE>
WHERE <CONDITION>;
```

### Delete rows

``` sql
DELETE FROM <TABLE_NAME>
WHERE <CONDITION>;
```

### Delete all rows from a table

``` sql
DELETE FROM <TABLE_NAME>;
```

### Exit MariaDB

``` sql
EXIT;
```

### Create database backup

``` bash
mariadb-dump -u <USERNAME> -p <DATABASE_NAME> > backup.sql
```

### Restore database backup

``` bash
mariadb -u <USERNAME> -p <DATABASE_NAME> < backup.sql
```

------------------------------------------------------------------------

## Useful Process / Port Commands

### Show processes listening on ports

``` bash
sudo ss -tulpn
```

### Check a specific port

``` bash
sudo ss -tulpn | grep <PORT>
```

Examples:

``` bash
sudo ss -tulpn | grep 8000
sudo ss -tulpn | grep 3000
sudo ss -tulpn | grep 8086
sudo ss -tulpn | grep 3306
```

Typical local ports:

  Service               Port
  ------------------- ------
  Next.js               3000
  FastAPI / Uvicorn     8000
  InfluxDB              8086
  MariaDB               3306
