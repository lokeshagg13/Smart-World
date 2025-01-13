class TargetMarking extends Marking {
    constructor(center, directionVector, width, height, isLHT) {
        super(center, directionVector, width, height, isLHT);
        this.type = "target";
    }

    draw(ctx) {
        this.center.draw(ctx, { color: "red", size: 30 });
        this.center.draw(ctx, { color: "white", size: 20 });
        this.center.draw(ctx, { color: "red", size: 10 });
    }
}