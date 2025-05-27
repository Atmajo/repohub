# Use a base image
FROM ubuntu:latest

# Install required packages
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    nginx \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set up first server (Nginx on port 80)
RUN echo "server { \
    listen 80; \
    location / { \
    return 200 'Hello from Server 1 on port 80'; \
    } \
    }" > /etc/nginx/sites-available/default

# Copy git-server and server folders
COPY git-server /app/git-server
COPY server /app/server

# Set up working directory
WORKDIR /app

# Create startup script
RUN echo '#!/bin/bash\n\
    service nginx start\n\
    cd /app/git-server && npm run build && npm run start &\n\
    cd /app/server && npm run build && npm run start &\n\
    tail -f /dev/null' > /app/start.sh && \
    chmod +x /app/start.sh

# Make any scripts in the folders executable
RUN find /app -name "*.sh" -exec chmod +x {} \;

# Expose ports (modify as needed based on what ports your services use)
EXPOSE 80 3000 7005

# Start all servers
CMD ["/app/start.sh"]
