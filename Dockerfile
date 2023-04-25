FROM node:18-slim
WORKDIR "/Master-Bot"

# Install prerequisites and register fonts
RUN apt-get update && apt-get install -y -q openssl && apt-get install -y -q && apt-get install -y -q --no-install-recommends libfontconfig1

# Copy files to Container (Excluding whats in .dockerignore)
COPY ./ ./

# Install for Docker-Compose (Excluding "postinstall")
RUN npm ci --development --ignore-scripts
RUN ["npx", "prisma", "generate", "dev"]

# Install for Standalone Dockerfile use (comment out the 2 lines above and uncomment the line below)
# RUN npm ci --development 

# Ports for the Dashboard  
EXPOSE 3000
ENV PORT 3000

# Stop Nextjs Data Collection
ENV NEXT_TELEMETRY_DISABLED 1

# Run Concurrent Start Script
CMD ["npm", "run", "dev"]