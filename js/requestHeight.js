/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Send PHP request to retrieve height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function requestHeight(game, mapp, message, mode, markerCounter, start) {
    
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
    var url = 'https://api.be3dart.ch/ARES.php?x=' + game[0] + '&y=' + game[1];
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            //Message to flaot
            message = parseFloat(xhr.responseText)

            if (mode == "offset") {
                gatherHeightDataCallback(message, markerCounter);
            } else {
                heightdataCallback(game, mapp, message, mode, markerCounter, start);
            }
        }
    }

    xhr.onerror = function () {
        alert("Error encountered while requesting height data! Please report to BE3dARt! <3");
    };

    xhr.send();
}
