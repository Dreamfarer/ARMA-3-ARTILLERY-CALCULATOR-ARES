    //Attribution
    //Marker: <div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    //Target: Icons made by <a href="https://www.flaticon.com/authors/alfredo-hernandez" title="Alfredo Hernandez">Alfredo Hernandez</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>

    //Adruino has a read() function which reads every character as described here: https://forum.arduino.cc/index.php?topic=451141.0

    var map = L.map('map', {zoomControl: false}).setView([47.486153, 8.206813], 15);
    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}').addTo(map);

    var markerIcon = L.icon({
        iconUrl: 'img/pin.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60],
    });

    var markerIconDrop = L.icon({
        iconUrl: 'img/pinTarget.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60],
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Convert Longitude and Latitude into meters
    //https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function convertGPStoMeters(lat1, lon1, lat2, lon2) { // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d * 1000; // meters
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Draw polyline
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var polyline;

    function drawPolyline() {

        if (polyline != null) {
            map.removeLayer(polyline);

        };

        if (markerArray.length >= 2) {

            var tempArray = new Array();
            var altitudeAray = new Array();

            var counter = 0;
            var distance = 0;
            var velocity = 40 / 3.6;
            var time = 0;

            while (markerArray[counter] != null) {

                if (counter >= 1) {
                    distance = distance + convertGPStoMeters(positionArray[0][counter - 1], positionArray[1][counter - 1], positionArray[0][counter], positionArray[1][counter]);
                }

                altitudeAray.push(positionArray[2][counter]);

                tempArray.push([positionArray[0][counter], positionArray[1][counter]]);

                counter += 1;
            };

            polyline = L.polyline(tempArray, {
                color: '#e50027'
            }).addTo(map);

            var maxHeight = Math.max(...altitudeAray);
            var minHeight = Math.min(...altitudeAray);

            time = distance / velocity;
            document.getElementById("distance").innerHTML = distance.toFixed(2) + "m";
            document.getElementById("time").innerHTML = (time / 60).toFixed(1) + "min";
            document.getElementById("heightDifference").innerHTML = (maxHeight - minHeight).toFixed(2) + "m";

        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Add Marker too map (automatically detect)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var markerArray = [0];
    var positionArray = [
        [0], [0], [0], [0]
    ];

    //In positionArray[2][1], the first digit represents x,y,z and the second one the marker. So if you want the 3rd marker to be 5m in altitude you would have to write positionArray[2][2] = 5;
    function addMarkerToMap(latitude, longitude, altitude) {

        var counter = 0;

        while (markerArray[counter] != null && markerArray[counter] != 0) {

            var tempPos = markerArray[counter].getLatLng();

            positionArray[0][counter] = tempPos.lat;
            positionArray[1][counter] = tempPos.lng;

            markerArray[counter].setLatLng([positionArray[0][counter], positionArray[1][counter]]);

            counter += 1;
        }

        markerArray[counter] = L.marker([latitude, longitude], {

            icon: markerIcon,
            draggable: 'true'


        }).addTo(map);

        positionArray[0][counter] = latitude;
        positionArray[1][counter] = longitude;
        positionArray[2][counter] = altitude;
        positionArray[3][counter] = 0;

        markerArray[counter].bindPopup("Marker: " + (counter + 1) + "<br>Altitude: " + altitude).openPopup();

        document.getElementById("numMarker").innerHTML = counter + 1;

        markerArray[counter].on('dragend', function (e) {

            getAltitude(positionArray[0][counter], positionArray[1][counter], true, counter);

        });

        markerArray[counter].on('popupopen', function (e) {

            var inputBox = document.getElementById('inputBox');
            inputBox.style.visibility = 'visible';
        });

        markerArray[counter].on('popupclose', function (e) {

            var inputBox = document.getElementById('inputBox');
            inputBox.style.visibility = 'hidden';

        });

        markerArray[counter].on('contextmenu', function (e) {

            var counterWhile = 0;

            if (positionArray[3][counter] == 1) {

                while (markerArray[counterWhile] != null) {

                    positionArray[3][counterWhile] = 0;
                    markerArray[counterWhile].setIcon(markerIcon);
                    counterWhile += 1;
                }

            } else {

                while (markerArray[counterWhile] != null) {

                    positionArray[3][counterWhile] = 0;
                    markerArray[counterWhile].setIcon(markerIcon);
                    counterWhile += 1;
                }
                positionArray[3][counter] = 1;
                markerArray[counter].setIcon(markerIconDrop);
            }

        });

        markerArray[counter].on('drag', function (e) {
            var tempPos = this.getLatLng();

            positionArray[0][counter] = tempPos.lat;
            positionArray[1][counter] = tempPos.lng;

            drawPolyline();
        });

        drawPolyline();
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Update Array and PopUp when draged
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function update(latitude, longitude, altitude, markerNumber) {

        positionArray[2][markerNumber] = altitude;

        markerArray[markerNumber].setPopupContent("Marker: " + (markerNumber + 1) + "<br>Altitude: " + altitude);

        drawPolyline();

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Make a HTTP Request and return elevation
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//https://cors-anywhere.herokuapp.com/https://api.opentopodata.org/v1/srtm90m?locations=
    var urlArray = ["http://[2a02:aa15:337f:9d00:97b5:b12f:1eb4:a93a]:5000/v1/eu-dem?locations=", "https://api.opentopodata.org/v1/srtm90m?locations="];

    function getAltitude(latitude, longitude, option, markerNumber) {

        var xmlhttp = new XMLHttpRequest();

        $.ajax({
            url: (urlArray[0] + "69,420"),
            success: function (result) {
                xmlhttp.open("GET", urlArray[0] + latitude + "," + longitude, true);
                 xmlhttp.send();
            },
            error: function (result) {
                xmlhttp.open("GET", urlArray[1] + latitude + "," + longitude, true);
                 xmlhttp.send();
            }
        });

        xmlhttp.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {

                var myObj = JSON.parse(this.responseText);
                var tempResponse = myObj.results[0].elevation;

                if (option == true) {
                    update(latitude, longitude, tempResponse, markerNumber);
                } else {
                    addMarkerToMap(latitude, longitude, tempResponse);
                }
            }
        };

    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Add Marker with Elevation and Polyline
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onMapClick(e) {

        var latitude = e.latlng.lat;
        var longitude = e.latlng.lng;

        getAltitude(latitude, longitude, false, 9999);

    }

    var submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', function () {

        var counter = 0;

        while (markerArray[counter] != null) {

            var popup = markerArray[counter].getPopup();

            if (popup.isOpen()) {

                var xPos = document.getElementById("xPos").value;
                var yPos = document.getElementById("yPos").value;

                positionArray[0][counter] = xPos;
                positionArray[1][counter] = yPos;

                markerArray[counter].setLatLng([xPos, yPos]);

                drawPolyline();

                getAltitude(positionArray[0][counter], positionArray[1][counter], true, counter);
            }

            counter += 1;
        }

    });

    map.on('click', onMapClick);

    window.setInterval(function () {

    }, 5000);
