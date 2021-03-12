/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Height Data Callback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function heightdataCallback(game, mapp, message, mode, markerCounter, start) {

    if (mode == "update") {

        var goal = markerArray.length;

        //Go this path to update artillery when dragged
        if (markerCounter == 0) {

            //Set poition for artillery unit
            artilleryPosition = [game[0], game[1], (message + 1.7)];

            //Populate popup content with the new data
            markerArray[markerCounter][0].setPopupContent(popupContent(-1, -1, -1, "artillery")).openPopup();

            //Draw boundary circle
            map.removeLayer(shootingBoundaries);
            shootingBoundaries = L.circle([mapp[1], mapp[0]], {
                radius: 826
            }).addTo(map);

            if (markerArray[1] != null) {
                requestHeight([markerArray[1][2].position[0], markerArray[1][2].position[1]], mapp, "", "update", -9, 1);
            }

            return;

            //Go this path to update target when independetly dragged
        } else {

            if (markerCounter != -9) {

                start = markerCounter;
                goal = markerCounter;
            }

        }

        if (markerArray[start] != null && start <= goal) {

            //Update it's positions
            if (markerCounter != -9) {
                markerArray[start][2].position = [game[0], game[1], (message + 1.7)];
            }

            //Calculate other variables
            markerArray[start][2].calculateTrajectoryProjectileMotion(artilleryPosition, start);

            if (artilleryMode > 0) {
                markerArray[start][0].setPopupContent(popupContent(markerArray[start][2].gunElevation, markerArray[start][2].direction, "", "target")).openPopup();
            }

            //Enter recursion loop if artillery unit has been dragged and all target need updates
            if (markerArray[start + 1] != null && markerCounter == -9) {
                requestHeight([markerArray[start + 1][2].position[0], markerArray[start + 1][2].position[1]], mapp, "", "update", -9, start + 1);
            }
        }

    } else {

        //Count the marker from start to end; finish when a null-entry is found
        var counter = 0;
        while (true) {
            if (markerArray[counter] == null) {

                if (markerArray[0] == null) {

                    //Define marker type
                    var type = "artillery";

                    //Initialize new array parameters
                    markerArray[counter] = [0, type, new Marking([game[0], game[1], message])];

                    //Set poition for artillery unit
                    artilleryPosition = [game[0], game[1], (message + 1.7)];

                    //Add the marker for the artillery unit
                    addMarker(mapp, type, [0, 0], 0, "None", counter);

                    //Adding circle to show minimal shooting distance
                    shootingBoundaries = L.circle([mapp[1], mapp[0]], {
                        radius: 826
                    }).addTo(map);

                } else {

                    //Define marker type
                    var type = "target";

                    //Initialize new array parameters
                    markerArray[counter] = [0, type, new Marking([game[0], game[1], message])];

                    //Calculate all associate data
                    markerArray[counter][2].calculateTrajectoryProjectileMotion(artilleryPosition, counter);

                    //Add the marker for the target
                    addMarker(mapp, type, markerArray[counter][2].gunElevation, markerArray[counter][2].direction, markerArray[counter][2].firemode, counter);

                }
                break;
            } else {
                counter += 1;
            }
        }
    }
}
