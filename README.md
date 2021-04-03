# Arma III ARES Artillery Calculator
## Use ARES On My Website
There is a live version on https://be3dart.ch/arma-3-artillery-calculator - No trackers and free of charge!

## Introduction
ARES is a web service to calculate the elevation, heading, and fire mode needed to precisely hit a target in Arma III. Currently, it supports the artillery tanks 2S9 Sochor and M4 Scorcher. An addition to support the MAAWS Mk4 Mod 0 is on the way.

## How Does It Work
First off, do a right-click to add your artillery unit. By right-clicking anywhere on the map again, a target for your artillery unit is created. Hold the left mouse button to drag your placed markers around. Right-click on a marker to delete it. Note: Left-click is equivalent to one press on mobile / Right-click is equivalent to long-press on mobile

## Download of Map Data
Unfortunately, the map tiles exceed the GitHub upload limit. I had to host them on my website. You can get them by following these steps:

1. Download the .zip file via http://be3dart.ch/download/map.zip
2. Unzip map.zip and drag-and-drop the map folder into the root project folder

## Altitude API
I have created an API to get the height data of a given coordinate on Altis. It's effortless to use: Transmit a 'x' and 'y' coordinate to the API, and it will return nothing else than the altitude above sea level at this specified point.

### API Example
If you would like to know the altitude at 10'000, 10'000 on Altis, make a call to the API like this:
https://api.be3dart.ch/ARES.php?x=10000&y=10000

## Limitations
* Currently, only Altis is implemented.