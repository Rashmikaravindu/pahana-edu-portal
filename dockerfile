# Multi-stage build
FROM maven:3.8.6-openjdk-11-slim AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src
COPY webapp ./webapp

# Build the application
RUN mvn clean package -DskipTests || mvn clean compile war:war -DskipTests

# Production stage
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove default webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy built WAR file
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Expose port
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
