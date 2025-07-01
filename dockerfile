# Dockerfile for Maven Standard Structure
FROM maven:3.8.6-openjdk-11-slim AS build

WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code (Maven standard structure)
COPY src ./src

# Build WAR file
RUN mvn clean package -DskipTests

# Verify WAR file exists
RUN ls -la target/

# Runtime stage
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove default webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY --from=build /app/target/pahana-edu-portal.war /usr/local/tomcat/webapps/ROOT.war

# Environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Expose port
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
