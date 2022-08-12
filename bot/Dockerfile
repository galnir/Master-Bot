FROM node:16.16.0-alpine3.16
    WORKDIR "/Master-Bot"

    COPY ./ ./
    RUN npm ci --development
    RUN ["npx", "prisma", "generate", "dev"]  
    # CMD ["npm", "run", "dev"]