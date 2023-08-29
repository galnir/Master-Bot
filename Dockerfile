FROM node:19-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR "/Master-Bot"

# Install prerequisites and register fonts
RUN apt-get update && apt-get install -y -q openssl && apt-get install -y -q && apt-get install -y -q --no-install-recommends libfontconfig1 && npm install -g pnpm

# Copy files to Container (Excluding whats in .dockerignore)
COPY ./ ./

# Install for Docker-Compose (Excluding "postinstall")
RUN pnpm install --ignore-scripts
RUN pnpm exec turbo db:generate -- schema ./packages/db/prisma/schema.prisma

# Install for Standalone Dockerfile use (comment out the 2 lines above and uncomment the line below)
# RUN pnpm install

# Ports for the Dashboard  
EXPOSE 3000
ENV PORT 3000

# Stop Nextjs Data Collection
ENV NEXT_TELEMETRY_DISABLED 1

# Run Concurrent Start Script
# CMD ["pnpm", "run", "dev-parallel"]