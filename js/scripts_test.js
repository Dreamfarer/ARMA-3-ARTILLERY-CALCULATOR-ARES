//USE bedartch_ARES
//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}
//magick convert ContourMap.jpg -resize 9216x9216 CountourMap_2.jpg


//Mission impossible
var factorx = (54613 + 1/3);
var factory = (54613 + 1/3);

L.CRS.pr = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(1/factorx, 0, 1/factory, 0),
    // Changing the transformation is the key part, everything else is the same.
    // By specifying a factor, you specify what distance in meters one pixel occupies (as it still is CRS.Simple in all other regards).
    // In this case, I have a tile layer with 256px pieces, so Leaflet thinks it's only 256 meters wide.
    // I know the map is supposed to be 2048x2048 meters, so I specify a factor of 0.125 to multiply in both directions.
    // In the actual project, I compute all that from the gdal2tiles tilemapresources.xml, 
    // which gives the necessary information about tilesizes, total bounds and units-per-pixel at different levels.


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


var shootingBoundaries;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Map Initialization
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var map = L.map('map', {
    minZoom: 12,
    maxZoom: 17,
    crs: L.CRS.pr,
    maxBoundsViscosity: 1
});

var southWest = map.unproject([0.025, 0.488]); //(Leftborder x / )
var northEast = map.unproject([0.53, 0.08]); //(Rightborder x / )
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);

L.tileLayer('map/{z}/map_{x}_{y}.jpg', {
    attribution: 'Map data from Arma 3 &copy; Bohemia Interactive',
    maxNativeZoom: 15,
    minNativeZoom: 12
}).addTo(map);

