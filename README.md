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
The following documentation is split in two sections. The first section deals with the flight path of artillery shells shot by self-propelled artillery like the 2S9 Sochor and M4 Scorcher. Fortunately, in Arma 3, artillery shells are the only projectiles [not](https://community.bistudio.com/wiki/CfgAmmo_Config_Reference#airFriction) affected by external force such as wind or air friction.\
In the much more difficult second section, we will go over the projectile motion of the MAAWS Mk4 Mod 0 rocket, which, in contrast to artillery shells, is affected by air resistance, making the calculations much more exhausting.

**Self-Propelled Artillery**\
Will be added on a later date. I know you want the juicy MAAWS rocket science. 🤣 

**MAAWS Mk4 Mod 0 (Redneck Artillery)**\
The [Arma 3 wiki](https://community.bistudio.com/wiki/Arma_3:_Damage_Description#Bullet/Shell) states that the only properties that influence trajectory are _initSpeed (CfgMagazines)_, _airFriction (CfgAmmo)_ and _coefGravity (CfgAmmo)_. Such projectiles travel based on their muzzle velocity _(initSpeed)_ and aerodynamic drag _(airFriction)_, along with gravity-induced vertical drop.

Fortunately, there is another post on the [Arma 3 wiki](https://community.bistudio.com/wiki/Weapons_settings) giving us an insight into the formula used to calculate projectile motion with air resistance. However, it is badly written and formatted to the point of almost no recognition. After further inspection and some guesswork, I decoded the formula to be:

$a= v* \sqrt{v_x^2+v_y^2} * Friction$

While reading through the [Projectile Motion on Wikipedia](https://en.wikipedia.org/wiki/Projectile_motion#Numerical_solution), I have found a somewhat matching formula. However, the variable names are different, and a differential equation is now being introduced because we want to compute the current state instead of the rate of change.

$v = \frac{d}{dt} x$ &emsp; _(velocity is the first derivative of displacement)_ \
$a = \frac{d}{dt} v$ &emsp; _(acceleration is the first derivative of velocity)_ \
$\mu = - Friction$

Armed with this knowledge, we rearrange the above equation and split it into $x$ and $y$ components.

$\frac{d}{dt} x = v_x$ \
$\frac{d}{dt} y = v_y$ \
$\frac{d}{dt} v_x = - \mu * v_x * \sqrt{v_x^2 + v_y^2}$ \
$\frac{d}{dt} v_y = - g - \mu * v_y * \sqrt{v_x^2 + v_y^2}$

To actually get the current state instead of the rate of change, we need to solve the ordinary differential equations depicted by $\frac{d}{dt}$. But how? \
The Wikipedia article further states that the equations of motion can not be easily solved analytically. Through the sheer amount of research I had done, I came across a [YouTube](https://www.youtube.com/watch?v=BPuDteHrI18) video using the [Euler method](https://en.wikipedia.org/wiki/Euler_method) to approximate the projectile path.

Now, I have never been a good student in mathematics, so the explanation might be a bit lacking. What we do with the [Euler method](https://en.wikipedia.org/wiki/Euler_method) is essentially approximating the analytical solution by computing the same equation over and over again while taking the before calculated result into account. The smaller the step size (in our case, time) $h$, the more accurate the approximation will be. The only thing stopping you from reaching infinite precision is the infite computing time needed. You absolutely need to find a balance between the two.

Enough talking, here are the above equations while using the [Euler method](https://en.wikipedia.org/wiki/Euler_method). Notice that the equation did not change, except I have added the step size multiplication ( $h$ ) and the _before_ state of each variable ( e.g. $x_{before}$ ) on the right side of the equation.

$x = v_{x} * h + x_{before}$ \
$y = v_{y} * h + y_{before}$ \
$v_{x}= (v_{x-before} * \sqrt{v_{x-before} ^ 2 + v_{y-before} ^ 2} * - \mu) * h  + v_{x-before}$ \
$v_{y}= (v_{y-before} * \sqrt{v_{x-before} ^ 2 + v_{y-before} ^ 2} * - \mu - g) * h  + v_{y-before}$

You would now loop over these equations, each time pushing the new variable (e.g. $v_{x}$ ) into the _before_ variable (e.g. $v_{x-before}$ ) until a certain criteria is met. In our case, it is when the desired distance ( $x$ ) at a given height ( $y$ ) has been reached. Note that the elevation change can be done by shifting the height ( $y$ ) target up or down.

We next need to find a way to incorporate the shooting angle into the equation. As luck would have it, we forgot to define a _before_ state of these variables: $x$, $y$, $v_{x}$ and $v_{y}$. How else would the [Euler method](https://en.wikipedia.org/wiki/Euler_method) be able to start when there is no _before_ value?

Because each component is being calculated separately, we only need to split the rocket's absolute velocity into its x and y components once at the start of the calculation. The [Euler method](https://en.wikipedia.org/wiki/Euler_method) will take care of the rest. We will take 5° gun elevation as an example.

$\mu = 0.000132$ &emsp; _(friction for MAAWS Mk4 Mod 0 found through testing)_ \
$x = 0$ &emsp; (starting at 0m displacement) \
$y = 1.53$ &emsp; (starting at 1.53m because the MAAWS is held at that height) \
$v_{x} = 350 * \cos(5 * \frac{\pi}{180})$ &emsp; (starting with 5° gun elevation $v_{init} = 350 \frac{m}{s}$) \
$v_{y} = 350 * \sin(5 * \frac{\pi}{180})$ &emsp; (starting with 5° gun elevation and $v_{init} = 350 \frac{m}{s}$)

You now might ask; how do we actually find the angle required to fire a MAAWS rocket, let's say, precisely 2000m. The painfully simple answer is: guessing and testing. What my application will do is calculate a specific gun elevation and adjust its error through eliminating the worse chosen angle. Let us walk you through an example:

In this case, the script starts at gun elevation 5° and 10° and will calculate where the rockets impacts. For this angle, it will calculate around 1827m (for 5°) and 3142m (for 10°). 1827m is 173m away from our goal, 2000 m, which translates to 5° being roughly 0.65° away from our unknown goal angle.

My program would then replace 10° with 5.65° and would try again. This time it results in 1827m (for 5°) and 2018m (for 5.65°). 2018m is still 18m away from our goal, 2000m, which now translates to 5.65° being roughly 0.06° away from our unknown goal angle.

My program would then replace 5° with 5.588° and would try again. This time it results in 1999m (for 5.58°) and 2018m (for 5.65°).

As you can see, we are arriving at our unknown goal angle pretty fast. The only thing you would need to specify further is when the precision is enough to stop the recursive execution of this code and print the found angle onto the map.

You can use my [Excel file](https://github.com/BE3dARt/ARMA-3-ARTILLERY-CALCULATOR-ARES/blob/master/auxiliary/Projectile%20Motion%20with%20Air%20Resistance.xlsx) to play around with the now newly acquired knowledge. You can safely ignore Stokes Drag.