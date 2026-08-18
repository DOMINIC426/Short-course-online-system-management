# ==========================================
# Stage 1: Development with Auto-Reload
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS development

WORKDIR /app

# Install file watcher for automatic recompilation
RUN apt-get update \
    && apt-get install -y --no-install-recommends inotify-tools \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8080 5005

CMD ["bash", "-c", "\
    mvn spring-boot:run -DskipTests & \
    APP_PID=$!; \
    echo '=========================================================='; \
    echo ' SCMS Backend Development Server'; \
    echo ' Auto Reload: ENABLED'; \
    echo '=========================================================='; \
    sleep 5; \
    while true; do \
        inotifywait -r -q \
            -e modify,create,delete,move \
            /app/src /app/pom.xml; \
        echo '[AUTO-RELOAD] Source change detected...'; \
        sleep 1; \
        if mvn compile -DskipTests; then \
            echo '[AUTO-RELOAD] Compilation successful.'; \
        else \
            echo '[AUTO-RELOAD] Compilation failed. Fix your code and save again.'; \
        fi; \
    done; \
    wait $APP_PID \
"]


# ==========================================
# Stage 2: Production Build
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first to cache Maven dependencies
COPY pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy application source
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

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]