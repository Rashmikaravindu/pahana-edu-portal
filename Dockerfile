# Multi-stage build for Java Web Application
FROM maven:3.8.6-openjdk-11-slim AS build

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        wget && \
    rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B -q

# Copy source code
COPY src ./src
COPY webapp ./webapp

# Build the application
RUN mvn clean package -DskipTests -B -q

# Verify WAR file creation
RUN ls -la target/ && \
    if [ ! -f target/*.war ]; then \
        echo "ERROR: WAR file not found!"; \
        exit 1; \
    fi

# Production stage
FROM tomcat:9.0.75-jdk11-openjdk-slim

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat \
    CATALINA_BASE=/usr/local/tomcat \
    JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom -Xmx512m -Xms256m -Djava.awt.headless=true" \
    CATALINA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Colombo" \
    JPDA_ADDRESS="*:8000" \
    JPDA_TRANSPORT=dt_socket

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/* && \
    rm -rf /usr/local/tomcat/server/webapps/* && \
    rm -rf /usr/local/tomcat/conf/Catalina/localhost/*

# Create necessary directories
RUN mkdir -p /usr/local/tomcat/logs \
             /usr/local/tomcat/temp \
             /usr/local/tomcat/work && \
    chmod 755 /usr/local/tomcat/logs \
              /usr/local/tomcat/temp \
              /usr/local/tomcat/work

# Copy WAR file from build stage
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Set proper permissions
RUN chown -R root:root /usr/local/tomcat && \
    chmod -R 755 /usr/local/tomcat && \
    chmod +x /usr/local/tomcat/bin/*.sh

# Create minimal server.xml to avoid NullPointerException
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
               maxThreads="150"
               minSpareThreads="25"
               enableLookups="false"
               acceptCount="100" />

    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost" appBase="webapps"
            unpackWARs="true" autoDeploy="false" deployOnStartup="true">
      </Host>
    </Engine>
  </Service>
</Server>
EOF

# Create context.xml to prevent deployment issues
RUN cat > /usr/local/tomcat/conf/context.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <WatchedResource>WEB-INF/web.xml</WatchedResource>
    <WatchedResource>WEB-INF/tomcat-web.xml</WatchedResource>
    <WatchedResource>${catalina.base}/conf/web.xml</WatchedResource>
</Context>
EOF

# Create startup script
RUN cat > /usr/local/tomcat/bin/start-app.sh << 'EOF'
#!/bin/bash
set -e

echo "========================================"
echo "Starting Pahana Edu Portal"
echo "========================================"
echo "Java Version: $(java -version 2>&1 | head -1)"
echo "Available Memory: $(free -h 2>/dev/null | grep '^Mem:' | awk '{print $2}' || echo 'N/A')"
echo "Tomcat Version: $(cat /usr/local/tomcat/RELEASE-NOTES | head -1 || echo 'Unknown')"
echo "========================================"

# Check WAR file
if [ -f /usr/local/tomcat/webapps/ROOT.war ]; then
    echo "✓ WAR file found: $(ls -lh /usr/local/tomcat/webapps/ROOT.war)"
else
    echo "✗ WAR file not found!"
    exit 1
fi

# Check database connection if URL is provided
if [ -n "$DATABASE_URL" ]; then
    echo "✓ Database URL configured"
else
    echo "⚠ Database URL not configured"
fi

# Start Tomcat with explicit settings
export CATALINA_PID=/usr/local/tomcat/temp/tomcat.pid
exec /usr/local/tomcat/bin/catalina.sh run
EOF

RUN chmod +x /usr/local/tomcat/bin/start-app.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/usr/local/tomcat/bin/start-app.sh"]
