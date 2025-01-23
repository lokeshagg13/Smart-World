class RoadSensorRay {
    constructor(startPoint, angle, rayLength = 200) {
        this.startPoint = startPoint;
        this.rayLength = rayLength;
        this.endPoint = new Point(
            startPoint.x + Math.sin(angle) * rayLength,
            startPoint.y - Math.cos(angle) * rayLength
        );
        this.borderReading = null;
    }

    detectRoadBorders(pathBorders, roadDividers) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        for (const pathBorder of pathBorders) {
            const touch = getIntersection(
                this.startPoint,
                this.endPoint,
                pathBorder.p1,
                pathBorder.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                this.borderReading = touch;
            }
        }

        for (const roadDivider of roadDividers) {
            const touch = getIntersection(
                this.startPoint,
                this.endPoint,
                roadDivider.p1,
                roadDivider.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                this.borderReading = touch;
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#555";
        ctx.moveTo(
            this.startPoint.x,
            this.startPoint.y
        );
        ctx.lineTo(
            this.endPoint.x,
            this.endPoint.y
        );
        ctx.stroke();

        if (this.borderReading) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "white";
            ctx.moveTo(
                this.startPoint.x,
                this.startPoint.y
            );
            ctx.lineTo(
                this.borderReading.x,
                this.borderReading.y
            );
            ctx.arc(this.borderReading.x, this.borderReading.y, 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.globalAlpha = Math.min(1, Math.max(0.1, 1 - distance(this.startPoint, this.borderReading) / this.rayLength));
            ctx.lineWidth = 4;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.startPoint.x,
                this.startPoint.y
            );
            ctx.lineTo(
                this.borderReading.x,
                this.borderReading.y
            );
            ctx.arc(this.borderReading.x, this.borderReading.y, 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

class MultiSensorRay extends RoadSensorRay {
    constructor(startPoint, angle, rayLength = 200) {
        super(startPoint, angle, rayLength);
        this.stopSignReading = null;
        this.trafficLightReading = null;
        this.crossingSignReading = null;
        this.parkingSignReading = null;
        this.yeildSignReading = null;
        this.targetSignReading = null;
    }

    #intersectionForOneSidedMarkings(markings) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        let closestTouch = null;
        for (const marking of markings) {
            const mainTouch = getIntersection(
                this.startPoint,
                this.endPoint,
                marking.mainBorder.p1,
                marking.mainBorder.p2
            );
            const otherTouch = getIntersection(
                this.startPoint,
                this.endPoint,
                marking.otherBorder.p1,
                marking.otherBorder.p2
            );
            if (mainTouch) {
                if (!otherTouch || (mainTouch.offset < otherTouch.offset)) {
                    if (mainTouch.offset < minOffset) {
                        minOffset = mainTouch.offset;
                        closestTouch = mainTouch;
                    }
                }
            }
        }
        return closestTouch;
    }

    #intersectionForBothSidedMarkings(markings) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        let closestTouch = null;
        for (const marking of markings) {
            for (const border of marking.borders) {
                const touch = getIntersection(
                    this.startPoint,
                    this.endPoint,
                    border.p1,
                    border.p2
                );
                if (touch && touch.offset < minOffset) {
                    minOffset = touch.offset;
                    closestTouch = touch;
                }
            }
        }
        return closestTouch;
    }

    #intersectionForTargetMarking(targetMarking) {
        let maxOffset = Number.MIN_SAFE_INTEGER;
        let farthestTouch = null;
        if (targetMarking) {
            for (const border of targetMarking.borders) {
                const touch = getIntersection(
                    this.startPoint,
                    this.endPoint,
                    border.p1,
                    border.p2
                );
                if (!touch) {
                    // It means sensor is not yet reaching one of the border
                    return null;
                }
                if (touch && touch.offset > maxOffset) {
                    maxOffset = touch.offset;
                    farthestTouch = touch;
                }
            }
        }
        return farthestTouch;
    }

    #drawReadingsForMarkings(ctx, markingReading, color) {
        if (!markingReading) {
            return;
        }

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        ctx.moveTo(
            this.startPoint.x,
            this.startPoint.y
        );
        ctx.lineTo(
            markingReading.x,
            markingReading.y
        );
        ctx.arc(markingReading.x, markingReading.y, 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, Math.max(0.1, 1 - distance(this.startPoint, markingReading) / this.rayLength));
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.moveTo(
            this.startPoint.x,
            this.startPoint.y
        );
        ctx.lineTo(
            markingReading.x,
            markingReading.y
        );
        ctx.arc(markingReading.x, markingReading.y, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    detectMarkings(markings) {
        this.stopSignReading = this.#intersectionForOneSidedMarkings(
            markings.filter(m => m instanceof StopMarking)
        );
        this.trafficLightReading = this.#intersectionForOneSidedMarkings(
            markings.filter(m => (m instanceof TrafficLightMarking) && (m.state !== "green"))
        );
        this.yeildSignReading = this.#intersectionForOneSidedMarkings(
            markings.filter(m => m instanceof YieldMarking)
        );
        this.crossingSignReading = this.#intersectionForBothSidedMarkings(
            markings.filter(m => (m instanceof CrossingMarking) && (m.pedCount > 0))
        );
        this.parkingSignReading = this.#intersectionForBothSidedMarkings(
            markings.filter(m => m instanceof ParkingMarking)
        );
        this.targetSignReading = this.#intersectionForTargetMarking(
            markings.find(m => m instanceof TargetMarking)
        );
    }

    draw(ctx) {
        super.draw(ctx);
        this.#drawReadingsForMarkings(ctx, this.parkingSignReading, "#FF5733"); // Vivid Orange
        this.#drawReadingsForMarkings(ctx, this.trafficLightReading, "#33FF57"); // Bright Green
        this.#drawReadingsForMarkings(ctx, this.crossingSignReading, "#3357FF"); // Deep Blue
        this.#drawReadingsForMarkings(ctx, this.yeildSignReading, "#FFD433"); // Sunny Yellow
        this.#drawReadingsForMarkings(ctx, this.stopSignReading, "#8E33FF"); // Vibrant Purple
        this.#drawReadingsForMarkings(ctx, this.targetSignReading, "#FF33A8"); // Bold Pink
    }

}

