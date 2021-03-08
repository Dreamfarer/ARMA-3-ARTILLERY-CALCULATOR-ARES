/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Cross product
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cross(A, B) {

    return [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Dot product
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function dot(A, B) {
    return (A[0] * B[0] + A[2] * B[2] + A[1] * B[1]);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Multiply vector with scalar
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function multiply_vector_Scalar(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add vector and vector
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function add_vector_vector(vector1, vector2) {
    return [vector1[0] + vector2[0], vector1[1] + vector2[1], vector1[2] + vector2[2]];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Turn a given vector on the basis of an angle and the desired axis
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function rotate(inputvector, angle, axis) {

    var resultingVector1 = multiply_vector_Scalar(inputvector, (Math.cos(angle)));
    var resultingVector2 = multiply_vector_Scalar(cross(axis, inputvector), Math.sin(angle));
    var resultingVector3 = multiply_vector_Scalar(multiply_vector_Scalar(axis, dot(axis, inputvector)), 1 - Math.cos(angle));
    var result = add_vector_vector(add_vector_vector(resultingVector1, resultingVector2), resultingVector3);

    return result;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return the normalized version of a vector. [Vector with length of 1]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function magnitude(inputvector) {

    return Math.sqrt(Math.pow(inputvector[0], 2) + Math.pow(inputvector[1], 2) + Math.pow(inputvector[2], 2));

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Return the normalized version of a vector. [Vector with length of 1]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function normalize(inputvector) {

    var length = Math.sqrt(Math.pow(inputvector[0], 2) + Math.pow(inputvector[1], 2) + Math.pow(inputvector[2], 2));
    return [inputvector[0] / length, inputvector[1] / length, inputvector[2] / length];

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Display telemetry stuff of approximation function
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function display(message, data, type) {

    if (type == "vector") {
        console.log(message + ": v=(" + data[0].toFixed(2) + "," + data[2].toFixed(2) + "," + data[1].toFixed(2) + ")");
    }

    if (type == "scalar") {
        console.log(message + ": " + data.toFixed(2));
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate remaining direction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getDir(vector1, vector2, axis) {

    if (axis == "top") {

        var vec1 = normalize([vector1[0], 0, vector1[2]]);
        var vec2 = normalize([vector2[0], 0, vector2[2]]);

        var overflowChecker = (dot(vec1, vec2) / (magnitude(vec1) * magnitude(vec2)));

        if (overflowChecker > 1) {
            overflowChecker = 1;
        }

        return Math.acos(overflowChecker) / 2;

    } else {

        //1 Modified, 2 Target

        //var vec1 = normalize([vector1[0], vector2[1], vector1[2]]);
        //var vec2 = normalize(vector2);

        var vec1 = [vector2[0], vector1[1], vector2[2]];
        var vec2 = vector2;

        return Math.acos(dot(vec1, vec2) / (magnitude(vec1) * magnitude(vec2))) / 2;
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Is used to receive height data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//From left to right [x,y]: Center-Top -> Left-Center ->  Center-Center -> Right-Center -> Center-Bottom
//var heightData = [NaN, NaN, NaN, NaN];
var heightData = [NaN, NaN, NaN, NaN];

function gatherHeightDataCallback(message, number) {
    heightData[number] = message;

    for (let i = 0; i < 4; i++) {
        if (isNaN(heightData[i])) {
            return;
        }
    }

    var vector1 = [0, heightData[0], 5];
    var vector2 = [-5, heightData[1], 0];
    var vector3 = [5, heightData[2], 0];
    var vector4 = [0, heightData[3], -5];

    var normalVectorPlane1 = cross(vector2, vector1); //Normalvector for upper-left corner
    var normalVectorPlane2 = multiply_vector_Scalar(cross(vector3, vector1), -1); //Normalvector for upper-right corner
    var normalVectorPlane3 = multiply_vector_Scalar(cross(vector2, vector4), -1); //Normalvector for bottom-left corner
    var normalVectorPlane4 = cross(vector3, vector4); //Normalvector for bottom-right corner

    var normalVectorTank = normalize(add_vector_vector(add_vector_vector(add_vector_vector(normalVectorPlane1, normalVectorPlane2), normalVectorPlane3), normalVectorPlane4));

    elevationOffset(normalVectorTank);

    return;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Gather height data first, then call elevationoffset() when all 5 height points have arrived
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var angle = NaN;
var elevation = NaN;

function gatherHeightData(inputangle, inputelevation, position) {

    angle = inputangle;
    elevation = inputelevation;

    //We reuse the scheme requestHeight(game, mapp, message, mode, markerCounter, start)
    //game: Coordinates / mapp: - / message: "" / mode: "offset" / markerCounter: Index of Array / start: -
    var origin = [[position[0], position[1] + 5], [position[0] - 5, position[1]], [position[0] + 5, position[1]], [position[0], position[1] - 5]];
    for (let i = 0; i < 4; i++) {
        requestHeight(origin[i], [0, 0], "", "offset", i, 0);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate elevation offset based on sourrounding incline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function elevationOffset(normalVectorTank) {

    //Define some variables
    var inputAngle = angle;
    angle = angle * (Math.PI / 180);

    //Stich together target vector
    elevation = elevation * (Math.PI / 180);
    var targetVector = [Math.cos(elevation), Math.sin(elevation), 0];
    targetVector = rotate(targetVector, -1 * angle, [0, 1, 0]);
    display("Target Vector", targetVector, "vector");

    //Calculate normalvectors of all 4 planes
    var origin = [0, 0, 0];
    var normalVectorPlane1 = cross([-5, 3 - origin[1], 0], [0, 2 - origin[1], 5]); //Normalvector for upper-left corner
    var normalVectorPlane2 = multiply_vector_Scalar(cross([5, 1 - origin[1], 0], [0, 2 - origin[1], 5]), -1); //Normalvector for upper-right corner
    var normalVectorPlane3 = multiply_vector_Scalar(cross([-5, 3 - origin[1], 0], [0, 2 - origin[1], -5]), -1); //Normalvector for bottom-left corner
    var normalVectorPlane4 = cross([5, 1 - origin[1], 0], [0, 2 - origin[1], -5]); //Normalvector for bottom-left corner
    display("Normal Vector", normalVectorTank, "vector");

    //Decide if to add or to remove from angle
    var condition = "Plus";

    //Start Vector
    if (normalVectorTank[0] == 0) {
        var startVector = [1, 0, 0];
    } else {
        var startVector = normalize([((-1 * normalVectorTank[1]) / normalVectorTank[0]), 1, 0]);
    }

    startVector[0] = Math.abs(startVector[0]);
    normalize(startVector);
    display("Start Vector", startVector, "vector");

    //Rotate turret
    var before;
    var modifiedVector = rotate(startVector, -1 * angle, normalVectorTank);
    var after = getDir(startVector, modifiedVector, "top") * 2;

    //We can add this to the total amount of angle
    var correctionTopSum = Math.abs(0 - after);

    //Check if shooting is even possible
    if (modifiedVector[1] > targetVector[1]) {
        console.log("Angle too flat; Shooting not possible")
        return;
    }

    //Elevate the turret
    var perpendicular = normalize(cross(modifiedVector, normalVectorTank));
    var correctionSide = getDir(modifiedVector, targetVector, "side");
    modifiedVector = rotate(modifiedVector, correctionSide, perpendicular);

    //Check to which side the turret should be turning
    var correctionTop = getDir(modifiedVector, targetVector, "top");
    var directionChecker = rotate(modifiedVector, correctionTop, normalVectorTank);
    var newCorrectionTop = getDir(directionChecker, targetVector, "top");
    if (newCorrectionTop > correctionTop) {
        correctionTop = correctionTop * -1;
        condition = "Minus";
        var correctionSideSum = correctionSide;
    } else {
        condition = "Plus";
        var correctionSideSum = correctionSide * -1;
    }
    
    console.log(condition);

    //This counts the 
    

    var counter = 0;
    while (counter < 15) {

        //Check which difference is bigger;
        correctionTop = getDir(modifiedVector, targetVector, "top");
        correctionSide = getDir(modifiedVector, targetVector, "side");

        //Decide with knowledge from before
        if (condition == "Minus") {
            correctionTop = correctionTop * -1;
        }

        //Always correct the one with a bigger difference
        if (Math.abs(correctionTop) > Math.abs(correctionSide)) {

            //Rotate turret
            before = getDir(modifiedVector, targetVector, "top");
            modifiedVector = rotate(modifiedVector, correctionTop, normalVectorTank);
            after = getDir(modifiedVector, targetVector, "top");

            //We can add this to the total amount of angle
            correctionTopSum += Math.abs(before - after);
            
            display("Approximation TOP", modifiedVector, "vector");

        } else {

            //Calculate perpendicular vector (Used as axis when elevating turret)
            perpendicular = normalize(cross(modifiedVector, normalVectorTank));

            //Elevate turret
            modifiedVector = rotate(modifiedVector, correctionSide, perpendicular);

            //Add to the total amount of elevation
            correctionSideSum += correctionSide;
        }

        //Display the modified vector
        display("Approximation Vector", modifiedVector, "vector");

        //You don't have to calculate any further if this criteria is met:
        if ((correctionTop * 180 / Math.PI) < 0.01 && (correctionSide * 180 / Math.PI) < 0.01) {
            break;
        }

        counter += 1;

    }

    display("End Vector", modifiedVector, "vector"); //correct
    console.log("End Elevation: " + (correctionSideSum * 180 / Math.PI)); //correct

    console.log("Original Angle: " + transform(inputAngle, false));
    console.log("Strife: " + transform((correctionTopSum * 180 / Math.PI), false));

    console.log("Diviation from perfect direction: " + (correctionTop * 180 / Math.PI));
    console.log("Diviation from perfect elevation: " + (correctionSide * 180 / Math.PI));

    //Reset these variables to be used again later
    angle = NaN;
    elevation = NaN;
    heightData = [NaN, NaN, NaN, NaN];

}
