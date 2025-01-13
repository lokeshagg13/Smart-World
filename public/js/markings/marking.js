class Marking {
    constructor(center, directionVector, width, height, isLHT) {
        this.center = center;
        this.directionVector = directionVector;
        this.width = width;
        this.height = height;
        this.isLHT = isLHT;

        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2),
        )
        this.polygon = new Envelope(this.support, width, 0).polygon;
        this.type = "marking";
    }

    static load(info) {
        const center = new Point(
            info.center.x,
            info.center.y
        );
        const directionVector = new Point(
            info.directionVector.x,
            info.directionVector.y
        );
        switch (info.type) {
            case "crossing":
                return new CrossingMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "parking":
                return new ParkingMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "start":
                return new StartMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "stop":
                return new StopMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "target":
                return new TargetMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "trafficLight":
                return new TrafficLightMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
            case "yield":
                return new YieldMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height,
                    info.isLHT
                );
        }
    }

    draw(ctx) {
        this.polygon.draw(ctx);
    }
}