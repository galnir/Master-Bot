FROM debian:10

RUN apt-get update && apt-get install -y \
git \
curl \
python2 \
build-essential \
libkrb5-dev \
libcairo2-dev \ 
libpango1.0-dev \ 
libjpeg-dev \ 
libgif-dev \
librsvg2-dev && \
curl -sL https://deb.nodesource.com/setup_14.x | bash -E && apt-get install -y nodejs && \
apt-get clean && \
npm install -g pm2 && \
mkdir Master-Bot
WORKDIR /Master-Bot
COPY . .
RUN npm clean-install
CMD ["pm2-runtime", "index.js"]
