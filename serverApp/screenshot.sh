#!/bin/bash
export DISPLAY=:0 && xhost +localhost
scrot /root/serverApp/screenshots/ServiceMonitor-$(date +\%Y\%m\%d_\%H\%M\%S).png
