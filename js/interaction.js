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
        requestHeight(point, [e.latlng.lng, e.latlng.lat], "", "create", -1, 1);

    });

}

//Mouse events
map.on('drag', function (e) {

    //console.log(markerArray);

    map.panInsideBounds(bounds, {
        animate: false
    });
});
map.on('click', function (e) {

    //console.log(projectCoordinates([e.latlng.lng, e.latlng.lat]))
    //elevationOffset(179, 60);
    //gatherHeightDataCallback(10, 2);

});
map.on('contextmenu', onMapClick);
