### Raspberry OS 10
let's start by checking for updates and install them
```
cd ~
sudo apt-get update
sudo apt-get updgrade
```

### Checking and Installing needed Dependencies 

### Compiler
Quick.db and Canvas both need a Compiler in order to install on a PI
```
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
```
to install a compliler and the image support for Canvas

### Python
```
cd ~
python --version
```
should already be python 2.7.16 if it is not `sudo apt-get install python2.7`

### Node
```
cd ~
node -v
```
Most likely v10.x read more to update this

### Npm
```
cd ~
npm -v
``` 
Most likely v6.x
### Git
```
cd ~
git --version
```
should output 2.20.1

### Installing FFmpeg
```
cd ~
sudo apt-get install ffmpeg
```

### Installing NodeJS Version 14
if you already have NodeJS v12.x or higher these steps can be skipped 

find the correct architecture, you can type `uname -m` in console and follow the steps


### Steps to install NodeJS v14.x on Raspberry Pi 3 and 4 (armv7l) On Raspberry OS 10(a Debian 10 Linux variant)
the newer armv7 Pi's are easier to install NodeJS, most users you just need the following 
```
cd ~
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt install nodejs
```

let's check the version with
```
node -v
```
this should output 14.15.0 if done correctly 

For the versions of NodeJS. If you need a different version, just change `https://deb.nodesource.com/setup_14.x` to what ever version is needed example `https://deb.nodesource.com/setup_15.x` in the `curl` command

### Steps to install NodeJS v14.10.0 on Raspberry Pi Zero/Zero W/1/2 (armv6l) on Raspberry OS 10(a Debian 10 Linux variant)

There currently isn't a 'how to' on installing NodeJS above v10 when officially they dropped support and don't have arm6l files available,
However, they do have links for 'Unofficial' Builds on their site that still have armv6l support
https://unofficial-builds.nodejs.org/download/release/
I use 14.10.0 because of a bug in the latest v14.15.0 build

```
cd ~
wget https://unofficial-builds.nodejs.org/download/release/v14.10.0/node-v14.15.0-linux-armv6l.tar.gz
tar -xzf node-v14.10.0-linux-armv6l.tar.gz
node-v14.10.0-linux-armv6l/bin/node -v
```
The last command should print v14.10.0.

Now you can copy it to `/usr/local`

```
cd node-v14.12.0-linux-armv6l/
sudo cp -R * /usr/local/
```
Now let's check if it was successful
```
cd ~
node -v
```
This should print 14.10.0 if done correctly 

For the versions of NodeJS. If you need a different version, just pick the one you like from the downloads.

https://unofficial-builds.nodejs.org/download/release/


### Cloning Master-Bot repo to a Bot folder

```
cd ~
sudo mkdir Bot
cd Bot
git clone  https://github.com/galnir/Master-Bot.git
```

### Finally
you can now follow the [README.md](https://github.com/galnir/Master-Bot#installing-the-dependencies) and run the bot on a PI!!!! .......simple right? <3
