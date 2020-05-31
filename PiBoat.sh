#!/bin/bash

killall pi-blaster
/home/pi/pi-blaster/pi-blaster

cd /home/pi/PiBoat
/usr/local/bin/node app.js > /home/pi/PiBoat/PiBoat.log
