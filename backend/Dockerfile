# ==========================================
# Stage 1: Development with DevTools & Auto-reload
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS development

WORKDIR /app

# Install inotify-tools for instant source file monitoring and procps for process management
RUN apt-get update && apt-get install -y inotify-tools procps && rm -rf /var/lib/apt/lists/*

# Copy development entrypoint
COPY entrypoint-dev.sh /usr/local/bin/entrypoint-dev.sh
RUN chmod +x /usr/local/bin/entrypoint-dev.sh

EXPOSE 8080 5005

ENTRYPOINT ["/usr/local/bin/entrypoint-dev.sh"]

# ==========================================
# Stage 2: Production Build
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first to cache Maven dependencies
COPY pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build executable JAR without running clean
RUN mvn package -DskipTests


# ==========================================
# Stage 3: Production Runtime
# ==========================================
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

# Create a non-root user for better container security
RUN groupadd -r spring && useradd -r -g spring spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]