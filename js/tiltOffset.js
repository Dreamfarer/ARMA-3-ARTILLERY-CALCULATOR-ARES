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

        var vec1 = normalize([vector1[0], vector2[1], vector1[2]]);
        var vec2 = normalize(vector2);

        return Math.acos(dot(vec1, vec2) / (magnitude(vec1) * magnitude(vec2))) / 2;
    }
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
//Calculate elevation offset based on sourrounding incline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function elevationOffset(angle, elevation) {

    var inputAngle = angle;
    angle = angle * (Math.PI / 180);

    //Stich together target vector
    elevation = elevation * (Math.PI / 180);
    var targetVector = [Math.cos(elevation), Math.sin(elevation), 0];
    targetVector = rotate(targetVector, -1 * angle, [0, 1, 0]);
    display("Target Vector", targetVector, "vector");

    //Calculate normalvectors of all 4 planes
    //BEISPIEL: 5 Höhenabfragen = 1, 2, 3, 4, 5
    //2, 3, 2, 1, 2
    var origin = [0, 2, 0];
    var normalVectorPlane1 = cross([-5, 3 - origin[1], 0], [0, 2 - origin[1], 5]); //Normalvector for upper-left corner
    var normalVectorPlane2 = multiply_vector_Scalar(cross([5, 1 - origin[1], 0], [0, 2 - origin[1], 5]), -1); //Normalvector for upper-right corner
    var normalVectorPlane3 = multiply_vector_Scalar(cross([-5, 3 - origin[1], 0], [0, 5 - origin[1], -5]), -1); //Normalvector for bottom-left corner
    var normalVectorPlane4 = cross([5, 1 - origin[1], 0], [0, 5 - origin[1], -5]); //Normalvector for bottom-left corner

    //Add the normalvectors together and produce a normalized normalvector of the center / This is the axis where the turret turns around
    var normalVectorTank = normalize(add_vector_vector(add_vector_vector(add_vector_vector(normalVectorPlane1, normalVectorPlane2), normalVectorPlane3), normalVectorPlane4));
    //var normalVectorTank = [0, 1, 0];

    display("Normal Vector", normalVectorTank, "vector");

    //Decide if to add or to remove from angle
    var condition = "Plus";

    //Start Vector; This remains the same always
    var startVector = [1, 0, 0];

    //Roted Vector
    var modifiedVector = rotate(startVector, -1 * angle, normalVectorTank);

    //Perpendicular Vector (Use 90° to calculate it)
    var perpendicular = normalize(cross(modifiedVector,normalVectorTank));

    //Upwards rotated Vector (Bsp. 10° = 0.174), this is the displayed value in the tank!
    var upwards = rotate(modifiedVector, 0.174, perpendicular);

    display("Perpendicular Vector", perpendicular, "vector");

    console.log("------------------------------------------------");

    display("Modified Vector", modifiedVector, "vector");
    display("Upward Vector", upwards, "vector");

    //It works until here!
    //Now up to the difficult part... approximation
    var correctionSideSum = 10;
    var correctionTopSum = 0;

    //1. We go directly to the target above
    //2. With the upper part (The 10° incline) we need to figure out if we need to add angle or take back.
    var correctionTop = getDir(upwards, targetVector, "top");
    var correctionSide = 0;
    //console.log("Correction from top: " + correctionTop * 180 / Math.PI);

    //The problem is that it can't tell us if we should move left or right, the best thing would be to check real quick by trying
    modifiedVector = rotate(upwards, correctionTop, normalVectorTank);
    //console.log("Corrected modified vector: " + modifiedVector);

    //We need to get directions again, compare, and take action 
    var newCorrectionTop = getDir(modifiedVector, targetVector, "top");
    //console.log("NEW Correction from top: " + correctionTop * 180 / Math.PI);

    //We will need to reverse correctionTop in that case
    if (newCorrectionTop > correctionTop) {
        correctionTop = correctionTop * -1;
        condition = "Minus";
    } else {
        condition = "Plus";
    }

    console.log("------------------------------------------------");
    console.log("Loop->");

    var counter = 0;
    while (counter < 20) {

        console.log("------------------------------------------------");

        correctionTop = getDir(upwards, targetVector, "top");

        //Adjust with knowledge from before
        if (condition == "Minus") {
            correctionTop = correctionTop * -1;
        }

        modifiedVector = rotate(upwards, correctionTop, normalVectorTank);
        display("Correction Top", (correctionTop * 180 / Math.PI), "scalar");
        display("Modified Vector", modifiedVector, "vector");

        //We can add this to the total amount of angle
        correctionTopSum += (correctionTop * 180 / Math.PI);

        correctionSide = getDir(modifiedVector, targetVector, "side");

        perpendicular = normalize(cross(modifiedVector,normalVectorTank));
        
        display("Perpendicular Vector", perpendicular, "vector");

        upwards = rotate(modifiedVector, correctionSide, perpendicular);
        display("Correction Side", (correctionSide * 180 / Math.PI), "scalar");
        display("Upward Vector", upwards, "vector");

        //We can add this to the total amount of elevation
        correctionSideSum += (correctionSide * 180 / Math.PI);

        counter += 1;

    }

    console.log("End Elevation: " + correctionSideSum);
    console.log("End Elevation Check: " + getDir([0, 0, 1], upwards, "side") * 2 * 180 / Math.PI);
    console.log("End Direction: " + (inputAngle + (correctionTopSum * -1)));
    
    return [correctionTopSum, correctionSideSum];

}