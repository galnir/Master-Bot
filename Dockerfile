FROM node:16.8.0-alpine3.11
RUN apk add --no-cache \
python3 \
make \
g++ \
cairo-dev \
pango-dev \
jpeg-dev \
giflib-dev \
librsvg-dev

WORKDIR "/Master-Bot"
COPY package.json package-lock.json ./
RUN npm ci --production

COPY ./ ./
CMD ["npm", "start"]
