class TrafficLightMarking extends Marking {
    static states = {
        "OFF": -1,
        "RED": 0,
        "GREEN": 1,
        "YELLOW": 2
    };

    constructor(center, directionVector, width, height, isLHT) {
        height = 25
        super(center, directionVector, width, height, isLHT);
        if (isLHT) {
            this.mainBorder = this.polygon.segments[2];
            this.otherBorder = this.polygon.segments[0];
        } else {
            this.mainBorder = this.polygon.segments[0];
            this.otherBorder = this.polygon.segments[2];
        }
        this.state = TrafficLightMarking.states.OFF;
        this.type = "trafficLight";
    }

    draw(ctx) {
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        )

        const green = lerp2D(line.p1, line.p2, 0.25);
        const yellow = lerp2D(line.p1, line.p2, 0.5);
        const red = lerp2D(line.p1, line.p2, 0.75);

        new Segment(red, green).draw(ctx, { width: this.height, cap: "round" });
        green.draw(ctx, { size: this.height * 0.4, color: "#060" });
        yellow.draw(ctx, { size: this.height * 0.4, color: "#660" });
        red.draw(ctx, { size: this.height * 0.4, color: "#600" });

        switch (this.state) {
            case TrafficLightMarking.states.GREEN:
                green.draw(ctx, { size: this.height * 0.4, color: "#0F0" });
                break;
            case TrafficLightMarking.states.YELLOW:
                yellow.draw(ctx, { size: this.height * 0.4, color: "#FF0" });
                break;
            case TrafficLightMarking.states.RED:
                red.draw(ctx, { size: this.height * 0.4, color: "#F00" });
                break;
        }
    }
}