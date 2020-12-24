FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
git \
curl \
python2 \
build-essential \
libkrb5-dev \
vim \
libcairo2-dev \ 
libpango1.0-dev \ 
libjpeg-dev \ 
libgif-dev \
librsvg2-dev && \
curl -sL https://deb.nodesource.com/setup_14.x | bash -E && apt-get install -y nodejs && \
apt-get clean && \
git clone https://github.com/galnir/Master-Bot.git ./Master-Bot
WORKDIR "./Master-Bot"
