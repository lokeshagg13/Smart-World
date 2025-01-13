class Sensor {
    constructor(origin = null, baseAngle = 0) {
        this.rayCount = 3; // Must always be odd to have a center sensor ray sensing the markings
        this.rayLength = 150;
        this.raySpread = Math.PI / 2;

        this.rays = [];
        this.readings = [];
        this.detectedObject = null;
    }

    #castRays(origin, baseAngle) {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                (this.rayCount == 1) ? 0.5 : i / (this.rayCount - 1)
            ) + baseAngle;

            const startPoint = origin;
            const endPoint = new Point(
                startPoint.x + Math.sin(rayAngle) * this.rayLength,
                startPoint.y - Math.cos(rayAngle) * this.rayLength
            );
            this.rays.push(new Segment(startPoint, endPoint));
        }
    }

    #getReading(ray, roadBorders, roadDividers, markings) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        let minTouch = null;
        let detectedObject = null;
        for (const roadBorder of roadBorders) {
            const touch = getIntersection(
                ray.p1,
                ray.p2,
                roadBorder.p1,
                roadBorder.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                minTouch = touch;
                detectedObject = "roadBorder";
            }
        }

        for (const roadDivider of roadDividers) {
            const touch = getIntersection(
                ray.p1,
                ray.p2,
                roadDivider.p1,
                roadDivider.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                minTouch = touch;
                detectedObject = "roadDivider"
            }
        }

        for (const marking of markings) {
            if (marking instanceof StopMarking ||
                (marking instanceof TrafficLightMarking && marking.state !== "green") ||
                marking instanceof YieldMarking
            ) {
                const mainTouch = getIntersection(
                    ray.p1,
                    ray.p2,
                    marking.mainBorder.p1,
                    marking.mainBorder.p2
                );
                const otherTouch = getIntersection(
                    ray.p1,
                    ray.p2,
                    marking.otherBorder.p1,
                    marking.otherBorder.p2
                );
                if (mainTouch) {
                    if (!otherTouch || (mainTouch.offset < otherTouch.offset)) {
                        if (mainTouch.offset < minOffset) {
                            minOffset = mainTouch.offset;
                            minTouch = mainTouch;
                            detectedObject = marking.type;
                        }
                    }
                }
            }
            else if (
                marking instanceof CrossingMarking ||
                marking instanceof ParkingMarking ||
                marking instanceof TargetMarking
            ) {
                for (const border of marking.borders) {
                    const touch = getIntersection(
                        ray.p1,
                        ray.p2,
                        border.p1,
                        border.p2
                    );
                    if (touch && touch.offset < minOffset) {
                        minOffset = touch.offset;
                        minTouch = touch;
                        detectedObject = marking.type;
                    }
                }
            }
        }

        if (detectedObject) {
            return { minTouch, detectedObject };
        } else {
            return null;
        }
    }

    update(origin, baseAngle, roadBorders, roadDividers, markings) {
        this.#castRays(origin, baseAngle);
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            const sensorReading = this.#getReading(
                this.rays[i],
                roadBorders,
                roadDividers,
                markings
            );
            if (sensorReading) {
                this.readings.push(sensorReading.minTouch);
                if (i == Math.floor(this.rayCount / 2)) {
                    this.detectedObject = sensorReading.detectedObject;
                }
            } else {
                this.readings.push(null);
                this.detectedObject = null;
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rays.length; i++) {
            let { p1: startPoint, p2: endPoint } = this.rays[i];
            let midPoint = endPoint;
            if (this.readings[i]) {
                endPoint = new Point(this.readings[i].x, this.readings[i].y);
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                startPoint.x,
                startPoint.y
            );
            ctx.lineTo(
                midPoint.x,
                midPoint.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                endPoint.x,
                endPoint.y
            );
            ctx.lineTo(
                midPoint.x,
                midPoint.y
            );
            ctx.stroke();
        }
    }
}