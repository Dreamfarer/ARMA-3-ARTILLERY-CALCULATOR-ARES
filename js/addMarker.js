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
    var markerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='z-index: 2000;' class='marker-pin'><div style='z-index: 2001;' class='marker-pin2'><div style='z-index: 2002;' class='marker-pin3'><div style='z-index: 2003;' class='marker-pin4'></div></div></div></div>",
        iconSize: [30, 42],
        iconAnchor: [15, 42]
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
