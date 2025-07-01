# ================================================================
# Multi-stage Dockerfile for Java Web Application on Railway
# Optimized for Pahana Edu Portal
# ================================================================

# ----------------------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------------------
FROM maven:3.8.6-openjdk-11-slim AS build

# Set build arguments
ARG BUILD_ENV=production
ARG MAVEN_OPTS="-Xmx1024m -Xms512m"

# Set working directory
WORKDIR /app

# Install necessary packages for build
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        wget && \
    rm -rf /var/lib/apt/lists/*

# Copy Maven configuration first (for better caching)
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B -q

# Copy source code and webapp
COPY src ./src
COPY webapp ./webapp

# Set Maven options for build
ENV MAVEN_OPTS="-Xmx1024m -Xms512m -Djava.awt.headless=true"

# Build the application
RUN mvn clean package -DskipTests -B -q && \
    echo "Build completed successfully" && \
    ls -la target/

# Verify WAR file creation
RUN if [ ! -f target/*.war ]; then \
        echo "ERROR: WAR file not found in target directory!"; \
        ls -la target/; \
        exit 1; \
    else \
        echo "WAR file found:"; \
        ls -la target/*.war; \
    fi

# ----------------------------------------------------------------
# Stage 2: Runtime Stage
# ----------------------------------------------------------------
FROM tomcat:9.0.75-jdk11-openjdk-slim

# Set labels for documentation
LABEL maintainer="Pahana Edu Team"
LABEL version="1.0.0"
LABEL description="Pahana Edu Customer Portal"

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat \
    CATALINA_BASE=/usr/local/tomcat \
    PATH=$CATALINA_HOME/bin:$PATH \
    JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom -Xmx512m -Xms256m" \
    CATALINA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Colombo -Djava.awt.headless=true" \
    DATABASE_TYPE=postgresql \
    APP_ENV=production

# Install required packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        wget \
        dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Remove default Tomcat applications for security
RUN rm -rf /usr/local/tomcat/webapps/* && \
    rm -rf /usr/local/tomcat/server/webapps/* && \
    rm -rf /usr/local/tomcat/conf/Catalina/localhost/*

# Create necessary directories with proper permissions
RUN mkdir -p /usr/local/tomcat/logs \
             /usr/local/tomcat/temp \
             /usr/local/tomcat/work \
             /app/logs && \
    chmod 755 /usr/local/tomcat/logs \
              /usr/local/tomcat/temp \
              /usr/local/tomcat/work \
              /app/logs

# Copy WAR file from build stage
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Verify WAR file copy
RUN ls -la /usr/local/tomcat/webapps/ && \
    if [ ! -f /usr/local/tomcat/webapps/ROOT.war ]; then \
        echo "ERROR: WAR file not copied properly!"; \
        exit 1; \
    fi

# Set proper ownership and permissions
RUN chown -R root:root /usr/local/tomcat && \
    chmod -R 755 /usr/local/tomcat && \
    chmod +x /usr/local/tomcat/bin/*.sh

# Create custom server.xml for better performance
RUN cat > /usr/local/tomcat/conf/server.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"
               maxThreads="200"
               minSpareThreads="10"
               enableLookups="false"
               acceptCount="100"
               compression="on"
               compressionMinSize="2048"
               compressableMimeType="text/html,text/xml,text/css,text/javascript,application/javascript,application/json" />

    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost" appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
      </Host>
    </Engine>
  </Service>
</Server>
EOF

# Configure logging
RUN cat > /usr/local/tomcat/conf/logging.properties << 'EOF'
handlers = 1catalina.org.apache.juli.AsyncFileHandler, java.util.logging.ConsoleHandler

.handlers = 1catalina.org.apache.juli.AsyncFileHandler, java.util.logging.ConsoleHandler

1catalina.org.apache.juli.AsyncFileHandler.level = FINE
1catalina.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
1catalina.org.apache.juli.AsyncFileHandler.prefix = catalina.
1catalina.org.apache.juli.AsyncFileHandler.maxDays = 90
1catalina.org.apache.juli.AsyncFileHandler.encoding = UTF-8

java.util.logging.ConsoleHandler.level = FINE
java.util.logging.ConsoleHandler.formatter = org.apache.juli.OneLineFormatter
java.util.logging.ConsoleHandler.encoding = UTF-8

org.apache.catalina.core.ContainerBase.[Catalina].[localhost].level = INFO
org.apache.catalina.core.ContainerBase.[Catalina].[localhost].handlers = 2localhost.org.apache.juli.AsyncFileHandler

2localhost.org.apache.juli.AsyncFileHandler.level = FINE
2localhost.org.apache.juli.AsyncFileHandler.directory = ${catalina.base}/logs
2localhost.org.apache.juli.AsyncFileHandler.prefix = localhost.
2localhost.org.apache.juli.AsyncFileHandler.maxDays = 90
2localhost.org.apache.juli.AsyncFileHandler.encoding = UTF-8
EOF

# Create startup script
RUN cat > /usr/local/tomcat/bin/startup.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting Pahana Edu Portal..."
echo "Java Version: $(java -version 2>&1 | head -1)"
echo "Available Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Environment: $APP_ENV"
echo "Database Type: $DATABASE_TYPE"

# Check if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Database URL configured: ${DATABASE_URL:0:20}..."
else
    echo "Warning: DATABASE_URL not set"
fi

# Start Tomcat
exec catalina.sh run
EOF

RUN chmod +x /usr/local/tomcat/bin/startup.sh

# Create non-root user for security (optional, commented out for Railway compatibility)
# RUN groupadd -r tomcat && useradd -r -g tomcat tomcat
# RUN chown -R tomcat:tomcat /usr/local/tomcat /app
# USER tomcat

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Add volume for logs (optional)
VOLUME ["/usr/local/tomcat/logs", "/app/logs"]

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/usr/local/tomcat/bin/startup.sh"]
