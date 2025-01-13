class StartMarking extends Marking {
    constructor(center, directionVector, width, height, isLHT) {
        super(center, directionVector, width, height, isLHT);
        if (isLHT) {
            this.angle = angle(directionVector) + Math.PI / 2;
        } else {
            this.angle = angle(directionVector) - Math.PI / 2;
        }
        this.car = new Car(center, this.angle, "AI");
        this.type = "start";
    }

    draw(ctx) {
        this.car.draw(ctx);
    }
}