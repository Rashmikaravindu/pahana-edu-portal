# ================================================================
# Multi-stage Dockerfile for Java Web Application on Railway
# ================================================================

# ----------------------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------------------
FROM maven:3.8.6-openjdk-11-slim AS build

# Set the working directory
WORKDIR /app

# Copy pom.xml first to leverage Docker cache
COPY pom.xml .

# Download dependencies (cached layer if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code and webapp
COPY src ./src
COPY webapp ./webapp

# Build the application
RUN mvn clean package -DskipTests -q

# Verify the WAR file was created
RUN ls -la target/ && \
    if [ ! -f target/*.war ]; then \
        echo "ERROR: WAR file not found!"; \
        exit 1; \
    fi

# ----------------------------------------------------------------
# Stage 2: Runtime Stage
# ----------------------------------------------------------------
FROM tomcat:9.0.75-jdk11-openjdk-slim

# Set environment variables
ENV CATALINA_HOME /usr/local/tomcat
ENV PATH $CATALINA_HOME/bin:$PATH
ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom -Xmx512m -Xms256m"
ENV CATALINA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Colombo"

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Create necessary directories
RUN mkdir -p /usr/local/tomcat/logs && \
    mkdir -p /usr/local/tomcat/temp && \
    mkdir -p /usr/local/tomcat/work

# Copy WAR file from build stage
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Set proper permissions
RUN chown -R root:root /usr/local/tomcat && \
    chmod -R 755 /usr/local/tomcat && \
    chmod +x /usr/local/tomcat/bin/*.sh

# Create a non-root user for security
RUN groupadd -r tomcat && useradd -r -g tomcat tomcat
RUN chown -R tomcat:tomcat /usr/local/tomcat
USER tomcat

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start Tomcat
CMD ["catalina.sh", "run"]
