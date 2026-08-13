# ==========================================
# Stage 1: Build Spring Boot application
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first to optimize Docker layer caching
COPY pom.xml ./

# Download Maven dependencies
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build the Spring Boot application with a fixed output name
RUN mvn clean package -DskipTests -Dproject.build.finalName=app

# ==========================================
# Stage 2: Run Spring Boot application
# ==========================================
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring


COPY --from=build /app/target/*.jar app.jar

# Set permissions
RUN chown spring:spring app.jar

USER spring:spring

EXPOSE 8080

# Support passing runtime JVM flags via environment variables
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]