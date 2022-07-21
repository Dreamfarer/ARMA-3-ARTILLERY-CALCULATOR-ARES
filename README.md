### About ARES
ARES is a web service to calculate the elevation, heading, and fire mode needed to precisely hit desired targets in Bohemia Interactive's **Arma 3**. When loading the web app, you get to choose between the classic artillery computer for the **2S9 Sochor** and **M4 Scorcher**, or, you are finally able to opt for the _**redneck artillery**_ version designed for the **MAAWS Mk4 Mod 0** – _Be the real King of the Hill!_

### Get ARES
It is as simple as cloning this repository and double-clicking the `.html` file. However, there is yet a more convenient way: Head straight to the live version of this artillery calculator found [HERE](https://be3dart.ch/arma-3-artillery-calculator) - Free of charge and no nasty trackers nor advertisements!

### Controls
When first loading up the web app, you are prompted to choose between the calculator for the 2S9 Sochor and M4 Scorcher or the redneck artillery version for the MAAWS Mk4 Mod 0.\
First off, perform a right-click to add your artillery unit to the map. By right-clicking anywhere on the map again, a target for your artillery unit is created. Artillery units and targets can be distinguished by color or text inside the respective popup. Simply right-click on a marker to delete it. _(Note: Left-click is equivalent to one press on mobile / Right-click is equivalent to long-press on mobile)_\
Hold the left mouse button to drag the before placed markers around.

### What Extra Features Does ARES Have to Offer?
ARES has more to offer than what you notice at a first glance.

**Altitude API**\
I have created an [API](https://api.be3dart.ch/ARES.php?x=10000&y=10000) to get the height data of a given coordinate on Altis. It's effortless to use: Transmit a 'x' and 'y' coordinate to the [API](https://api.be3dart.ch/ARES.php?x=10000&y=10000), and it will return nothing else than the altitude above sea level at this specified point.\
Let's go for an example: If you would like to know the altitude at 10'000, 10'000 on Altis, make a call to the API like this: https://api.be3dart.ch/ARES.php?x=10000&y=10000

**Download Map Data**\
Unfortunately, the map tiles exceed the GitHub upload limit. You can get them [HERE](https://be3dart.ch/download/map.zip). Unzip `map.zip` and drag-and-drop the map folder into the root project folder

### The Magic Behind It
This section will added as soon as the web app is polished enough. Check again later for spicy information on _projectile motion and trajectories_ **with** and without drag.

### Limitations
* Currently, only Altis is implemented.