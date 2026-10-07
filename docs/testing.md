# Testing Strategy

This document describes how testing is done within the project.  
The goal is to ensure that individual application components work 
correctly and that their interactions can be verified in a 
reproducible and automated way.

## General

### Test Environment

**Unit tests** are generally executed during the build process, while 
**integration** and **end-to-end tests** are performed in the 
development environment before the actual deployment to the production 
environment.

### Test Automation and CI/CD

All tests are designed to be **automated and reproducible** and will be 
integrated into the CI/CD pipeline.

## Unit Tests

Unit tests verify the functionality of individual functions, classes, or 
modules independently from the rest of the application. Their purpose is 
to verify that individual parts of the application behave as expected and 
continue to work correctly after code changes.

Unit tests shall be automated, reproducible, and independent from external 
services. Dependencies such as **MariaDB, InfluxDB, and the MQTT broker** 
are mocked where required.

### Gateway Simulator

The Gateway Simulator is **not part of the actual backend application**. 
It simulates an external IoT gateway and generates randomized gateway 
telemetry for development and demonstration purposes.

Unit testing is limited to the generated telemetry data. MQTT communication 
itself is not part of unit testing.

Typical tests include:

| Test Case | Expected Result |
| --- | --- |
| Required fields | All required telemetry fields are present |
| Field names | Fields follow the defined telemetry schema |
| Data types | Values use the expected data types |
| Value ranges | Generated values are within the defined ranges |
| Payload format | Generated payload is valid JSON |

#### Test Structure

Gateway Simulator unit tests are implemented using **pytest** and stored 
in a dedicated `tests/` directory.

```text
tools/
└── gateway-simulator/
    ├── <simulator files>
    └── tests/
        └── test_telemetry.py
```

Test files follow the `test_*.py` naming convention and are 
executed using:

```bash
pytest
```

The simulator is not used for automated integration or end-to-end 
testing, as these tests require deterministic and reproducible input 
data. A dedicated **MQTT Test Agent** will therefore be used to 
publish predefined telemetry data for these tests.

Since the MQTT Test Agent uses the same telemetry schema as the Gateway 
Simulator, the same payload validation unit tests may be reused for both 
components.

### Telemetry Ingest

Unit tests for the Telemetry Ingest service focus on the processing 
of incoming MQTT telemetry. Communication with the MQTT broker and 
InfluxDB is excluded from unit testing and tested separately through 
integration tests.

The main unit tests cover **MQTT payload parsing, telemetry validation, 
data transformation, error handling, and preparation of data for InfluxDB**.

Typical telemetry processing tests include:

| Test Case | Expected Result |
| --- | --- |
| Valid MQTT payload | Accepted and parsed |
| Invalid JSON | Rejected |
| Missing required field | Handled correctly |
| Invalid data type | Rejected |
| Invalid value | Handled correctly |
| Valid telemetry data | Correctly transformed |

InfluxDB-related functions are unit tested only where application-specific 
processing logic exists. The actual InfluxDB client is mocked to ensure 
that unit tests do not require a running database.

MQTT communication itself is not part of unit testing. Tests requiring a 
running MQTT broker or an actual InfluxDB instance are covered by 
integration tests.

#### Test Structure

Telemetry Ingest unit tests are implemented using **pytest** and 
stored in a dedicated `tests/` directory within the service.

The test structure should reflect the structure of the production 
code. For example:

```text
service/
└── telemetry-ingest/
    ├── <production modules>
    └── tests/
        ├── test_payload.py
        ├── test_validation.py
        └── test_processing.py
```

The exact test files will be aligned with the existing Telemetry 
Ingest modules during implementation.

Test files follow the `test_*.py` naming convention and are 
executed using:

```bash
pytest
```

Each test must run independently and produce reproducible results 
without requiring a running MQTT broker or InfluxDB instance.

### API

API unit tests verify individual functions and application logic 
independently from the running application and external services. 
External dependencies such as **MariaDB** and **InfluxDB** are 
mocked where required.

The current API structure provides the following candidates for 
unit testing:

```text
api/
├── auth.py
│   └── authentication and token handling
│
├── db_influxdb.py
│   └── application logic related to InfluxDB access
│
├── db_mariadb.py
│   └── application logic related to MariaDB access
│
├── models.py
│   └── data model and input/output validation
│
├── routers/
│   ├── authentication.py
│   │   └── authentication endpoint logic
│   │
│   ├── gateways.py
│   │   └── gateway endpoint logic
│   │
│   └── profile.py
│       └── profile endpoint logic
│
└── main.py
    └── application setup; no dedicated unit tests initially required
```

The main unit test candidates are therefore `auth.py`, `models.py`, 
the individual router modules, and independently testable application 
logic contained in the database modules.

Typical authentication tests include:

| Test Case | Expected Result |
| --- | --- |
| Correct password | Accepted |
| Wrong password | Rejected |
| Valid token | Accepted |
| Invalid token | Rejected |
| Expired token | Rejected |

Model tests verify the defined data structures and validation rules:

| Test Case | Expected Result |
| --- | --- |
| Valid input | Accepted |
| Missing required field | Rejected |
| Invalid data type | Rejected |
| Invalid value | Rejected |

Tests for the actual API endpoints and their HTTP responses are 
covered separately by integration tests.

Database modules are unit tested only where application-specific 
logic exists. Database connections are mocked; communication with 
actual MariaDB and InfluxDB instances is covered by integration tests.

#### Test Structure

API unit tests are implemented using **pytest** and stored in a 
dedicated `tests/` directory within the API component. The test 
structure reflects the structure of the production code.

```text
api/
├── auth.py
├── db_influxdb.py
├── db_mariadb.py
├── main.py
├── models.py
│
├── routers/
│   ├── authentication.py
│   ├── gateways.py
│   └── profile.py
│
└── tests/
    ├── test_auth.py
    ├── test_models.py
    ├── test_db_influxdb.py
    ├── test_db_mariadb.py
    └── routers/
        ├── test_authentication.py
        ├── test_gateways.py
        └── test_profile.py
```

Test files follow the `test_*.py` naming convention and are 
executed using:

```bash
pytest
```

Each test must run independently and produce reproducible results 
without requiring running database services.

### Frontend

Frontend unit tests focus on selected components and application 
logic that can be tested independently from the backend.

For the initial implementation, testing is limited to a small number 
of representative components and functions. API responses are mocked 
where required.

Typical test cases include:

| Test Case | Expected Result |
| --- | --- |
| Component with valid data | Component is rendered correctly |
| User interaction | Expected behavior is triggered |
| Invalid input | Validation message is displayed |
| Error state | Error is handled correctly |

#### Test Structure

Tests are stored within the frontend project using the structure 
and naming conventions of the selected test framework.

```text
frontend/
├── app/
├── ...
└── tests/
    └── <frontend unit tests>
```

The exact test framework and test structure will be defined 
during implementation.

## Integration Tests

### MQTT Broker → Telemetry Ingest → InfluxDB
### API ↔ MariaDB
### API ↔ InfluxDB
### Frontend ↔ API

## End-to-End Tests

### MQTT Simulator → Frontend

## Future Considerations
