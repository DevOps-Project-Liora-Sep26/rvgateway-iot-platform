# Meeting Protocol

## Meeting Information

**Date:** 2026-10-06  
**Time:** 14:00 – 17:00  
**Location / Meeting Type:** ProtonMeet  
**Participants:**  
- Philipp Ammon
- Sebastian Röwer
- Markus Gerstenberg

## 1. Topic: Application Components and Containerization

### Discussion:
- Reviewed the existing application components and identified which services still need to be containerized.

### Decision / Result:

| Repo folder | Purpose | Deployment Approach |
| --- | --- | --- |
| `api` | Communication between the web application and databases | To be containerized |
| `influxDB` | Database for telemetry data | Official Docker image |
| `mariaDB` | Database for user and gateway information | Official Docker image |
| `frontend` | Web application | To be containerized |
| `service/telemetry-ingest` | Transfers telemetry data from the MQTT broker to the database | Already containerized |
| `test/mqtt-test` | Simulates the edge device | Already containerized |
| `test/additional-tests` | Additional tests for deployment | To be specified |
| — | MQTT broker | Mosquitto container or external HiveMQ service |
| — | Reverse proxy / ingress | NGINX or Traefik — to be evaluated |
| — | Alarm service | Not planned for the current project scope |
| — | Prometheus and Grafana | Planned for Phase 5 |

## 2. Topic: Project Roadmap

### Discussion:
- Reviewed the project phases, milestones, and required deliverables until the final defence.

### Decision / Result:

| Project Phase | Period | Milestone / Goal |
| --- | --- | --- |
| Phase 2 | 2026-10-02 – 2026-10-22 | Deploy the first application version |
| Phase 3 | 2026-10-23 – 2026-11-01 | Set up the CI/CD system |
| Phase 4 | 2026-11-02 – 2026-11-22 | Deploy in the cloud |
| Phase 5 | 2026-11-23 – 2026-12-07 | Set up a security monitoring system |
| Phase 6 | 2026-12-08 – 2026-12-14 | Automated deployment in the cloud |
| Defence | 2026-12-15 | Final project defence |

## 3. Topic: Responsibilities and Work Distribution

### Discussion:
- Discussed project work areas, ownership, prior experience, and how tasks should be distributed within the team.

### Decision / Result:

- All team members contribute to all major project areas.
- Individual tasks are assigned to specific team members.
- Knowledge and responsibility for the overall project remain shared across the team.

## 4. Topic: Project Documentation

### Discussion:
- Discussed the documentation structure, meeting protocols, planning documents, and how project decisions should be documented.

### Decision / Result:
- Technical documentation is stored in the repository, project organization and meeting protocols in OneDrive, and Slack is used for temporary communication.
- Architecture Decision Records (ADRs) are used to document significant technical and architectural decisions.
- Important technical decisions are transferred to the corresponding repository documentation and, where applicable, documented as ADRs.

```text
Repository
├── README.md
├── CONTRIBUTING.md
└── docs/
    ├── architecture/
    │   └── ...
    ├── adr/
    │   └── ...
    ├── infrastructure/
    │   └── ...
    ├── glossary.md
    ├── tech-stack.md
    ├── containerization.md
    ├── orchestration.md
    ├── ci-cd.md
    ├── monitoring.md
    ├── security.md
    ├── disaster-recovery.md
    └── deployment-guide.md

OneDrive: Planing / Working Documents / Temporary Exchange

Slack: Communication 
```

## 5. Topic: Repository Platform

### Discussion:
- Compared GitHub and GitLab as the repository and collaboration platform for the project.

### Decision / Result:
- Migrate repository to GitLab

## 6. Topic: Branching Strategy

### Discussion:
- Compared possible Git branching strategies and discussed a lightweight GitFlow approach for the project.

### Decision / Result:
- Use a lightweight GitFlow strategy with `main`, `development`, and `feature/*` branches.
- Merge `development` into `main` after each project milestone.
- Use Conventional Commits for commit messages.
- Document the branching and commit conventions in `CONTRIBUTING.md`.

## 7. Topic: Infrastructure and Kubernetes

### Discussion:
- Discussed the available Proxmox infrastructure and the planned Kubernetes setup for later project phases.

### Decision / Result:

- A Proxmox environment is expected to become available later in the project.
- Until then, development and deployment will be performed locally.
- The local environment is sufficient for the current containerization and Kubernetes tasks.

## Tasks / Action Items

| Task | Assigned To | Due Date |
|---|---|---|
| GitLab Setup | Philipp | 2026-10-09 |
| Repo umziehen | Philipp | 2026-10-07 |
| GitFlow light (main) | Philipp | 2026-10-08 |
| API => Container | Sebastian | 2026-10-14 |
| FrontEnd => Container | Philipp | 2026-10-14 |
| MariaDB => Container | Sebastian | 2026-10-14 |
| Influx => Container | Markus | 2026-10-14 |
| Nygard-Template => Share | Philipp | 2026-10-07 |
| K8s Setup | ? | 2026-10-23 |
| Mosquito MQTT => Container | Markus | 2026-10-14 |
| Meeting template | Markus | 2026-10-07 |
| CONTRIBUTES.md | Markus | 2026-10-08 |

---

## Notes

- 
- 
