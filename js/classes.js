/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Class for artillery unit and targets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Marking {

    constructor(position) {
        //Must be given as parameters
        this.position = position;

        //Other variables
        this.firemode = "None";
        this.distance = 0;
        this.direction = [0, 0];
        this.gunElevation = [0, 0, 0];
        this.heightDifference = 0;
    }

    //Get the azimut right
    calculateDirection(distanceComponents) {

        //0° to 90°, x: positive, y: positive
        if (distanceComponents[0] >= 0 && distanceComponents[1] >= 0) {
            this.direction[0] = 90 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //90° to 180°, x: positive, y: negative
        if (distanceComponents[0] >= 0 && distanceComponents[1] < 0) {
            this.direction[0] = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //180° to 270°, x: negative, y: negative
        if (distanceComponents[0] < 0 && distanceComponents[1] < 0) {
            this.direction[0] = 90 + (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }

        //270° to 360°, x: negative, y: positive
        if (distanceComponents[0] < 0 && distanceComponents[1] >= 0) {
            this.direction[0] = 450 - (Math.abs(Math.atan2(distanceComponents[1], distanceComponents[0])) * 180.0 / Math.PI);
        }
    }

    //Calculate the Trajectory of the Projectile Motion - THE CORE Function of this app.
    calculateTrajectoryProjectileMotion(positionArtillery, counter) {

        //x and y component of distance
        var x = this.position[0] - positionArtillery[0]; //Positive when target is to the East, negative when target is to the West
        var y = this.position[1] - positionArtillery[1]; //Positive when target is to the North, negative when target is to the South$

        //Calculate azimut
        this.calculateDirection([x, y]);

        //Pythagorean theorem
        this.distance = Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));

        //Calculate height difference between artillery unit and target
        this.heightDifference = this.position[2] - positionArtillery[2];

		// Retrieve variables calculated in projectile motion calculation
		var buffer;
		if (artilleryMode == 0) { // self-propelled artillery
		
			buffer = selfPropelledArtilleryCalculation(this.distance, this.heightDifference);
			
			if (buffer == null) {
				return false;
			}
			
			this.firemode = buffer[0];
			this.gunElevation[0] = buffer[1][0];
			this.gunElevation[1] = buffer[1][1];
			
		} else if (artilleryMode == 1) { // MAAWS
		
			buffer = maawsCalculation(this.distance, this.heightDifference);
			this.firemode = buffer[0];
			this.gunElevation[0] = buffer[1][0];
			this.gunElevation[1] = 0;
			
		}
		
        //Activate tilt-offset on demand
        if (experimentalMode != 0) {
            gatherHeightData(transform(this.direction[0], true), this.gunElevation[0], [artilleryPosition[0], artilleryPosition[1]], counter);
        }
		
		return true;
    }
}