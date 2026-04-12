# Raspberry Pi

In this skill you will bring up a Raspberry Pi (pi) Zero W and
establish that it can connect to a wireless network and host a Node.js
server.

Unless you have a new device, you will find an existing
installation. Your job is to reinstall from scratch with a clean
system.

<p align="center">
<img src="/docs/images/RPi0.jpg" width="30%">
</p>
<p align="center">
<i>RPi Zero</i>
</p>


## Assignment ("headless" without keyboard, mouse, and monitor)
Following the instructions at raspberrypi.com for setting up remote access to the pi,
1. Download the latest Raspberry Pi Imager tool 
2. Use the tool to image your SD card with the Raspberry Pi OS (formerly Rasbian)
3. Use the the tool to setup your WiFi SSID and password, and initial credentials for login (make sure to use the pi/smart credentials
for the course.  
4. Boot the pi (could take a few min). It will connect to your designated router with credentials set by you
5. Find your device IP address on the local subnet (use the router web interface to find the pi address)
6. SSH into your pi
7. Install node.js (see below)
8. Run git on your pi to bring over your node.js apps

## Assignment (with keyboard, mouse, and monitor)
1. Download the latest firmware for the RPi (link below)
2. Format your SD card and install Raspberry Pi OS (formerly Rasbian)
3. Boot the pi and then follow the instructions to configure the pi (note: defining a user with ID that is not `pi` will cause problems
for installing the pi-cam later)
4. You will configure the pi to access to your team's wifi router during boot up
5. Install node.js (see below)

## Installing node.js
(2023-10-17)

From [here](https://gist.github.com/davps/6c6e0ba59d023a9e3963cea4ad0fb516?permalink_comment_id=3842569)

Run the following commands to download and install the recent node version.

```
wget https://unofficial-builds.nodejs.org/download/release/v20.7.0/node-v20.7.0-linux-armv6l.tar.gz
tar -xzf node-v20.7.0-linux-armv6l.tar.gz
cd node-v20.7.0-linux-armv6l
sudo cp -R * /usr/local
```

You should make sure node is in your path. To update: 
```export PATH=$PATH:/usr/local/bin
node -v
npm -v
```

The last two lines verify the installation. 



## Using git on pi to download files to the pi

- Now use git on the pi to pull files from your team repo
- ssh into the pi in a terminal window:
- Pull the basic hello world example

Do once (example -- use your repo not mine):
```
git clone https://github.com/BU-EC444/Little-Thomas
```
Do to refresh with latest code
```
git pull https://github.com/BU-EC444/Little-Thomas
```

- Start node.js with your hello world example, demonstrate access from a different computer on the subnet
- Post evidence that it works for the skill


## Notes on using git to pull node applications
- We recommend that you test node.js code on your laptop before deploying on the pi.
- ***Don't save your build folders on git***. Do an `idf.py fullclean` before you push from your laptop
- Using git on the RPi will greatly simplify deploying code on the RPi
  as you will not need to write and debug on the pi.
  - Write the code on your laptop
  - Push to your git repo
  - Pull from the pi to transfer working files to the pi


## Reference Material
- [OS Installation Guide](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)
- [Commonly Used Linux Commands](/docs/utilities/docs/linux.md)
- [Remote Access](https://www.raspberrypi.com/documentation/computers/remote-access.html)
- [Remote Access with SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/)
- [Downloads for Raspberry Pi OS](https://www.raspberrypi.org/downloads/)
- [Raspberry Pi Zero W](https://www.raspberrypi.org/products/raspberry-pi-zero-w/)
- [Node.js](https://nodejs.org/en/)
- [Adafruit install](https://learn.adafruit.com/raspberry-pi-zero-creation)
- [Headless install from golinuxcloud.com, method 1](https://www.golinuxcloud.com/install-nodejs-and-npm-on-raspberry-pi/)



