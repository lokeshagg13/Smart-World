class CrossingMarking extends Marking {
    static states = {
        "RED": 0,
        "GREEN": 1
    };

    constructor(center, directionVector, width, height, isLHT) {
        super(center, directionVector, width, height, isLHT);
        this.borders = [this.polygon.segments[0], this.polygon.segments[2]];
        this.pedCount = 0;
        this.state = CrossingMarking.states.GREEN;
        this.type = "crossing";
    }

    draw(ctx) {
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        );

        line.draw(ctx, {
            width: this.height,
            color: "white",
            dash: [11, 11]
        });

        const color = this.state === CrossingMarking.states.RED ? "red" : "green";
        new Segment(this.borders[0].p1, this.borders[1].p2).draw(ctx, { color: color, width: 4 });
        new Segment(this.borders[1].p1, this.borders[0].p2).draw(ctx, { color: color, width: 4 });
    }
}