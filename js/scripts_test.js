//USE bedartch_ARES
//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}

var shootingBoundaries;

var markerIcon = L.icon({
    iconUrl: 'img/pin.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -60],
});

var markerIconDrop = L.icon({
    iconUrl: 'img/pinDrop.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -60],
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Map Initialization
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var map = L.map('map', {
    minZoom: 0,
    maxZoom: 2,
    crs: L.CRS.Simple,
    maxBoundsViscosity: 1.0
});

var southWest = map.unproject([0, 18432]);
var northEast = map.unproject([18432, 0]);
map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

L.tileLayer('map/tiles0/map_{x}_{y}.jpg', {
    attribution: 'Map data from Arma 3 &copy; Bohemia Interactive',
    maxNativeZoom: 0,
    minNativeZoom: 0
}).addTo(map);

//Set view to a default position
map.setView([-8410, 8834], 0);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Project Map coordinates to game coordinates
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function projectCoordinates(point) {

    var coefficient = 1 + (2 / 3);

    var x = point[0] * coefficient;
    var y = 30720 - (point[1] * coefficient * -1);

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

        console.log("x: %s, y: %s", distanceComponents[0], distanceComponents[1]);

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

        console.log("Direction: %s", this.direction);
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

        console.log("Distance: %s", this.distance);

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
//Create new Marker
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var markerArray = [0];

function addMarker(point, type, elevation, direction, firemode) {

    var counter = 0;
    while (markerArray[counter] != null && markerArray[counter] != 0) {
        counter += 1;
    }

    markerArray[counter] = L.marker([point[1], point[0]], {
        icon: type,
        draggable: 'true'
    }).addTo(map);

    //If marker has been draged, request new data for it
    markerArray[counter].on('dragend', function (e) {
        var tempPos = this.getLatLng();
        var point = projectCoordinates([tempPos.lng, tempPos.lat]);
        requestHeight(point[0], point[1], "update", [tempPos.lng, tempPos.lat], counter);
    });

    markerArray[counter].bindPopup("Elevation: " + Math.ceil(elevation[0] / 0.01) * 0.01 + "° or " + Math.ceil(elevation[1] / 0.01) * 0.01 + "°<br>Direction: " + Math.ceil(direction / 0.01) * 0.01 + "°<br>Firemode: " + firemode).openPopup();

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Height Data Callback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function heightdataCallback(game, mapp, message, mode, markerCounter) {

    var arrayCount = (target.length);
    console.log("Array is currently %s long", arrayCount);

    if (mode == "update" && markerCounter > 0) {
        target[markerCounter].position[0] = game[0];
        target[markerCounter].position[1] = game[1];
        target[markerCounter].position[2] = (message + 1.7);

        target[markerCounter].calculateTrajectoryProjectileMotion(artilleryPosition);

        markerArray[markerCounter].setPopupContent("Elevation: " + Math.ceil(target[markerCounter].gunElevation[0] / 0.01) * 0.01 + "° or " + Math.ceil(target[markerCounter].gunElevation[1] / 0.01) * 0.01 + "°<br>Direction: " + Math.ceil(target[markerCounter].direction / 0.01) * 0.01 + "°<br>Firemode: " + target[markerCounter].firemode);

        markerArray[markerCounter].openPopup();
    }

    if (mode == "update" && markerCounter == 0) {

        //Set poition for artillery unit
        artilleryPosition = [game[0], game[1], (message + 1.7)];

        markerArray[markerCounter].setPopupContent("Artillery Unit at " + artilleryPosition[2] + "m");
        map.removeLayer(shootingBoundaries);
        shootingBoundaries = L.circle([mapp[1], mapp[0]], {radius: 495}).addTo(map);
    }

    //Set position for artillery (The first time you click on the map)
    if (arrayCount == 1 && artilleryPosition[0] == 1) {

        //Set poition for artillery unit
        artilleryPosition = [game[0], game[1], (message + 1.7)];

        //Add the marker for the artillery unit
        addMarker(mapp, markerIconDrop, [0, 0], 0, "None");
        
        shootingBoundaries = L.circle([mapp[1], mapp[0]], {radius: 495}).addTo(map);

        //Create new targets
    } else if (mode == "create") {

        //Add marker to the array
        target.push(new Marking([game[0], game[1], message]));
        arrayCount = (target.length) - 1;

        //Calculate all associate data
        target[arrayCount].calculateTrajectoryProjectileMotion(artilleryPosition);

        //Add the marker for the target
        addMarker(mapp, markerIcon, [target[arrayCount].gunElevation[0], target[arrayCount].gunElevation[1]], target[arrayCount].direction, target[arrayCount].firemode);
    }



    //map.closePopup();

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

map.on('contextmenu', onMapClick);

//map.on('click', onMapClick);
