#!/bin/sh

# start clicker in background
echo "starting clicker"
./no-really-lets-click-everywhere.sh &

# start unity hub
echo "starting unity hub"
xvfb-run -e /dev/stdout /opt/unity/UnityHub
