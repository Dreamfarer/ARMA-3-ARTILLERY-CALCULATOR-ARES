/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Center (calculate current target)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function center (init_old, init_new, init_current, target_old, target_new) {
	
	// Find quotient (Between old to current and old to new)
	var quotient = (init_old - init_current) / (init_old - init_new);
	
	// Apply to target
	return (target_old + ((target_new - target_old) * quotient));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Recursive numerical Euler method to approximate ordinary differential equation
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function eulerRecursion(maxDepth, exitCondition, v_x, v_y, x, y, airFriction, deltaTime, gravAcceleration) {
	
	var x_before = x;
	var y_before = y;
	
	v_x = (v_x * Math.sqrt(Math.pow(v_x, 2) + Math.pow(v_y, 2)) * airFriction) * deltaTime + v_x;
	v_y = (v_y * Math.sqrt(Math.pow(v_x, 2) + Math.pow(v_y, 2)) * airFriction - gravAcceleration) * deltaTime + v_y;
	
	x = v_x * deltaTime + x;
	y = v_y * deltaTime + y;
	
	if (y <= exitCondition && v_y < 0) {
		return center(y_before, y, exitCondition, x_before, x);
	} else {
		// console.log([v_x, v_y]);
		return eulerRecursion(maxDepth, exitCondition, v_x, v_y, x, y, airFriction, deltaTime, gravAcceleration);
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Recurse until satisfaction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function approximation (boundry, distance, deltaAltitude) {
	
	// Define variables
    var initialVelocity = 350; // m/s
	var airFriction = -0.000132; // N
	var deltaTime = 0.05; // s
	
	// Fixed variables
	var x = 0;
	var y = 1.53;
	
	// Set boundries (the first two iteration)
	if (boundry[0][1] == null) {
		
		var v_x = initialVelocity * Math.cos(boundry[0][0] * Math.PI / 180);
		var v_y = initialVelocity * Math.sin(boundry[0][0] * Math.PI / 180);
		boundry[0][1] = eulerRecursion(100, deltaAltitude, v_x, v_y, x, y, airFriction, deltaTime, gravAcceleration);
		return approximation (boundry, distance, deltaAltitude);
		
	} else if (boundry[1][1] == null) {
		
		var v_x = initialVelocity * Math.cos(boundry[1][0] * Math.PI / 180);
		var v_y = initialVelocity * Math.sin(boundry[1][0] * Math.PI / 180);
		boundry[1][1] = eulerRecursion(100, deltaAltitude, v_x, v_y, x, y, airFriction, deltaTime, gravAcceleration);
		return approximation (boundry, distance, deltaAltitude);
	}
	
	var angleDelta = center(boundry[1][1], boundry[0][1], distance, boundry[1][0], boundry[0][0])
	
	var v_x = initialVelocity * Math.cos(angleDelta * Math.PI / 180);
	var v_y = initialVelocity * Math.sin(angleDelta * Math.PI / 180);
	var calculatedDistance = eulerRecursion(100, deltaAltitude, v_x, v_y, x, y, airFriction, deltaTime, gravAcceleration);
	
	// Adjust boundries
	if (calculatedDistance > distance) {
		boundry[1] = [angleDelta, calculatedDistance];
	} else {
		boundry[0] = [angleDelta, calculatedDistance];
	}
	
	if (calculatedDistance < distance + 1 && calculatedDistance > distance - 1) {
		// console.log("Angle: " + angleDelta + "Distance: " + calculatedDistance);
		return [(Math.round(angleDelta * 100) / 100), (Math.round(calculatedDistance * 100) / 100)];
	} else {
		return approximation (boundry, distance, deltaAltitude);
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAAWS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function maawsCalculation(distance, deltaAltitude) {
	
	// Define variables which will be returned
	var firemode;
	var initialVelocity;
	var elevation = [null, null];
	
	// Precise boundaries fasten the calculation (CREATE APPROPIRATE FUNCTION)
	var boundry = [[0, null], [10, null]];
	
	// Start approximation
	var buffer = approximation (boundry, distance, deltaAltitude);
	
	// console.log("Angle: " + buffer[0] + ", Distance: " + buffer[1] + ", Delta Altitude: " + deltaAltitude);
	
	// Return firemode and elevation
	return ["None", [buffer[0], null]];
	
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Select which firemode to use (only used for self-propelled artillery)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function calculateFiremode(distanceLocal) {

	if (distanceLocal >= 826 && distanceLocal <= 2237) {
		return ["Close", 153.9]; //Initial velocity: 810*0.19 m/s
	}

	if (distanceLocal > 2237 && distanceLocal <= 5646) {
		return ["Medium", 243]; //Initial velocity: 810*0.3 m/s
	}

	if (distanceLocal > 5646 && distanceLocal <= 15029) {
		return ["Far", 388.8]; //Initial velocity: 810*0.48 m/s
	}

	if (distanceLocal > 15029 && distanceLocal <= 42818) {
		return ["Further", 648]; //Initial velocity: 810*0.48 m/s
	}
	
	alert("Too Close - Shooting is not possible");
	return null;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sochor / Scorcher
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function selfPropelledArtilleryCalculation(distance, deltaAltitude) {
	
	// Define variables which will be returned
	var firemode;
	var initialVelocity;
	var elevation = [null, null];
	
	//Chose which firemode to use for such a distance
	var buffer = calculateFiremode(distance);
    if (buffer == null) {
        return null;
    } else {
		firemode = buffer[0];
		initialVelocity = buffer[1];
	}
	
	//Calculate both projectile trajectory parabolas
    elevation[0] = (Math.atan((Math.pow(initialVelocity, 2) - Math.sqrt(Math.pow(initialVelocity, 4) - (gravAcceleration * ((gravAcceleration * Math.pow(distance, 2)) + (2 * deltaAltitude * Math.pow(initialVelocity, 2)))))) / (gravAcceleration * distance))) * 180 / Math.PI;
    elevation[1] = (Math.atan((Math.pow(initialVelocity, 2) + Math.sqrt(Math.pow(initialVelocity, 4) - (gravAcceleration * ((gravAcceleration * Math.pow(distance, 2)) + (2 * deltaAltitude * Math.pow(initialVelocity, 2)))))) / (gravAcceleration * distance))) * 180 / Math.PI;
	
	// Return firemode and elevation
	return [firemode, elevation];
}