# ==========================================
# Stage 1: Build Spring Boot application
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
# Stage 2: Run Spring Boot application
# ==========================================
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

# Create a non-root user for better container security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy built executable JAR
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]