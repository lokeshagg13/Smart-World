class SensorRay {
    constructor(startPoint, angle, rayLength = 200) {
        this.startPoint = startPoint;
        this.rayLength = rayLength;
        this.endPoint = new Point(
            startPoint.x + Math.sin(angle) * rayLength,
            startPoint.y - Math.cos(angle) * rayLength
        );

        this.borderReading = null;
        this.dividerReading = null;
        this.markingReading = null;
        this.detectedObject = null;
    }

    detectRoadBorders(roadBorders) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        for (const roadBorder of roadBorders) {
            const touch = getIntersection(
                this.startPoint,
                this.endPoint,
                roadBorder.p1,
                roadBorder.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                this.borderReading = touch;
            }
        }
    }

    detectRoadDividers(roadDividers) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        for (const roadDivider of roadDividers) {
            const touch = getIntersection(
                this.startPoint,
                this.endPoint,
                roadDivider.p1,
                roadDivider.p2
            );
            if (touch && touch.offset < minOffset) {
                minOffset = touch.offset;
                this.dividerReading = touch;
            }
        }
    }

    detectMarkings(markings) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        for (const marking of markings) {
            if (marking instanceof StopMarking ||
                (marking instanceof TrafficLightMarking && marking.state !== "green") ||
                marking instanceof YieldMarking
            ) {
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
                            this.markingReading = mainTouch;
                            this.detectedObject = marking.type;
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
                        this.startPoint,
                        this.endPoint,
                        border.p1,
                        border.p2
                    );
                    if (touch && touch.offset < minOffset) {
                        minOffset = touch.offset;
                        this.markingReading = touch;
                        this.detectedObject = marking.type;
                    }
                }
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

        if (this.markingReading) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "white";
            ctx.moveTo(
                this.startPoint.x,
                this.startPoint.y
            );
            ctx.lineTo(
                this.markingReading.x,
                this.markingReading.y
            );
            ctx.arc(this.markingReading.x, this.markingReading.y, 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.globalAlpha = Math.min(1, Math.max(0.1, 1 - distance(this.startPoint, this.markingReading) / this.rayLength));
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            ctx.moveTo(
                this.startPoint.x,
                this.startPoint.y
            );
            ctx.lineTo(
                this.markingReading.x,
                this.markingReading.y
            );
            ctx.arc(this.markingReading.x, this.markingReading.y, 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

    }
}

class Sensor {
    constructor() {
        this.fwdRay = null;
        this.leftRay = null;
        this.rightRay = null;
    }

    #castRays(origin, baseAngle) {
        this.leftRay = new SensorRay(origin, baseAngle - Math.PI/4);
        this.fwdRay = new SensorRay(origin, baseAngle);
        this.rightRay = new SensorRay(origin, baseAngle + Math.PI/4);
    }

    update(origin, baseAngle, roadBorders, roadDividers, markings) {
        this.#castRays(origin, baseAngle);
        this.fwdRay.detectRoadBorders(roadBorders);
        this.fwdRay.detectMarkings(markings);
        this.leftRay.detectRoadBorders(roadBorders);
        this.rightRay.detectRoadBorders(roadBorders);
    }

    draw(ctx) {
        if (!this.fwdRay || !this.leftRay || !this.rightRay) {
            return;
        }
        this.fwdRay.draw(ctx);
        this.leftRay.draw(ctx);
        this.rightRay.draw(ctx);
    }
}