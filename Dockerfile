FROM node:lts-alpine
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
RUN npm i --production

COPY ./ ./
CMD ["npm", "start"]
