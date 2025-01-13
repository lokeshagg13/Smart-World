class YieldMarking extends Marking {
    constructor(center, directionVector, width, height, isLHT) {
        super(center, directionVector, width, height, isLHT);
        if (isLHT) {
            this.mainBorder = this.polygon.segments[2];
            this.otherBorder = this.polygon.segments[0];
            this.angle = angle(directionVector) + Math.PI / 2;
        } else {
            this.mainBorder = this.polygon.segments[0];
            this.otherBorder = this.polygon.segments[2];
            this.angle = angle(directionVector) - Math.PI / 2;
        }
        this.type = "yield";
    }

    draw(ctx) {
        this.otherBorder.draw(ctx, { width: 5, color: "white", dash: [2, 2] });

        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.scale(1, 3);

        ctx.beginPath();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold " + this.height * 0.3 + "px Arial";
        ctx.fillText("YEILD", 0, 1);

        ctx.restore();
    }
}