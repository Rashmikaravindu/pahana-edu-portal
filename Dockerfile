# Build stage
FROM maven:3.8.6-openjdk-11-slim AS build

WORKDIR /app

# Install build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy pom.xml for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy source code
COPY src ./src
COPY webapp ./webapp

# Build the application
RUN mvn clean package -DskipTests -B -q

# Verify WAR file
RUN ls -la target/ && \
    if [ ! -f target/*.war ]; then \
        echo "ERROR: WAR file not found!"; \
        exit 1; \
    fi

# Runtime stage
FROM tomcat:9.0.75-jdk11-openjdk-slim

# Set environment variables
ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom -Xmx512m -Xms256m -Djava.awt.headless=true" \
    CATALINA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Colombo"

# Install runtime tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Create necessary directories
RUN mkdir -p /usr/local/tomcat/logs \
             /usr/local/tomcat/temp \
             /usr/local/tomcat/work

# Copy WAR file from build stage
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Set proper permissions
RUN chown -R root:root /usr/local/tomcat && \
    chmod -R 755 /usr/local/tomcat && \
    chmod +x /usr/local/tomcat/bin/*.sh

# Create simple startup script
RUN echo '#!/bin/bash' > /usr/local/tomcat/bin/start-app.sh && \
    echo 'set -e' >> /usr/local/tomcat/bin/start-app.sh && \
    echo 'echo "Starting Pahana Edu Portal..."' >> /usr/local/tomcat/bin/start-app.sh && \
    echo 'echo "Java Version: $(java -version 2>&1 | head -1)"' >> /usr/local/tomcat/bin/start-app.sh && \
    echo 'echo "WAR file: $(ls -lh /usr/local/tomcat/webapps/ROOT.war 2>/dev/null || echo "Not found")"' >> /usr/local/tomcat/bin/start-app.sh && \
    echo 'if [ -n "$DATABASE_URL" ]; then echo "Database configured"; else echo "Database not configured"; fi' >> /usr/local/tomcat/bin/start-app.sh && \
    echo 'exec /usr/local/tomcat/bin/catalina.sh run' >> /usr/local/tomcat/bin/start-app.sh && \
    chmod +x /usr/local/tomcat/bin/start-app.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/usr/local/tomcat/bin/start-app.sh"]
