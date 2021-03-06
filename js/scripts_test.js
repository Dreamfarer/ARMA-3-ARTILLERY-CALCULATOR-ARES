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
//Modify coordinate system of Leaflet
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var factorx = (54613 + 1 / 3);
var factory = (54613 + 1 / 3);
L.CRS.pr = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,

    // Changing the transformation is the key part, everything else is the same.
    transformation: new L.Transformation(1 / factorx, 0, 1 / factory, 0),

    // Scale, zoom and distance are entirely unchanged from CRS.Simple
    scale: function (zoom) {
        return Math.pow(2, zoom);
    },

    zoom: function (scale) {
        return Math.log(scale) / Math.LN2;
    },

    distance: function (latlng1, latlng2) {
        var dx = latlng2.lng - latlng1.lng,
            dy = latlng2.lat - latlng1.lat;

        return Math.sqrt(dx * dx + dy * dy);
    },
    infinite: true
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Map Initialization
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var map = L.map('map', {
    minZoom: 12,
    maxZoom: 17,
    crs: L.CRS.pr,
    maxBoundsViscosity: 1
});

//Set boundaries
var southWest = map.unproject([0.025, 0.488]); //(Leftborder x / )
var northEast = map.unproject([0.53, 0.08]); //(Rightborder x / )
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);

//Add tiles
L.tileLayer('map/{z}/map_{x}_{y}.jpg', {
    attribution: 'Map data from Arma 3 &copy; Bohemia Interactive',
    maxNativeZoom: 15,
    minNativeZoom: 12
}).addTo(map);

