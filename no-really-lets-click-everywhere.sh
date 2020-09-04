#!/bin/sh
#
# xvfb-run default resolution = 1280x1024
#

# Exit for any failure
set -e

# sleep while framebuffer starts
echo "sleep"
sleep 5

# click every pixel until tired
echo "clicking"
x=1;
y=1;
until [ $x -gt 1278 ]; do
  until [ $y -gt 1022 ]; do
    echo "[$x,$y]"
    xdotool mousemove $x $y
    xdotool click 1
    y=$((y+1))
  done
  y=1;
  x=$((x+1))
done
echo "clicking done"
