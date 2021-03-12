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