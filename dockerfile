# Build stage - Maven build කරන්න
FROM maven:3.8.6-openjdk-11-slim AS build

# Working directory set කරන්න
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src
COPY webapp ./webapp

# Build the WAR file
RUN mvn clean package -DskipTests

# Runtime stage - Tomcat server
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file from build stage
COPY --from=build /app/target/pahana-edu-portal.war /usr/local/tomcat/webapps/ROOT.war

# Set environment variables
ENV CATALINA_OPTS="-Xmx512m -Xms256m"

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]