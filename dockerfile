# Super simple approach
FROM openjdk:11-jre-slim

# Install Tomcat
RUN apt-get update && \
    apt-get install -y wget && \
    wget https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.75/bin/apache-tomcat-9.0.75.tar.gz && \
    tar -xzf apache-tomcat-9.0.75.tar.gz && \
    mv apache-tomcat-9.0.75 /opt/tomcat && \
    rm apache-tomcat-9.0.75.tar.gz && \
    rm -rf /opt/tomcat/webapps/*

# Copy webapp files directly
COPY webapp/ /opt/tomcat/webapps/ROOT/

# Copy compiled classes
COPY src/ /opt/tomcat/webapps/ROOT/WEB-INF/classes/

# Set environment
ENV CATALINA_HOME=/opt/tomcat
ENV PATH=$PATH:$CATALINA_HOME/bin

# Expose port
EXPOSE 8080

# Start Tomcat
CMD ["/opt/tomcat/bin/catalina.sh", "run"]
