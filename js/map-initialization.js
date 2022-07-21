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
    maxBoundsViscosity: 1,
    zoomControl: false
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