/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Create new marker
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function addMarker(point, type, elevation, direction, firemode, counter) {

    //Color of marker
    var markerColor = [globalColors[1], "#ffffff"];

    //Decide which icon to use
    if (type == "target") {
        markerColor[0] = globalColors[0];
    } else {
        markerColor[0] = globalColors[1];
    }

    //Build CSS for html-only marker with color variation
    var cssString = "<div style='z-index: 2000; width: 30px; height: 30px; border-radius: 50% 50% 50% 50%; background: " + markerColor[0] + "; position: absolute; left: 50%; top: 50%; margin: -15px 0 0 -15px;'><div style='z-index: 2001; width: 20px; height: 20px; border-radius: 50% 50% 50% 50%; background: " + markerColor[1] + "; position: absolute; left: 50%; top: 50%; margin: -10px;'><div style='z-index: 2002; width: 10px; height: 10px; border-radius: 50% 50% 50% 50%; background: " + markerColor[0] + "; position: absolute; left: 50%; top: 50%; margin: -5px;'><div style='z-index: 2003; width: 40px; height: 3px; background: " + markerColor[0] + "; position: absolute; right: -15px; top: 3.5px;'><div style='z-index: 2004; width: 3px; height: 40px; background: " + markerColor[0] + "; position: absolute; right: 18.5px; top: -19px;'></div></div></div></div></div>";

    //Create html only target-icon for marker
    var markerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: cssString,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -22]
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
        requestHeight(point, [tempPos.lng, tempPos.lat], "update", counter, null);
    });

    //If marker was right-clicked
    if (type == "target") {
        markerArray[counter][0].on('contextmenu', function (e) {
            map.removeLayer(markerArray[counter][0]);
			markerArray.splice(counter, 1);
        });
    } else {
        markerArray[counter][0].on('contextmenu', function (e) {
			if (artilleryMode == 0) {map.removeLayer(shootingBoundaries)}
            map.removeLayer(markerArray[counter][0]);
            delete markerArray[counter];
        });
    }

    //Populate marker popup
    markerArray[counter][0].bindPopup(popupContent(elevation, direction, firemode, type), {
        closeOnClick: false,
        autoClose: false,
		autoPan: false,
		closeButton: false
    }).openPopup();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return Popup Content
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function popupContent(elevation, direction, firemode, mode) {

    if (mode == "target") {
		
		// Display elevation
        var messageElevation = "<li style='font-weight: bold;'> Elevation: " + (Math.ceil(elevation[0] / 0.01) * 0.01).toFixed(2) + "°</li>";
		
		// Display direction
        var messageDirection = "Direction: " + (Math.ceil(direction[0] / 0.01) * 0.01).toFixed(2) + "°</li>";
		
		// Display firemode (if present)
		if (artilleryMode == 0) {
			var messageFiremode = "<li style='font-weight: bold; font-style: italic'> Firemode: " + firemode + "</li>";
		} else {
			var messageFiremode = "";
		}
		
		// Connect strings and display
		return "<ul style='list-style-type: none; margin: 0; padding: 0;'>" + messageElevation + messageDirection + messageFiremode + "</ul>";
		
	} else if (mode == "NaN") {
        return "<div style='font-weight: bold;'> Shooting is not possible</div>";
    } else {

        if (artilleryMode == 0) {
            return "2S9 Sochor / M4 Scorcher";
        } else {
            return "MAAWS Mk4 Mod 0";
        }

    }
}
