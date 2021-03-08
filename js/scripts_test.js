//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}
//magick convert ContourMap.jpg -resize 9216x9216 CountourMap_2.jpg

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var shootingBoundaries;
var artilleryPosition = [1, 1, 1];
var gravity = 9.80665;

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
//Class for artillery unit and targets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Marking {

    constructor(position) {
        //Must be given as parameters
        this.position = position;

        //Other variables
        this.firemode = "Close";
        this.distance = 0;
        this.velocity = 0;
        this.direction = [0, 0];
        this.gunElevation = [0, 0, 0];
        this.heightDifference = 0;
    }

    //Get the azimut right
    calculateDirection(distanceComponents) {

        //0° to 90°, x: positive, y: positive
        if (distanceComponents[0] >= 0 && distanceComponents[1] >= 0) {
            this.direction[0] = 90 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //90° to 180°, x: positive, y: negative
        if (distanceComponents[0] >= 0 && distanceComponents[1] < 0) {
            this.direction[0] = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //180° to 270°, x: negative, y: negative
        if (distanceComponents[0] < 0 && distanceComponents[1] < 0) {
            this.direction[0] = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //270° to 360°, x: negative, y: positive
        if (distanceComponents[0] < 0 && distanceComponents[1] >= 0) {
            this.direction[0] = 450 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }
    }

    //Select which firemode to use
    calculateFiremode(distanceLocal) {


        if (distanceLocal >= 826 && distanceLocal <= 2237) {
            this.firemode = "Close";
            this.velocity = 153.9; //Initial velocity: 810*0.19 m/s
        }

        if (distanceLocal > 2237 && distanceLocal <= 5646) {
            this.firemode = "Medium";
            this.velocity = 243; //Initial velocity: 810*0.3 m/s
        }

        if (distanceLocal > 5646 && distanceLocal <= 15029) {
            this.firemode = "Far";
            this.velocity = 388.8; //Initial velocity: 810*0.48 m/s
        }

        if (distanceLocal > 15029 && distanceLocal <= 42818) {
            this.firemode = "Further";
            this.velocity = 648; //Initial velocity: 810*0.48 m/s
        }

        if (this.velocity == 0) {
            alert("Too Close - Shooting is not possible");
            return false;
        } else {
            return true;
        }
    }

    //Calculate the Trajectory of the Projectile Motion - THE CORE Function of this app.
    calculateTrajectoryProjectileMotion(positionArtillery, counter) {

        //x and y component of distance
        var x = this.position[0] - positionArtillery[0]; //Positive when target is to the East, negative when target is to the West
        var y = this.position[1] - positionArtillery[1]; //Positive when target is to the North, negative when target is to the South$

        //Calculate azimut
        this.calculateDirection([x, y]);

        //Pythagorean theorem
        this.distance = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));

        //Calculate height difference between artillery unit and target
        this.heightDifference = this.position[2] - positionArtillery[2];

        //Chose which firemode to use for such a distance
        if (this.calculateFiremode(this.distance) == false) {
            return false;
        }

        //Calculate both projectile trajectory parabolas
        this.gunElevation[0] = (Math.atan((Math.pow(this.velocity, 2) - Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        this.gunElevation[1] = (Math.atan((Math.pow(this.velocity, 2) + Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        //To reset the firemode tracker
        this.velocity = 0;

        gatherHeightData(transform(this.direction[0], true), this.gunElevation[0], [artilleryPosition[0], artilleryPosition[1]], counter);

    }
}

//Initialization of markers
var markerArray = [[0, "artillery", new Marking([0, 0, 0])]];
delete markerArray[0];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return Popup Content
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function popupContent(elevation, direction, firemode, mode) {

    if (mode == "target") {

        var begin = "<ul style='list-style-type: none; margin: 0; padding: 0;'>"
        //var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "° or " + (Math.ceil(elevation[1] / 0.01) * 0.01).toFixed(2) + "°</li>";
        var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "° (Exp. " + (Math.ceil(elevation[2] / 0.01) * 0.01).toFixed(2) + "°)</li>";
        var messageDirection = "Direction: " + (Math.ceil(direction[0] / 0.01) * 0.01).toFixed(2) + "° (Exp. " + (Math.ceil(direction[1] / 0.01) * 0.01).toFixed(2) + "°)</li>";
        var messageFiremode = "<li style='font-weight: bold; font-style: italic'> Firemode: " + firemode + "</li>";
        var end = "</ul>"

        return begin + messageElevation + messageDirection + messageFiremode + end;
    } else if (mode == "NaN") {
        return "<div style='font-weight: bold;'> Shooting is not possible</div>";
    } else {
        return "2S9 Sochor";
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Create new marker
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function addMarker(point, type, elevation, direction, firemode, counter) {

    //Decide which icon to use
    if (type == "target") {
        var markerURL = 'img/pin.png';
    } else {
        var markerURL = 'img/pinDrop.png';
    }

    //Create icon for marker
    var markerIcon = L.icon({
        iconUrl: markerURL,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60],
    });

    //Create Marker
    markerArray[counter][0] = L.marker([point[1], point[0]], {
        icon: markerIcon,
        draggable: 'true'
    }).addTo(map);

    //If marker has been draged, request new data for it
    markerArray[counter][0].on('dragend', function (e) {
        var tempPos = this.getLatLng();
        var point = projectCoordinates([tempPos.lng, tempPos.lat]);
        requestHeight(point, [tempPos.lng, tempPos.lat], "", "update", counter, 0);
    });

    //If marker was right-clicked
    if (type == "target") {
        markerArray[counter][0].on('contextmenu', function (e) {
            map.removeLayer(markerArray[counter][0]);
            delete markerArray[counter];
        });
    } else {

        markerArray[counter][0].on('contextmenu', function (e) {
            map.removeLayer(shootingBoundaries);
            map.removeLayer(markerArray[counter][0]);
            delete markerArray[counter];
        });
    }

    //Populate marker popup
    markerArray[counter][0].bindPopup(popupContent(elevation, direction, firemode, type), {
        closeOnClick: false,
        autoClose: false
    }).openPopup();

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Height Data Callback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function heightdataCallback(game, mapp, message, mode, markerCounter, start) {

    if (mode == "update") {

        var goal = markerArray.length;

        //Go this path to update artillery when dragged
        if (markerCounter == 0) {

            //Set poition for artillery unit
            artilleryPosition = [game[0], game[1], (message + 1.7)];

            //Populate popup content with the new data
            markerArray[markerCounter][0].setPopupContent(popupContent(-1, -1, -1, "artillery")).openPopup();

            //Draw boundary circle
            map.removeLayer(shootingBoundaries);
            shootingBoundaries = L.circle([mapp[1], mapp[0]], {
                radius: 826
            }).addTo(map);

            if (markerArray[1] != null) {
                requestHeight([markerArray[1][2].position[0], markerArray[1][2].position[1]], mapp, "", "update", -9, 1);
            }

            return;

            //Go this path to update target when independetly dragged
        } else {

            if (markerCounter != -9) {

                start = markerCounter;
                goal = markerCounter;
            }

        }

        if (markerArray[start] != null && start <= goal) {

            //Update it's positions
            if (markerCounter != -9) {
                markerArray[start][2].position = [game[0], game[1], (message + 1.7)];
            }

            //Calculate other variables
            markerArray[start][2].calculateTrajectoryProjectileMotion(artilleryPosition, start);

            //Enter recursion loop if artillery unit has been dragged and all target need updates
            if (markerArray[start + 1] != null && markerCounter == -9) {
                requestHeight([markerArray[start + 1][2].position[0], markerArray[start + 1][2].position[1]], mapp, "", "update", -9, start + 1);
            }
        }

    } else {

        //Count the marker from start to end; finish when a null-entry is found
        var counter = 0;
        while (true) {
            if (markerArray[counter] == null) {

                if (markerArray[0] == null) {

                    //Define marker type
                    var type = "artillery";

                    //Initialize new array parameters
                    markerArray[counter] = [0, type, new Marking([game[0], game[1], message])];

                    //Set poition for artillery unit
                    artilleryPosition = [game[0], game[1], (message + 1.7)];

                    //Add the marker for the artillery unit
                    addMarker(mapp, type, [0, 0], 0, "None", counter);

                    //Adding circle to show minimal shooting distance
                    shootingBoundaries = L.circle([mapp[1], mapp[0]], {
                        radius: 826
                    }).addTo(map);

                } else {

                    //Define marker type
                    var type = "target";

                    //Initialize new array parameters
                    markerArray[counter] = [0, type, new Marking([game[0], game[1], message])];

                    //Calculate all associate data
                    markerArray[counter][2].calculateTrajectoryProjectileMotion(artilleryPosition, counter);

                    //Add the marker for the target
                    addMarker(mapp, type, markerArray[counter][2].gunElevation, markerArray[counter][2].direction, markerArray[counter][2].firemode, counter);

                }
                break;
            } else {
                counter += 1;
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Send PHP request to retrieve height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requestHeight(game, mapp, message, mode, markerCounter, start) {

    //Create new HTTP Request
    var createCORSRequest = function (method, url) {
        var xhr = new XMLHttpRequest();

        //Error Handling
        if ("withCredentials" in xhr) {
            xhr.open(method, url, true);

        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);

        } else {
            xhr = null;
            alert("This browser can't be used sadly.")
        }

        return xhr;
    };

    //Variables to pass to server
    var url = 'https://api.be3dart.ch/ARES.php?x=' + game[0] + '&y=' + game[1];
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            //Finished
            message = parseFloat(xhr.responseText)

            if (mode == "offset") {
                gatherHeightDataCallback(message, markerCounter);
            } else {
                heightdataCallback(game, mapp, message, mode, markerCounter, start);

            }

            return; // this will alert "true";

        }
    }

    xhr.onload = function () {
        //
    };

    xhr.onerror = function () {
        alert("Error encountered while requesting height data! Please report :)");
    };

    xhr.send();
}