//Set view to a default position
map.setView([13995, 14723], 14);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Project map-coordinates to game-coordinates
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function projectCoordinates(point) {
    return [(Math.ceil(point[0] / 5) * 5), (Math.ceil((30720 - point[1]) / 5) * 5)];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Cross product
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cross(A, B) {

    return [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Dot product
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function dot(A, B) {
    return (A[0] * B[0] + A[2] * B[2] + A[1] * B[1]);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Multiply vector with scalar
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function multiply_vector_Scalar(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add vector and vector
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function add_vector_vector(vector1, vector2) {
    return [vector1[0] + vector2[0], vector1[1] + vector2[1], vector1[2] + vector2[2]];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Turn a given vector on the basis of an angle and the desired axis
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function rotate(inputvector, angle, axis) {

    var resultingVector1 = multiply_vector_Scalar(inputvector, (Math.cos(angle)));
    var resultingVector2 = multiply_vector_Scalar(cross(axis, inputvector), Math.sin(angle));
    var resultingVector3 = multiply_vector_Scalar(multiply_vector_Scalar(axis, dot(axis, inputvector)), 1 - Math.cos(angle));
    var result = add_vector_vector(add_vector_vector(resultingVector1, resultingVector2), resultingVector3);

    return result;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return the normalized version of a vector. [Vector with length of 1]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function magnitude(inputvector) {

    return Math.sqrt(Math.pow(inputvector[0], 2) + Math.pow(inputvector[1], 2) + Math.pow(inputvector[2], 2));

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return the normalized version of a vector. [Vector with length of 1]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function normalize(inputvector) {

    var length = Math.sqrt(Math.pow(inputvector[0], 2) + Math.pow(inputvector[1], 2) + Math.pow(inputvector[2], 2));
    return [inputvector[0] / length, inputvector[1] / length, inputvector[2] / length];

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate remaining direction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getDir(vector1, vector2, axis) {

    if (axis == "top") {

        var vec1 = normalize([vector1[0], 0, vector1[2]]);
        var vec2 = normalize([vector2[0], 0, vector2[2]]);

        return Math.acos(dot(vec1, vec2) / (magnitude(vec1) * magnitude(vec2))) / 2;

    } else {

        var vec1 = normalize(vector1);
        var vec2 = normalize(vector2);

        return Math.acos(dot(vec1, vec2) / (magnitude(vec1) * magnitude(vec2))) / 2;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate elevation offset based on sourrounding incline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function elevationOffset(angle, elevation) {

    var inputAngle = angle;
    var angle = angle * (Math.PI / 180);

    //Stich together target vector
    elevation = elevation * (Math.PI / 180);
    var targetVector = [Math.sin(elevation), Math.sin(elevation), 0];
    targetVector = rotate(targetVector, -1 * angle, [0, 1, 0]);
    console.log("Target Vector: " + targetVector);

    //Calculate normalvectors of all 4 planes
    //BEISPIEL: 5 Höhenabfragen = 1, 2, 3, 4, 5
    //2, 3, 2, 1, 2
    var origin = [0, 2, 0];
    var normalVectorPlane1 = cross([-5, 3 - origin[1], 0], [0, 2 - origin[1], 5]); //Normalvector for upper-left corner
    var normalVectorPlane2 = multiply_vector_Scalar(cross([5, 1 - origin[1], 0], [0, 2 - origin[1], 5]), -1); //Normalvector for upper-right corner
    var normalVectorPlane3 = multiply_vector_Scalar(cross([-5, 3 - origin[1], 0], [0, 5 - origin[1], -5]), -1); //Normalvector for bottom-left corner
    var normalVectorPlane4 = cross([5, 1 - origin[1], 0], [0, 5 - origin[1], -5]); //Normalvector for bottom-left corner

    //Add the normalvectors together and produce a normalized normalvector of the center / This is the axis where the turret turns around
    //var normalVectorTank = normalize(add_vector_vector(add_vector_vector(add_vector_vector(normalVectorPlane1, normalVectorPlane2), normalVectorPlane3), normalVectorPlane4));
    var normalVectorTank = [0, 1, 0];

    //Decide if to add or to remove from angle
    var condition = "Plus";

    //Start Vector; This remains the same always
    var startVector = [1, 0, 0];

    //Roted Vector
    var modifiedVector = rotate(startVector, -1 * angle, normalVectorTank);

    //Perpendicular Vector (Use 90° to calculate it)
    var perpendicular = rotate(modifiedVector, -1 * 1.5707, normalVectorTank);

    //Upwards rotated Vector (Bsp. 10° = 0.174), this is the displayed value in the tank!
    var upwards = rotate(modifiedVector, 0.174, perpendicular);

    console.log("Modified Vector: " + modifiedVector);
    console.log("Perpendicular Vector: " + perpendicular);
    console.log("Upward: " + upwards);

    console.log("Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);

    //It works until here!
    //Now up to the difficult part... approximation
    var correctionSideSum = 10;
    var correctionTopSum = 0;

    //1. We go directly to the target above
    //2. With the upper part (The 10° incline) we need to figure out if we need to add angle or take back.
    var correctionTop = getDir(upwards, targetVector, "top");
    console.log("Correction from top: " + correctionTop * 180 / Math.PI);

    //The problem is that it can't tell us if we should move left or right, the best thing would be to check real quick by trying
    modifiedVector = rotate(upwards, correctionTop, normalVectorTank);
    console.log("Corrected modified vector: " + modifiedVector);

    //We need to get directions again, compare, and take action 
    var newCorrectionTop = getDir(modifiedVector, targetVector, "top");
    console.log("NEW Correction from top: " + correctionTop * 180 / Math.PI);

    //We will need to reverse correctionTop in that case
    if (newCorrectionTop > correctionTop) {
        correctionTop = correctionTop * -1;
        condition = "Minus";
    } else {
        condition = "Plus";
    }

    //We can add this to the total amount of angle
    correctionTopSum += (correctionTop * 180 / Math.PI);

    //Carry on with approximation
    modifiedVector = rotate(upwards, correctionTop, normalVectorTank);
    console.log("New Corrected modified vector: " + modifiedVector);

    //Now we need to adjust elevation too
    var correctionSide = getDir(modifiedVector, targetVector, "side");
    console.log("Correction from side: " + (correctionSide * 180 / Math.PI));

    console.log("End Elevation Check: " + getDir([0, 0, 1], modifiedVector, "side") * 2 * 180 / Math.PI);

    //Adjust the elevation
    upwards = rotate(modifiedVector, correctionSide, perpendicular);
    console.log("Upwards: " + upwards);

    console.log("End Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);

    //We can add this to the total amount of elevation
    correctionSideSum += (correctionSide * 180 / Math.PI);

    counter = 0;
    while (counter < 8) {

        console.log("------------------------------------------------");

        correctionTop = getDir(upwards, targetVector, "top");
        //console.log("Correction from top: " + correctionTop * 180 / Math.PI);

        //Adjust with knowledge from before
        if (condition == "Minus") {
            correctionTop = correctionTop * -1;
        }

        modifiedVector = rotate(upwards, correctionTop, normalVectorTank);
        //console.log("Modified vector: " + modifiedVector);

        //We can add this to the total amount of angle
        correctionTopSum += (correctionTop * 180 / Math.PI);

        correctionSide = getDir(modifiedVector, targetVector, "side");
        console.log("Correction from side: " + correctionSide * 180 / Math.PI);

        console.log("End Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);

        upwards = rotate(modifiedVector, correctionSide, perpendicular);
        console.log("Upwards: " + upwards);

        console.log("End Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);

        //We can add this to the total amount of elevation
        correctionSideSum += (correctionSide * 180 / Math.PI);

        counter += 1;

    }

    console.log("End Elevation: " + correctionSideSum);
    console.log("End Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);
    console.log("End Direction: " + (inputAngle + (correctionTopSum * -1)));


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
        this.direction = 0;
        this.gunElevation = [0, 0];
        this.heightDifference = 0;
    }

    //Get the azimut right
    calculateDirection(distanceComponents) {

        //0° to 90°, x: positive, y: positive
        if (distanceComponents[0] >= 0 && distanceComponents[1] >= 0) {
            this.direction = 90 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //90° to 180°, x: positive, y: negative
        if (distanceComponents[0] >= 0 && distanceComponents[1] < 0) {
            this.direction = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //180° to 270°, x: negative, y: negative
        if (distanceComponents[0] < 0 && distanceComponents[1] < 0) {
            this.direction = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //270° to 360°, x: negative, y: positive
        if (distanceComponents[0] < 0 && distanceComponents[1] >= 0) {
            this.direction = 450 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
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
    calculateTrajectoryProjectileMotion(positionArtillery) {

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
        var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "° or " + (Math.ceil(elevation[1] / 0.01) * 0.01).toFixed(2) + "°</li>";
        var messageFiremode = "<li style='font-weight: bold; font-style: italic'> Firemode: " + firemode + "</li>";
        var messageDirection = "Direction: " + (Math.ceil(direction / 0.01) * 0.01).toFixed(2) + "°";
        var end = "</ul>"

        return begin + messageElevation + messageFiremode + messageDirection + end;
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
            markerArray[start][2].calculateTrajectoryProjectileMotion(artilleryPosition);

            //Populate popup content with the new data
            markerArray[start][0].setPopupContent(popupContent(markerArray[start][2].gunElevation, markerArray[start][2].direction, markerArray[start][2].firemode, "target")).openPopup();

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
                    markerArray[counter][2].calculateTrajectoryProjectileMotion(artilleryPosition);

                    //Add the marker for the target
                    addMarker(mapp, type, [markerArray[counter][2].gunElevation[0], markerArray[counter][2].gunElevation[1]], markerArray[counter][2].direction, markerArray[counter][2].firemode, counter);

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
            heightdataCallback(game, mapp, message, mode, markerCounter, start);
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Marker with Elevation and Polyline
////else /////////////////////////////////////////////////////////////////////////////////////////////////////////
function onMapClick(e) {

    //Add a popup where the user can choose between some buttons
    var popup = L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent('<button class="buttonsInMap" id="add" ><i class="fa fa-plus"></i></button>').openOn(map);

    //Convert the map coordinates to game coordinates
    var point = projectCoordinates([e.latlng.lng, e.latlng.lat])

    var addButton = document.getElementById('add');
    addButton.addEventListener('click', function () {

        //Request height data at that point
        requestHeight(point, [e.latlng.lng, e.latlng.lat], "", "create", -1, 1);

    });

}

//Mouse events
map.on('drag', function (e) {

    console.log(markerArray);

    map.panInsideBounds(bounds, {
        animate: false
    });
});
map.on('click', function (e) {

    //console.log(projectCoordinates([e.latlng.lng, e.latlng.lat]))
    elevationOffset(90, 45);

});
map.on('contextmenu', onMapClick);
