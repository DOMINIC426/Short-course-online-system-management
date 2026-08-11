# Short Course Management System

SCMS is currently an initial runnable technical foundation only. It contains a React frontend, a Spring Boot backend, and Docker Compose infrastructure for PostgreSQL, pgAdmin, Redis, MinIO, and RabbitMQ.

No SCMS business logic is implemented in this phase.

## Architecture

- `frontend`: React, Vite, Tailwind CSS, React Router, Axios.
- `backend`: Spring Boot 4, Maven, Spring Web MVC, Spring Security, Spring Data JPA, Bean Validation, Redis, AMQP, Flyway, Actuator, PostgreSQL driver, MinIO Java SDK.
- `docker-compose.yml`: single Docker infrastructure file for all services, network, named volumes, ports, environment variables, dependencies, and health checks.

## Local Docker Image Policy

This project is configured to use only Docker images already available locally. Do not run:

- `docker pull`
- `docker compose pull`
- `docker image pull`
- `docker build --pull`
- `docker compose build --pull`

Inspect local images first:

```bash
docker image ls
docker image inspect postgres:15-alpine
docker image inspect dpage/pgadmin4:9.12
docker image inspect redis:7-alpine
docker image inspect minio/minio:RELEASE.2023-11-20T22-40-07Z
docker image inspect rabbitmq:3-management
docker image inspect node:24-alpine3.21
docker image inspect dhi.io/maven:3-jdk25-debian13-dev
docker image inspect eclipse-temurin:26.0.1_8-jre-noble
```

Infrastructure services use `pull_policy: never`.

## Directory Structure

```text
short-course-management-system/
├── frontend/
│   ├── Dockerfile
│   └── ...
├── backend/
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md
```


## Environment

Copy `.env.example` to `.env` when starting a new local environment and change development credentials as needed. Production secrets must not be committed. The pgAdmin image validates email domains, so the default uses `admin@scms.example.com` rather than a reserved `.local` address.

Key variables:

- `VITE_API_BASE_URL=http://localhost:8080`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- `DB_HOST=postgres` inside Docker
- `REDIS_HOST=redis` inside Docker
- `MINIO_ENDPOINT=http://minio:9000` inside Docker
- `RABBITMQ_HOST=rabbitmq` inside Docker

## Services and Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Backend health: http://localhost:8080/actuator/health
- pgAdmin: http://localhost:5050
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001
- RabbitMQ Management: http://localhost:15672
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Docker Compose

Validate, build, start, and inspect:

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

Logs:

```bash
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f minio
docker compose logs -f rabbitmq
```

Stop containers:

```bash
docker compose down
```

Warning: this deletes persistent development volume data:

```bash
docker compose down -v
```

## Network and Volumes

All services use one bridge network:

- `scms-network`

Named volumes:

- `postgres_data`
- `pgadmin_data`
- `redis_data`
- `minio_data`
- `rabbitmq_data`

## Security Foundation

Spring Security is included. This phase permits only technical health endpoints:

- `GET /`
- `GET /api/health`
- `GET /actuator/health`

All other backend routes require authentication. JWT, authentication workflows, users, roles, and permissions are intentionally not implemented yet.

## Health Checks

- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- MinIO: `mc ready local`
- RabbitMQ: `rabbitmq-diagnostics -q ping`
- Backend: bash TCP request to `/actuator/health`, because the selected Java runtime image does not include `curl` or `wget`

## Troubleshooting

Confirm local images exist:

```bash
docker image ls
```

Render Compose config:

```bash
docker compose config
```

Check service status:

```bash
docker compose ps
```

Inspect backend connectivity:

```bash
docker compose logs -f backend
```

Remember that `localhost` inside a container is the container itself. Docker service names are used for internal communication: `postgres`, `redis`, `minio`, and `rabbitmq`.