//Set view to a default position
map.setView([13995, 14723], 14);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Project Map coordinates to game coordinates
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function projectCoordinates(point) {

    var x = point[0];
    var y = 30720 - point[1];

    x = Math.ceil(x / 5) * 5;
    y = Math.ceil(y / 5) * 5;

    return [x, y];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Setup for artillery
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var artilleryPosition = [1, 1, 1];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Class for artillery unit and targets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Marking {

    constructor(position) {
        //Must be given as parameters
        this.position = position;

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
            this.velocity = 153.9; //0.19
        }

        if (distanceLocal > 2237 && distanceLocal <= 5646) {
            this.firemode = "Medium";
            this.velocity = 243; //0.3
        }

        if (distanceLocal > 5646 && distanceLocal <= 15029) {
            this.firemode = "Far";
            this.velocity = 388.8; //0.48
        }

        if (distanceLocal > 15029 && distanceLocal <= 42818) {
            this.firemode = "Further";
            this.velocity = 648; //0.48
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

        var gravity = 9.80665;

        //Calculate both projectile trajectory parabolas
        this.gunElevation[0] = (Math.atan((Math.pow(this.velocity, 2) - Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        this.gunElevation[1] = (Math.atan((Math.pow(this.velocity, 2) + Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        //To reset the boundary tracker
        this.velocity = 0;

    }
}
var target = [new Marking([15000, 15000, 50])];

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
//Create new Marker
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var markerArray = [0];

function addMarker(point, type, elevation, direction, firemode) {

    //Decide which icon to use
    if (type == "target") {

        var markerIcon = L.icon({
            iconUrl: 'img/pin.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -60],
        });

    } else {

        var markerIcon = L.icon({
            iconUrl: 'img/pinDrop.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -60],
        });

    }

    //Count through all markers to get index for new marker
    var counter = 0;
    while (markerArray[counter] != null && markerArray[counter] != 0) {
        counter += 1;
    }

    //Create Marker
    markerArray[counter] = L.marker([point[1], point[0]], {
        icon: markerIcon,
        draggable: 'true'
    }).addTo(map);

    //If marker has been draged, request new data for it
    markerArray[counter].on('dragend', function (e) {
        var tempPos = this.getLatLng();
        var point = projectCoordinates([tempPos.lng, tempPos.lat]);
        requestHeight(point[0], point[1], "update", [tempPos.lng, tempPos.lat], counter);
    });

    //If marker was right-clicked
    markerArray[counter].on('contextmenu', function (e) {
        map.removeLayer(markerArray[counter]);
    });

    //Populate marker popup
    markerArray[counter].bindPopup(popupContent(elevation, direction, firemode, type), {
        closeOnClick: false,
        autoClose: false
    }).openPopup();

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Height Data Callback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function heightdataCallback(game, mapp, message, mode, markerCounter) {

    var arrayCount = (target.length);

    if (mode == "update" && markerCounter > 0) {
        //Update it's positions
        target[markerCounter].position[0] = game[0];
        target[markerCounter].position[1] = game[1];
        target[markerCounter].position[2] = (message + 1.7);

        //Calculate other variables
        target[markerCounter].calculateTrajectoryProjectileMotion(artilleryPosition);

        //Populate popup content with the new data
        markerArray[markerCounter].setPopupContent(popupContent(target[markerCounter].gunElevation, target[markerCounter].direction, target[markerCounter].firemode, "target")).openPopup();
    }

    if (mode == "update" && markerCounter == 0) {

        //Set poition for artillery unit
        artilleryPosition = [game[0], game[1], (message + 1.7)];

        //Populate popup content with the new data
        markerArray[markerCounter].setPopupContent(popupContent(-1, -1, -1, "artillery")).openPopup();

        //Draw boundary circle
        map.removeLayer(shootingBoundaries);
        shootingBoundaries = L.circle([mapp[1], mapp[0]], {
            radius: 495
        }).addTo(map);
    }

    //Set position for artillery (The first time you click on the map)
    if (arrayCount == 1 && artilleryPosition[0] == 1) {

        //Set poition for artillery unit
        artilleryPosition = [game[0], game[1], (message + 1.7)];

        //Add the marker for the artillery unit
        addMarker(mapp, "artillery", [0, 0], 0, "None");

        shootingBoundaries = L.circle([mapp[1], mapp[0]], {
            radius: 826
        }).addTo(map);

        //Create new targets
    } else if (mode == "create") {

        //Add marker to the array
        target.push(new Marking([game[0], game[1], message]));
        arrayCount = (target.length) - 1;
        
        console.log(message);

        //Calculate all associate data
        target[arrayCount].calculateTrajectoryProjectileMotion(artilleryPosition);

        //Add the marker for the target
        addMarker(mapp, "target", [target[arrayCount].gunElevation[0], target[arrayCount].gunElevation[1]], target[arrayCount].direction, target[arrayCount].firemode);
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Send PHP request to retrieve height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requestHeight(x, y, mode, realPosition, markerCounter) {

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
    var url = 'https://api.be3dart.ch/ARES.php?x=' + x + '&y=' + y;
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            //Finished
            receivedMessage = parseFloat(xhr.responseText)
            heightdataCallback([x, y], realPosition, receivedMessage, mode, markerCounter);
            return; // this will alert "true";
        }
    }

    xhr.onload = function () {
        //
    };

    xhr.onerror = function () {
        //
    };

    xhr.send();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Marker with Elevation and Polyline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function onMapClick(e) {

    //Add a popup where the user can choose between some buttons
    var popup = L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent('<button class="buttonsInMap" id="add" ><i class="fa fa-plus"></i></button>').openOn(map);

    //Convert the map coordinates to game coordinates
    var point = projectCoordinates([e.latlng.lng, e.latlng.lat])

    var addButton = document.getElementById('add');
    addButton.addEventListener('click', function () {

        //Request height data at that point
        requestHeight(point[0], point[1], "create", [e.latlng.lng, e.latlng.lat], -1);

    });

}

function testFun(e) {

    //Convert the map coordinates to game coordinates
    var point = projectCoordinates([e.latlng.lng, e.latlng.lat])

    console.log(point);
}

map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

map.on('click', testFun);

map.on('contextmenu', onMapClick);

//map.on('click', onMapClick);
