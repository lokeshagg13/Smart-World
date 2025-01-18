class StartMarking extends Marking {
    constructor(center, directionVector, width, height, isLHT, isSimulation = false) {
        super(center, directionVector, width, height, isLHT);
        if (isLHT) {
            this.angle = angle(directionVector) + Math.PI / 2;
        } else {
            this.angle = angle(directionVector) - Math.PI / 2;
        }
        this.car = new Car(center, this.angle, isSimulation);
        this.type = "start";
    }

    draw(ctx) {
        this.car.draw(ctx);
    }
}