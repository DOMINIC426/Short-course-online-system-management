# Short Course Management System (SCMS)

Short Course Management System (SCMS) is a Docker-based application consisting of a React frontend, Spring Boot backend, PostgreSQL, pgAdmin, Redis, MinIO, and RabbitMQ.

The project is designed so that a developer can clone the repository and start the entire system using Docker Compose.

If a required Docker image is not available locally, Docker will automatically download (pull) it from the configured Docker registry.

---

## Architecture

The system contains the following components:

* **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
* **Backend:** Spring Boot 4, Maven, Spring Web MVC, Spring Security, Spring Data JPA, Bean Validation, Redis, AMQP, Flyway, Actuator, PostgreSQL Driver, MinIO Java SDK
* **Database:** PostgreSQL
* **Database Management:** pgAdmin
* **Cache:** Redis
* **Object Storage:** MinIO
* **Message Broker:** RabbitMQ
* **Container Management:** Docker Compose

---

# Prerequisites

Before starting the system, make sure the following are installed:

* Docker
* Docker Compose
* Git

Verify Docker:

```bash
docker --version
```

Verify Docker Compose:

```bash
docker compose version
```

Verify Git:

```bash
git --version
```

---

# Required Docker Images

The project uses the following Docker images:

```text
postgres:15-alpine
dpage/pgadmin4:9.12
redis:7-alpine
minio/minio:RELEASE.2023-11-20T22-40-07Z
rabbitmq:3-management
node:24-alpine3.21
maven:3.9-eclipse-temurin-21
eclipse-temurin:21-jre
```

You do **not** need to manually download these images before starting the project.

Docker Compose will use an image that already exists locally.

If the required image does not exist locally, Docker will attempt to pull it automatically from its configured registry.

> **Note:** Internet access is required when Docker needs to download an image that is not already available locally.

---

# Project Structure

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

---

# Starting the System

## 1. Clone the Repository

Clone the project repository:

```bash
git clone <repository-url>
```

Enter the project directory:

```bash
cd short-course-management-system
```

---

## 2. Configure Environment Variables

Create the `.env` file from `.env.example`:

### Linux / macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Update the development credentials inside `.env` if necessary.

Important environment variables include:

```env
VITE_API_BASE_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_HOST=postgres
REDIS_HOST=redis
MINIO_ENDPOINT=http://minio:9000
RABBITMQ_HOST=rabbitmq
```

Production secrets and passwords must not be committed to Git.

---

# 3. Validate Docker Compose

Before starting the system, verify the Docker Compose configuration:

```bash
docker compose config
```

If no configuration errors are reported, continue to the next step.

---

# 4. Pull Required Docker Images

To explicitly download the required infrastructure images, run:

```bash
docker compose pull
```

Docker will download images that are required by services configured with an `image:` property.

If an image already exists locally and is up to date, Docker can reuse it.

> Images used only as `FROM` images inside Dockerfiles may be pulled automatically during the build if they are missing locally.

---

# 5. Build the Application

Build the frontend and backend containers:

```bash
docker compose build
```

During the build process, Docker uses the base images specified in the Dockerfiles.

For example:

```dockerfile
FROM node:24-alpine3.21
```

or:

```dockerfile
FROM maven:3.9-eclipse-temurin-21
```

If a required base image is not available locally, Docker can pull it from the configured registry.

---

# 6. Start the Entire System

Start all services:

```bash
docker compose up -d
```

Docker Compose will create and start the containers.

For services using Docker images directly, Docker can automatically pull missing images.

---

# Recommended First-Time Startup

For a completely new machine, use:

```bash
docker compose pull
docker compose build
docker compose up -d
```

Then check the containers:

```bash
docker compose ps
```

---

# One-Command Startup

You can also build and start the project with:

```bash
docker compose up -d --build
```

This is the recommended simple command for normal development.

Docker will:

1. Check the Docker Compose configuration.
2. Use locally available images where possible.
3. Pull missing service images when required.
4. Build the frontend and backend images.
5. Create the required Docker network.
6. Create the required Docker volumes.
7. Create the containers.
8. Start the services.

For a new developer, the main command is therefore:

```bash
docker compose up -d --build
```

---

# Check Container Status

After starting the system, run:

```bash
docker compose ps
```

You can also check all running Docker containers:

```bash
docker ps
```

All required services should be running or healthy.

---

# Application URLs

After the containers have started successfully, access the services using:

| Service             | URL / Port                            |
| ------------------- | ------------------------------------- |
| Frontend            | http://localhost:5174                 |
| Backend             | http://localhost:8081                 |
| Backend Health      | http://localhost:8081/api/health |
| pgAdmin             | http://localhost:5051                  |
| MinIO API           | http://localhost:9003                |
| MinIO Console       | http://localhost:9002                 |
| RabbitMQ Management | http://localhost:15673                |
| PostgreSQL          | localhost:5433                    |
| Redis               | localhost:6380                        |

---

# View Logs

View logs from all services:

```bash
docker compose logs -f
```

View logs for a specific service:

### Frontend

```bash
docker compose logs -f frontend
```

### Backend

```bash
docker compose logs -f backend
```

### PostgreSQL

```bash
docker compose logs -f postgres
```

### Redis

```bash
docker compose logs -f redis
```

### MinIO

```bash
docker compose logs -f minio
```

### RabbitMQ

```bash
docker compose logs -f rabbitmq
```

Press `Ctrl + C` to exit live logs.

---

# Stop the System

Stop and remove the running containers:

```bash
docker compose down
```

