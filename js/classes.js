/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Class for artillery unit and targets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Marking {

    constructor(position) {
        //Must be given as parameters
        this.position = position;

        //Other variables
        this.firemode = "Close";
        this.distance = 0;
        this.velocity = 0;
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

    //Select which firemode to use
    calculateFiremode(distanceLocal) {

        if (distanceLocal >= 826 && distanceLocal <= 2237) {
            this.firemode = "Close";
            this.velocity = 153.9; //Initial velocity: 810*0.19 m/s
        }

        if (distanceLocal > 2237 && distanceLocal <= 5646) {
            this.firemode = "Medium";
            this.velocity = 243; //Initial velocity: 810*0.3 m/s
        }

        if (distanceLocal > 5646 && distanceLocal <= 15029) {
            this.firemode = "Far";
            this.velocity = 388.8; //Initial velocity: 810*0.48 m/s
        }

        if (distanceLocal > 15029 && distanceLocal <= 42818) {
            this.firemode = "Further";
            this.velocity = 648; //Initial velocity: 810*0.48 m/s
        }

        if (this.velocity == 0) {
            alert("Too Close - Shooting is not possible");
            return false;
        } else {
            return true;
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

        //Chose which firemode to use for such a distance
        if (this.calculateFiremode(this.distance) == false) {
            return false;
        }

        //Calculate both projectile trajectory parabolas
        this.gunElevation[0] = (Math.atan((Math.pow(this.velocity, 2) - Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        this.gunElevation[1] = (Math.atan((Math.pow(this.velocity, 2) + Math.sqrt(Math.pow(this.velocity, 4) - (gravity * ((gravity * Math.pow(this.distance, 2)) + (2 * this.heightDifference * Math.pow(this.velocity, 2)))))) / (gravity * this.distance))) * 180 / Math.PI;

        //To reset the firemode tracker
        this.velocity = 0;

        //Activate tilt-offset on demand
        if (experimentalMode != 0) {
            gatherHeightData(transform(this.direction[0], true), this.gunElevation[0], [artilleryPosition[0], artilleryPosition[1]], counter);
        }
    }
}

//Initialization of markers
var markerArray = [[0, "artillery", new Marking([0, 0, 0])]];
delete markerArray[0];