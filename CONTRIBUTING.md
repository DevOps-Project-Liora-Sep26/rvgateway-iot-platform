# Contribution Guidelines

This document describes how work is organized within the project.  
It covers the handling of branches, commits, merge requests, and documentation.

## General

Knowledge of the overall project is shared across the team.
Although individual tasks are assigned to specific team members, 
all members shall understand the major components, infrastructure, 
deployment process, and architectural decisions of the project.

## Workflow

- Individual tasks shall be assigned to specific team members.
- All team members shall be involved in all project areas in some way.
- Code and configuration changes shall be developed on dedicated branches and integrated through merge requests.
- Documentation changes may be committed directly to the corresponding protected branch.

### Branching Strategy

The project uses a lightweight GitFlow approach with the following branches:

| Branch | Purpose |
| --- | --- |
| `main` | Stable project state and completed milestones |
| `development` | Integration branch for ongoing development |
| `feature/*` | Development of individual features or tasks |

Feature branches are created from `development` and merged back into `development` after completion.

After each project milestone, `development` is merged into `main`.


```text
Remote Repository (GitLab)

  main          ●────────────────────────────────────────●──────>
                                                         ▲
                                                         │ milestone
                                                         │ merge
  development   ●──────────●──────────●──────────●────────●──────>
                 \        ▲ \                    ▲
                  \      /   \                  /
                   ▼    /     ▼                /
  feature/*         ●──●       ●──────────────●
```

### Branch Naming

Short and descriptive branch names shall be used:

```text
feature/containerize-api
feature/add-mqtt-broker
feature/kubernetes-deployment
docs/update-architecture
fix/database-connection
```

### Merge Requests

Before a merge request is merged, the following requirements shall be met:

- The implementation shall be complete.
- Relevant tests shall pass.
- **Merge requests shall be reviewed by other team members.**
  
### Conventional Commits

Commit messages shall follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:

```text
<type>(<optional scope>): <description>
```

**Scopes are optional but should be used when a change clearly belongs to a specific project area.**

Examples:

```text
feat(api): add health endpoint
fix(mqtt): handle connection timeout
docs(meetings): add meeting protocol
docs: update project documentation
test(api): add integration tests
ci: add GitLab pipeline
chore: update dependencies
```

**Commit Types**

| Type | Purpose |
| --- | --- |
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `test` | Adding or modifying tests |
| `ci` | CI/CD configuration and pipeline changes |
| `refactor` | Code changes without changing functionality |
| `chore` | Maintenance and supporting changes |


## Documentation

- Documentation is maintained under `docs/`.
- Documentation shall be updated together with the corresponding implementation.
- Architecture Decision Records (ADRs) are used for technical and architectural decisions (`docs/adr/`).
- Architectural diagrams are part of the documentation (`docs/architecture/`).
