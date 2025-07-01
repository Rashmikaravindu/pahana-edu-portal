# Simple but reliable Dockerfile for Java Web Apps
FROM maven:3.8.6-openjdk-11-slim AS build

WORKDIR /app

# Copy everything
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove default webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy built WAR file
COPY --from=build /app/target/pahana-edu-portal.war /usr/local/tomcat/webapps/ROOT.war

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Expose port
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