The named volumes will remain, so persistent development data will not normally be deleted.

---

# Start the System Again

After the initial setup, start the containers again using:

```bash
docker compose up -d
```

Check their status:

```bash
docker compose ps
```

If application source code or Docker build configuration has changed, use:

```bash
docker compose up -d --build
```

---

# Stop and Delete Development Data

To stop the containers and remove the project's named volumes:

```bash
docker compose down -v
```

> **Warning:** This command deletes persistent development data stored in Docker volumes.

Use it only when you intentionally want to reset the local development environment.

---

# Docker Network

All services communicate through the Docker bridge network:

```text
scms-network
```

Containers communicate using Docker service names.

Examples:

```text
postgres:5432
redis:6379
minio:9000
rabbitmq:5672
```

Inside Docker containers, do not use `localhost` to communicate with another container.

For example:

```env
DB_HOST=postgres
REDIS_HOST=redis
MINIO_ENDPOINT=http://minio:9000
RABBITMQ_HOST=rabbitmq
```

---

# Docker Volumes

The system uses the following named volumes:

```text
postgres_data
pgadmin_data
redis_data
minio_data
rabbitmq_data
```

These volumes preserve development data when containers are stopped or recreated.

---

# Backend Health Check

After starting the system, verify the backend:

```text
http://localhost:8081/api/health
```

Additional technical health endpoints include:

```text
GET /
GET /api/health
```

Spring Security is included in the backend.

Other protected backend routes require authentication. JWT authentication, users, roles, and permissions are not yet implemented in this initial technical foundation.

---

# Health Checks

Docker Compose uses health checks for infrastructure services:

* **PostgreSQL:** `pg_isready`
* **Redis:** `redis-cli ping`
* **MinIO:** `mc ready local`
* **RabbitMQ:** `rabbitmq-diagnostics -q ping`
* **Backend:** health request to `/api/health`

Check the health status:

```bash
docker compose ps
```

---

# Troubleshooting

## Docker Image Is Missing

Normally, Docker Compose will pull missing service images automatically.

You can manually pull the images defined directly in `docker-compose.yml` using:

```bash
docker compose pull
```

Then build the application:

```bash
docker compose build
```

And start it:

```bash
docker compose up -d
```

---

## Force Docker to Check for Newer Images

If you intentionally want Docker Compose to check the registry for newer service images:

```bash
docker compose pull
```

Then rebuild and restart:

```bash
docker compose up -d --build
```

---

## Check Available Images

Run:

```bash
docker image ls
```

This displays Docker images currently available locally.

---

## Check Docker Compose Configuration

Run:

```bash
docker compose config
```

Fix any configuration errors before starting the application.

---

## Check Container Status

Run:

```bash
docker compose ps
```

For all containers, including stopped containers:

```bash
docker ps -a
```

---

## Backend Fails to Start

Check backend logs:

```bash
docker compose logs -f backend
```

Also check PostgreSQL:

```bash
docker compose logs -f postgres
```

---

## Frontend Fails to Start

Check frontend logs:

```bash
docker compose logs -f frontend
```

---

## Database Problems

Check PostgreSQL logs:

```bash
docker compose logs -f postgres
```

Verify that PostgreSQL is healthy:

```bash
docker compose ps
```

---

## Redis Problems

```bash
docker compose logs -f redis
```

---

## MinIO Problems

```bash
docker compose logs -f minio
```

---

## RabbitMQ Problems

```bash
docker compose logs -f rabbitmq
```

---

# Important Docker Networking Note

Inside a Docker container:

```text
localhost
```

refers to the container itself, not the host machine and not another container.

Therefore, the backend communicates with infrastructure services using their Docker Compose service names:

```text
postgres
redis
minio
rabbitmq
```

Example:

```env
DB_HOST=postgres
REDIS_HOST=redis
MINIO_ENDPOINT=http://minio:9000
RABBITMQ_HOST=rabbitmq
```

---

# Quick Start

For a new developer:

```bash
# 1. Clone the project
git clone <repository-url>

# 2. Open the project
cd short-course-management-system

# 3. Create the environment file
cp .env.example .env

# 4. Pull infrastructure images
docker compose pull

# 5. Build frontend and backend
docker compose build

# 6. Start the entire system
docker compose up -d

# 7. Check status
docker compose ps
```

Or simply:

```bash
docker compose up -d --build
```

After startup:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:8081
pgAdmin:  http://localhost:5051
MinIO:    http://localhost:9002
RabbitMQ: http://localhost:15673
```

To stop:

```bash
docker compose down
```

---

# Important Docker Compose Configuration

The project **must not use**:

```yaml
pull_policy: never
```

because that configuration prevents Docker Compose from downloading a missing image.

For infrastructure services, normal image configuration should be used.

Example:

```yaml
services:

  postgres:
    image: postgres:15-alpine

  pgadmin:
    image: dpage/pgadmin4:9.12

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio:RELEASE.2023-11-20T22-40-07Z

  rabbitmq:
    image: rabbitmq:3-management
```

With this configuration, if an image does not exist locally, Docker Compose can retrieve it from the configured registry.

---

# Summary

The SCMS Docker setup supports both situations:

**If the Docker image already exists locally:**

```text
Docker → uses the local image → starts the container
```

**If the Docker image does not exist locally:**

```text
Docker → pulls the image from the registry → creates the container → starts the service
```

For most developers, the recommended startup command is:

```bash
docker compose up -d --build
```

For a completely new machine, the more explicit startup sequence is:

```bash
docker compose pull
docker compose build
docker compose up -d
docker compose ps
```
