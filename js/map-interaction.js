/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Callback when dragging the mouse
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('drag', function (e) {

    //console.log(markerArray);

    map.panInsideBounds(bounds, {
        animate: false
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Callback on left-click
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('click', function (e) {

    //console.log(projectCoordinates([e.latlng.lng, e.latlng.lat]))
    //elevationOffset(179, 60);
    //gatherHeightDataCallback(10, 2);

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Marker with Elevation and Polyline (Callback on right-click)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('contextmenu', function (e)  {
    
    //Add a popup where the user can choose between some buttons
    var popup = L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent('<button class="buttonsInMap" id="add" style="background-color:'+ globalColors[0] +';" ><i class="fa fa-plus"></i></button>').openOn(map);

    //Convert the map coordinates to game coordinates
    var point = projectCoordinates([e.latlng.lng, e.latlng.lat])

    var addButton = document.getElementById('add');
    addButton.addEventListener('click', function () {

		//Request height data at that point
		requestHeight(point, [e.latlng.lng, e.latlng.lat], "", "create", -1, 1);

    });
    
});


// Choose "MAAWS Mk4 Mod 0" at the beginning
var buttonChangeMode = document.getElementById('Btn8');
buttonChangeMode.addEventListener('click', function () {
    
	document.getElementById('map').style.cssText = document.getElementById('map').style.cssText + "filter: blur(0px); -webkit-filter: blur(0px);";
	// document.getElementById('options').style.cssText = document.getElementById('options').style.cssText + "filter: blur(0px); -webkit-filter: blur(0px);";
	document.getElementById('decidePrompt').remove();
	
	artilleryMode = 1;
	
});

// Choose "Self-Propelled Artillery" at the beginning
var buttonChangeMode = document.getElementById('Btn9');
buttonChangeMode.addEventListener('click', function () {
	
	document.getElementById('map').style.cssText = document.getElementById('map').style.cssText + "filter: blur(0px); -webkit-filter: blur(0px);";
	// document.getElementById('options').style.cssText = document.getElementById('options').style.cssText + "filter: blur(0px); -webkit-filter: blur(0px);";
	document.getElementById('decidePrompt').remove();
	
	artilleryMode = 0;
	
});
