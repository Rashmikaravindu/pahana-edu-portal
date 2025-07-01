# Build stage
FROM maven:3.8.6-openjdk-11-slim AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
RUN ls -la target/

# Runtime stage
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR file
COPY --from=build /app/target/pahana-edu-portal.war /usr/local/tomcat/webapps/ROOT.war

# Set Java options
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV CATALINA_OPTS="-Dfile.encoding=UTF-8"

# Expose port
EXPOSE 8080

# Explicit start command
CMD ["/usr/local/tomcat/bin/catalina.sh", "run"]
