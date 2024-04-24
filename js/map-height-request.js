/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Send PHP request to retrieve height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requestHeight(vec2D_Arma, vec2D_Leaflet, mode, indexOfSelectedMarker, iterationCounterOfUpdate) {

	//Create new HTTP Request
	var createCORSRequest = function (method, url) {
		var xhr = new XMLHttpRequest();

		//Error Handling
		if ("withCredentials" in xhr) {
			xhr.open(method, url, true);
		}

		return xhr;
	};

	//Variables to pass to server
	var url = 'https://api.openlink.bot/ares.php?x=' + vec2D_Arma[0] + '&y=' + vec2D_Arma[1];
	var method = 'GET';
	var xhr = createCORSRequest(method, url);

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {

			if (xhr.status === 200) {
				// Parse the JSON response
				var response = JSON.parse(xhr.responseText);

				heightdataCallback(vec2D_Arma, vec2D_Leaflet, response.altitude, mode, indexOfSelectedMarker, iterationCounterOfUpdate);
			} else {
				// Handle error if the server responds with a non-200 status code
				alert("Error encountered while requesting height data!");
			}

		}
	}

	xhr.onerror = function () {
		alert("Error encountered while requesting height data!");
	};

	xhr.send();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Height Data Callback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function heightdataCallback(vec2D_Arma, vec2D_Leaflet, message, mode, indexOfSelectedMarker, iterationCounterOfUpdate) {

	// Update existing marker
	if (mode.substring(0, 6) == "update") {

		// Update artillery system
		if (indexOfSelectedMarker == 0) {

			//Set position for artillery unit
			artilleryPosition = [vec2D_Arma[0], vec2D_Arma[1], (message + 1.7)];

			//Populate popup content with the new data
			markerArray[indexOfSelectedMarker][0].setPopupContent(popupContent(-1, -1, -1, "artillery")).openPopup();

			//Draw boundary circle
			if (artilleryMode == 0) {
				map.removeLayer(shootingBoundaries);
				shootingBoundaries = L.circle([vec2D_Leaflet[1], vec2D_Leaflet[0]], {
					radius: 826,
					color: globalColors[2],
					opacity: 0.5
				}).addTo(map);
			}

			// Start the recursion loop if there is at least one target which needs to be updated
			if (markerArray[1] != null) {
				requestHeight([markerArray[1][2].position[0], markerArray[1][2].position[1]], vec2D_Leaflet, "update-all", null, 1); // Start iteration at 1 'cause index 0 is the artillery system itself
			}

		}

		// Update everything BUT the artillery system
		if (indexOfSelectedMarker != 0) {

			// Single marker
			if (mode != "update-all") {

				//Update its positions
				markerArray[indexOfSelectedMarker][2].position = [vec2D_Arma[0], vec2D_Arma[1], (message + 1.7)];

				//Calculate other variables
				markerArray[indexOfSelectedMarker][2].calculateTrajectoryProjectileMotion(artilleryPosition, indexOfSelectedMarker);

				//Update popup content
				markerArray[indexOfSelectedMarker][0].setPopupContent(popupContent(markerArray[indexOfSelectedMarker][2].gunElevation, markerArray[indexOfSelectedMarker][2].direction, markerArray[indexOfSelectedMarker][2].firemode, "target")).openPopup();

			}

			// Every marker
			if (mode == "update-all" && iterationCounterOfUpdate <= markerArray.length) {

				//Calculate other variables
				markerArray[iterationCounterOfUpdate][2].calculateTrajectoryProjectileMotion(artilleryPosition, iterationCounterOfUpdate);

				//Update popup content
				markerArray[iterationCounterOfUpdate][0].setPopupContent(popupContent(markerArray[iterationCounterOfUpdate][2].gunElevation, markerArray[iterationCounterOfUpdate][2].direction, markerArray[iterationCounterOfUpdate][2].firemode, "target")).openPopup();

				//Enter recursion loop if artillery unit has been dragged and all target need updates
				if (markerArray[iterationCounterOfUpdate + 1] != null && mode == "update-all") {
					requestHeight([markerArray[iterationCounterOfUpdate + 1][2].position[0], markerArray[iterationCounterOfUpdate + 1][2].position[1]], vec2D_Leaflet, "update-all", null, iterationCounterOfUpdate + 1);
				}
			}
		}
	}

	//Create nonexisting marker
	if (mode == "create") {

		// Index of next empty marker
		var markerCount = 0;
		while (markerArray[markerCount] != null) { markerCount += 1 };

		//If no artillery is present
		if (markerArray[0] == null) {

			//Define marker type
			var type = "artillery";

			//Initialize new array parameters and create new marker
			markerArray[0] = [0, type, new Marking([vec2D_Arma[0], vec2D_Arma[1], message])];

			//Set poition for artillery unit
			artilleryPosition = [vec2D_Arma[0], vec2D_Arma[1], (message + 1.7)];

			//Add the marker for the artillery unit
			addMarker(vec2D_Leaflet, type, [0, 0], 0, "None", 0);

			//Adding circle to show minimal shooting distance
			if (artilleryMode == 0) {
				shootingBoundaries = L.circle([vec2D_Leaflet[1], vec2D_Leaflet[0]], {
					radius: 826,
					color: globalColors[2],
					opacity: 0.5
				}).addTo(map);
			}

			// Update every marker
			requestHeight(vec2D_Arma, vec2D_Leaflet, "update", 0, null);

		} else {

			//Define marker type
			var type = "target";

			//Initialize new array parameters and create new marker
			markerArray[markerCount] = [0, type, new Marking([vec2D_Arma[0], vec2D_Arma[1], message])];

			//Calculate all associate data and handle error if shooting is not possible
			if (markerArray[markerCount][2].calculateTrajectoryProjectileMotion(artilleryPosition, markerCount) == false) {
				markerArray.splice(markerCount, 1);
				return;
			}

			//Add the marker for the target
			addMarker(vec2D_Leaflet, type, markerArray[markerCount][2].gunElevation, markerArray[markerCount][2].direction, markerArray[markerCount][2].firemode, markerCount);

		}
	}
}
