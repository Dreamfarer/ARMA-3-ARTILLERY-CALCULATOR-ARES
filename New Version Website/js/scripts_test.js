//USE bedartch_ARES
//magick convert -crop 256x256 ContourMap.jpg tilesLevel0/tile%01d.jpg
//Dir | Rename-Item -NewName {$_.name -replace "-" , ""}

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
    attribution: 'Map data &copy; 34',
    maxNativeZoom: 0,
    minNativeZoom: 0
}).addTo(map);

map.setView([-8410, 8834], 0);


var sol = L.latLng([145, 175.2]);
L.marker(sol).addTo(map);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Send PHP request to retrieve height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requestHeight(x, y) {
    
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
            alert("This Browser can't be used sadly.")
        }

        return xhr;
    };
    
    //Variables to pass to server
    var url = 'https://api.be3dart.ch/ARES.php?x=' + x + '&y=' + y;
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log("Height: %sm", xhr.responseText);
            return xhr.responseText; // this will alert "true";
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
//Round to 5, because height is only mesured every 5 meters
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function round5(x) {
    return Math.ceil(x / 5) * 5;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Convert pixels/map unit into the MySQL entry
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function coordinatesToMySQL(x, y) {

    x = (x / 5) + 1;
    y = ((30720 - y) / 5);
    mysql = (y * 6145) + x;

    return mysql;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Marker with Elevation and Polyline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function onMapClick(e) {

    var coefficient = 1 + (2 / 3);

    var y = 30720 - (e.latlng.lat * coefficient * -1);
    var x = e.latlng.lng * coefficient;

    x = round5(x);
    y = round5(y);
    
    requestHeight(x, y);
}

map.on('click', onMapClick);

window.setInterval(function () {

}, 5000);
