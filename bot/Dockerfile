FROM node:16.16.0-alpine3.16
WORKDIR "/Master-Bot"

# Install fonts
RUN apk --no-cache add --virtual fonts msttcorefonts-installer fontconfig && \
	update-ms-fonts && \
	fc-cache -f && \
	apk del fonts && \
	find  /usr/share/fonts/truetype/msttcorefonts/ -type l -exec unlink {} \; \
	&& rm -rf /root /tmp/* /var/cache/apk/* && mkdir /root

COPY ./ ./

RUN npm ci --development
RUN ["npx", "prisma", "generate", "dev"]  
