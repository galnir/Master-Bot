FROM node:19-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR "/Master-Bot"

# Ports for the Dashboard  
EXPOSE 3000
ENV PORT 3000

# Install prerequisites and register fonts
RUN apt-get update && apt-get install -y -q openssl && \
    apt-get install -y -q && \
    apt-get install -y -q --no-install-recommends libfontconfig1 && \ 
    npm install -g pnpm

# Copy files to Container (Excluding whats in .dockerignore)
COPY ./ ./

# Docker-Compose Container Cluster Build
RUN pnpm install --ignore-scripts

# If you are running Master-Bot in a Standalone Container and need to connect to a service on localhost uncomment the following ENV for each service running on the containers host
# ENV POSTGRES_HOST="host.docker.internal"
# ENV REDIS_HOST="host.docker.internal"
# ENV LAVA_HOST="host.docker.internal"

# Uncomment the following for Standalone Master-Bot Docker Container Build
# RUN pnpm db:push

CMD ["pnpm", "run", "dev-parallel"]