class Sensor {
    constructor() {
        this.frontRay = null;
        this.leftRay = null;
        this.rightRay = null;
    }

    #castRays(origin, baseAngle) {
        this.leftRay = new RoadSensorRay(origin, baseAngle - Math.PI / 4);
        this.frontRay = new MultiSensorRay(origin, baseAngle);
        this.rightRay = new RoadSensorRay(origin, baseAngle + Math.PI / 4);
    }

    getReadings() {
        return {
            frontReading: this.frontRay.borderReading ? 1 - this.frontRay.borderReading.offset : 0,
            leftReading: this.leftRay.borderReading ? 1 - this.leftRay.borderReading.offset : 0,
            rightReading: this.rightRay.borderReading ? 1 - this.rightRay.borderReading.offset : 0,
            stopSignReading: this.frontRay.stopSignReading ? 1 - this.frontRay.stopSignReading.offset : 0,
            trafficLightReading: this.frontRay.trafficLightReading ? 1 - this.frontRay.trafficLightReading.offset : 0,
            yeildSignReading: this.frontRay.yeildSignReading ? 1 - this.frontRay.yeildSignReading.offset : 0,
            crossingSignReading: this.frontRay.crossingSignReading ? 1 - this.frontRay.crossingSignReading.offset : 0,
            parkingSignReading: this.frontRay.parkingSignReading ? 1 - this.frontRay.parkingSignReading.offset : 0,
            targetSignReading: this.frontRay.targetSignReading ? 1 - this.frontRay.targetSignReading.offset : 0,
        };
    }

    update(origin, baseAngle, pathBorders, roadDividers, markings) {
        this.#castRays(origin, baseAngle);
        this.frontRay.detectRoadBorders(pathBorders, roadDividers);
        this.frontRay.detectMarkings(markings);
        this.leftRay.detectRoadBorders(pathBorders, roadDividers);
        this.rightRay.detectRoadBorders(pathBorders, roadDividers);
    }

    draw(ctx) {
        if (!this.frontRay || !this.leftRay || !this.rightRay) {
            return;
        }
        this.frontRay.draw(ctx);
        this.leftRay.draw(ctx);
        this.rightRay.draw(ctx);
    }
}