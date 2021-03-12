//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}
//magick convert ContourMap.jpg -resize 9216x9216 CountourMap_2.jpg

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var shootingBoundaries;
var artilleryPosition = [1, 1, 1];
var gravity = 9.80665;
var artilleryMode = 0; //0: Artillery, 1: MAAWS

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return Popup Content
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function popupContent(elevation, direction, firemode, mode) {

    if (mode == "target") {

        if (artilleryMode == 0) {
            var begin = "<ul style='list-style-type: none; margin: 0; padding: 0;'>";
            var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "° (Exp. " + (Math.ceil(elevation[2] / 0.01) * 0.01).toFixed(2) + "°)</li>";
            var messageDirection = "Direction: " + (Math.ceil(direction[0] / 0.01) * 0.01).toFixed(2) + "° (Exp. " + (Math.ceil(direction[1] / 0.01) * 0.01).toFixed(2) + "°)</li>";
            var messageFiremode = "<li style='font-weight: bold; font-style: italic'> Firemode: " + firemode + "</li>";
            var end = "</ul>";
            return begin + messageElevation + messageDirection + messageFiremode + end;
        } else {
            var begin = "<ul style='list-style-type: none; margin: 0; padding: 0;'>";
            var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "°)</li>";
            var messageDirection = "Direction: " + (Math.ceil(direction[0] / 0.01) * 0.01).toFixed(2) + "°)</li>";
            var end = "</ul>";
            return begin + messageElevation + messageDirection + end;
        }

    } else if (mode == "NaN") {
        return "<div style='font-weight: bold;'> Shooting is not possible</div>";
    } else {

        if (artilleryMode == 0) {
            return "2S9 Sochor";
        } else {
            return "MAAWS Mk4 Mod 0";
        }

    }
}