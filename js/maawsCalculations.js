/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calculate elevation offset based on sourrounding incline
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function maawsCalculation(distance, heightdifference) {

    //Define variable
    var velocity = 350; //m/s

    //Calculate offset angle
    var offsetAngle = Math.asin(heightdifference / distance) * 180 / Math.PI;

    display("Distance", distance, "scalar");

    //Set coefficient
    var coefficient = 0;
    if (distance < 550) {
        coefficient = Math.pow(0.8, (distance - 630) / 17) + 104.4;
    } else if (distance <= 920 && distance > 550) {
        coefficient = -0.0362 * distance + 127.15;
        
    } else if (distance > 920) {
        coefficient = -0.00915 * distance + 99.75;
    }
    coefficient = coefficient / 100;

    //Angle Calculation
    var angle = Math.asin(Math.sqrt(gravity * distance / coefficient / 2 / Math.pow(velocity, 2) + 0.5)) - Math.PI / 4;
    var realAngle = angle * 180 / Math.PI + offsetAngle;

    //display("Real Angle", realAngle, "scalar");

    return realAngle;
}