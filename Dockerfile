FROM node:16-alpine
WORKDIR "/Master-Bot"

# Install and register fonts (needed for Game Commands)
RUN apk --no-cache add --virtual fonts msttcorefonts-installer fontconfig && \
	update-ms-fonts && \
	fc-cache -f && \
	apk del fonts && \
	find  /usr/share/fonts/truetype/msttcorefonts/ -type l -exec unlink {} \; \
	&& rm -rf /root /tmp/* /var/cache/apk/* && mkdir /root

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