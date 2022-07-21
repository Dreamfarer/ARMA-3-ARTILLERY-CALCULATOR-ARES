//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}
//magick convert ContourMap.jpg -resize 9216x9216 CountourMap_2.jpg

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var shootingBoundaries;
var artilleryPosition = [1, 1, 1];
var gravAcceleration = 9.80665; // m/s^2
var artilleryMode = 1; //0: Artillery, 1: MAAWS
var experimentalMode = 0; //Activate tilt-offset (NOT working atm)
var globalColors = ["#5DADA2", "#AD5D68", "FFFFFF", -20] //0: Primary Color, 1: Secondary Color, 2: Shaded Secondary Color (Automatically), 3: Shade amount of (1) to produce (2)
var markerArray = []; // Array which will hold all markers

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Recolor website interface to match above defined colors
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var recolorButtons = document.querySelectorAll('.buttons');
for(var i=0; i<recolorButtons.length; i++){
    recolorButtons[i].style.backgroundColor = globalColors[0];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Shade Secondary Color automatically
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function colorShade(col, amt) {
  col = col.replace(/^#/, '')
  if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]

  let [r, g, b] = col.match(/.{2}/g);
  ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])

  r = Math.max(Math.min(255, r), 0).toString(16)
  g = Math.max(Math.min(255, g), 0).toString(16)
  b = Math.max(Math.min(255, b), 0).toString(16)

  const rr = (r.length < 2 ? '0' : '') + r
  const gg = (g.length < 2 ? '0' : '') + g
  const bb = (b.length < 2 ? '0' : '') + b

  return `#${rr}${gg}${bb}`
}
globalColors[2] = colorShade(globalColors[1], globalColors[3]);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Project map-coordinates to game-coordinates
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function projectCoordinates(point) {
    return [(Math.ceil(point[0] / 5) * 5), (Math.ceil((30720 - point[1]) / 5) * 5)];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate between systems
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function transform(angle, convert) {
    if (convert == true) {
        angle = 360 - angle;
        angle = angle + 90;
        if (angle > 360) {
            angle = angle - 360;
        }
    } else {
        angle = angle - 90;
        if (angle < 0) {
            angle = 360 + angle;
        }
        angle = 360 - angle;
    }
    return angle;
}