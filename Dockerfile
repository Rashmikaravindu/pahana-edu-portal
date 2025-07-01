# Multi-stage Dockerfile optimized for Railway deployment
FROM maven:3.8.6-openjdk-11-slim AS build

# Set working directory
WORKDIR /app

# Set build environment variables
ENV MAVEN_OPTS="-Xmx1024m -Xms512m -Djava.awt.headless=true"

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B -q

# Copy source code
COPY src ./src
COPY webapp ./webapp

# Build the application
RUN mvn clean package -DskipTests -B -q

# Verify build output
RUN echo "Build completed. Checking target directory:" && \
    ls -la target/ && \
    if [ ! -f target/*.war ]; then \
        echo "ERROR: WAR file not found!"; \
        exit 1; \
    fi

# Production stage with optimized Tomcat
FROM tomcat:9.0.75-jdk11-openjdk-slim

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat \
    CATALINA_BASE=/usr/local/tomcat \
    CATALINA_TMPDIR=/usr/local/tomcat/temp \
    JAVA_OPTS="-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom -Xmx512m -Xms256m" \
    CATALINA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Colombo -Djava.net.preferIPv4Stack=true"

# Install curl for health checks and create necessary directories
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /usr/local/tomcat/logs \
             /usr/local/tomcat/temp \
             /usr/local/tomcat/work \
             /usr/local/tomcat/webapps

# Remove default Tomcat applications and sample files
RUN rm -rf /usr/local/tomcat/webapps/* && \
    rm -rf /usr/local/tomcat/server/webapps/* && \
    rm -rf /usr/local/tomcat/conf/Catalina/localhost/* && \
    rm -f /usr/local/tomcat/RELEASE-NOTES && \
    rm -f /usr/local/tomcat/RUNNING.txt && \
    rm -f /usr/local/tomcat/README.md && \
    rm -f /usr/local/tomcat/LICENSE && \
    rm -f /usr/local/tomcat/NOTICE

# Copy WAR file from build stage
COPY --from=build /app/target/pahana-edu-portal.war /usr/local/tomcat/webapps/ROOT.war

# Create optimized server.xml
RUN cat > /usr/local/tomcat/conf/server.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource n="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service n="Catalina">
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"
               maxThreads="150"
               minSpareThreads="10"
               enableLookups="false"
               acceptCount="100"
               maxConnections="8192"
               compression="on"
               compressionMinSize="2048"
               compressableMimeType="text/html,text/xml,text/css,text/javascript,application/javascript,application/json"
               URIEncoding="UTF-8" />

    <Engine n="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host n="localhost" appBase="webapps"
            unpackWARs="true" autoDeploy="false"
            deployOnStartup="true">

        <Context path="" docBase="ROOT" reloadable="false">
          <Manager pathname="" />
        </Context>

        <Valve className="org.apache.catalina.valves.AccessLogValve" 
               directory="logs"
               prefix="localhost_access_log" 
               suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b %D" />
      </Host>
    </Engine>
  </Service>
</Server>
EOF

# Configure context.xml for better performance
RUN cat > /usr/local/tomcat/conf/context.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <WatchedResource>WEB-INF/web.xml</WatchedResource>
    <WatchedResource>WEB-INF/tomcat-web.xml</WatchedResource>
    <WatchedResource>${catalina.base}/conf/web.xml</WatchedResource>
    
    <Manager pathname="" />
    
    <JarScanner>
        <JarScanFilter defaultTldScan="false" />
    </JarScanner>
</Context>
EOF

# Configure logging.properties
RUN cat > /usr/local/tomcat/conf/logging.properties << 'EOF'
handlers = java.util.logging.ConsoleHandler

.handlers = java.util.logging.ConsoleHandler

java.util.logging.ConsoleHandler.level = INFO
java.util.logging.ConsoleHandler.formatter = org.apache.juli.OneLineFormatter
java.util.logging.ConsoleHandler.encoding = UTF-8

org.apache.catalina.core.ContainerBase.[Catalina].[localhost].level = INFO
org.apache.catalina.core.ContainerBase.[Catalina].[localhost].handlers = java.util.logging.ConsoleHandler

# Set specific loggers to reduce noise
org.apache.catalina.startup.HostConfig.level = WARNING
org.apache.catalina.startup.TldConfig.level = WARNING
org.apache.jasper.servlet.TldScanner.level = WARNING
EOF

# Set proper permissions
RUN chmod -R 755 /usr/local/tomcat && \
    chmod +x /usr/local/tomcat/bin/*.sh

# Create startup script
RUN cat > /usr/local/tomcat/bin/start.sh << 'EOF' && chmod +x /usr/local/tomcat/bin/start.sh
#!/bin/bash
set -e

echo "=== Pahana Edu Portal Starting ==="
echo "Java Version: $(java -version 2>&1 | head -1)"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}' 2>/dev/null || echo 'N/A')"
echo "Tomcat Version: $(cat /usr/local/tomcat/RELEASE-NOTES 2>/dev/null | head -1 || echo 'Tomcat 9.0')"

# Verify WAR file
if [ -f "/usr/local/tomcat/webapps/ROOT.war" ]; then
    echo "WAR file found: $(ls -lh /usr/local/tomcat/webapps/ROOT.war)"
else
    echo "ERROR: WAR file not found!"
    exit 1
fi

# Check environment variables
echo "Environment Variables:"
echo "  PORT: ${PORT:-8080}"
echo "  DATABASE_URL: ${DATABASE_URL:+[SET]} ${DATABASE_URL:-[NOT SET]}"
echo "  JAVA_OPTS: $JAVA_OPTS"

# Start Tomcat
echo "Starting Tomcat..."
exec /usr/local/tomcat/bin/catalina.sh run
EOF

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the application
CMD ["/usr/local/tomcat/bin/start.sh"]
