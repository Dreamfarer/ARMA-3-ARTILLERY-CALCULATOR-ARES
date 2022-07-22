/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Callback when dragging the mouse
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('drag', function (e) {
    map.panInsideBounds(bounds, {
        animate: false
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Callback on left-click
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('click', function (e) {
	
    // on map click
	// console.log(markerArray)
	
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Marker with Elevation and Polyline (Callback on right-click)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.on('contextmenu', function (e)  {

    //Convert the map coordinates to game coordinates
    var vec2D_Arma = projectCoordinates([e.latlng.lng, e.latlng.lat])
	
	//Request height data at that point
	requestHeight(vec2D_Arma, [e.latlng.lng, e.latlng.lat], "create", null, null);
	
	/*
	//Add a popup where the user can choose between some buttons
    var popup = L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent('<button class="buttonsInMap" id="add" style="background-color:'+ globalColors[0] +';" ><i class="fa fa-plus"></i></button>').openOn(map);
	
    var addButton = document.getElementById('add');
    addButton.addEventListener('click', function () {
		// On Pop-up click
    });
	*/
    
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Choose "MAAWS Mk4 Mod 0" at the start prompt
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var buttonChangeMode = document.getElementById('Btn8');
buttonChangeMode.addEventListener('click', function () {
    
	// Set system to MAAWS Mk4 Mod 0
	artilleryMode = 1;
	
	// Adjust HTML elements to reveal the actual map
	document.getElementById('map').style.cssText = document.getElementById('map').style.cssText + "animation: blur 1s; animation-fill-mode: forwards;";
	document.getElementById('choseSystem').style.cssText = document.getElementById('choseSystem').style.cssText + "pointer-events: none; ";
	document.getElementById('choseSystem').childNodes[1].style.cssText = document.getElementById('choseSystem').childNodes[1].style.cssText + "animation: transparent 1s; animation-fill-mode: forwards; pointer-events: none;";
	
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Choose "Self-Propelled Artillery" at the start prompt
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var buttonChangeMode = document.getElementById('Btn9');
buttonChangeMode.addEventListener('click', function () {
	
	// Set system to Self-Propelled Artillery
	artilleryMode = 0;
	
	// Adjust HTML elements to reveal the actual map
	document.getElementById('map').style.cssText = document.getElementById('map').style.cssText + "animation: blur 1s; animation-fill-mode: forwards;";
	document.getElementById('choseSystem').style.cssText = document.getElementById('choseSystem').style.cssText + "pointer-events: none; ";
	document.getElementById('choseSystem').childNodes[1].style.cssText = document.getElementById('choseSystem').childNodes[1].style.cssText + "animation: transparent 1s; animation-fill-mode: forwards; pointer-events: none;";
	
});
