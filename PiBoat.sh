#!/bin/bash

killall pi-blaster
/home/pi/pi-blaster/pi-blaster

cd /home/pi/PiBoat
/usr/bin/nohup /usr/bin/nodejs app.js &
