class SensorRay {
    constructor(startPoint, angle, rayLength = 200) {
        this.startPoint = startPoint;
        this.rayLength = rayLength;
        this.endPoint = new Point(
            startPoint.x + Math.sin(angle) * rayLength,
            startPoint.y - Math.cos(angle) * rayLength
        );
    }
}

class RoadSensorRay extends SensorRay {
    // turnLimitFactor is dependent on rayLength values, so change carefully
    constructor(startPoint, angle, rayLength = 200) {
        super(startPoint, angle, rayLength);
        this.borderReading = null;
    }

    detectRoadBorders(roadBorders, pathBorders) {
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

class CarSensorRay extends SensorRay {
    constructor(startPoint, angle, rayLength = 200) {
        super(startPoint, angle, rayLength);
        this.collisionReading = null;
    }

    detectCollisions(roadBorders, pathBorders, cars) {
        let minOffset = Number.MAX_SAFE_INTEGER;
        let closestTouch = null;
        for (const car of cars) {
            const carPolygon = car.polygon;
            if (carPolygon) {
                const touch = carPolygon.intersectsSegmentAtMinOffset(
                    new Segment(
                        this.startPoint,
                        this.endPoint
                    )
                );
                if (touch && touch.offset < minOffset) {
                    minOffset = touch.offset;
                    closestTouch = touch;
                }
            }
        }
        if (closestTouch) {
            for (const pathBorder of pathBorders) {
                const touch = getIntersection(
                    this.startPoint,
                    this.endPoint,
                    pathBorder.p1,
                    pathBorder.p2
                );
                if (touch && touch.offset < minOffset) {
                    minOffset = touch.offset;
                    closestTouch = null;
                }
            }
            for (const roadBorder of roadBorders) {
                const touch = getIntersection(
                    this.startPoint,
                    this.endPoint,
                    roadBorder.p1,
                    roadBorder.p2
                );
                if (touch && touch.offset < minOffset) {
                    minOffset = touch.offset;
                    closestTouch = null;
                }
            }
        }
        this.collisionReading = closestTouch;
    }

    draw(ctx) {
        if (!this.collisionReading) {
            return;
        }

        const offset = 1 - this.collisionReading.offset;
        const color = `rgb(${Math.round(offset * 255)}, ${Math.round((1 - offset) * 255)}, 0)`

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.moveTo(
            this.startPoint.x,
            this.startPoint.y
        );
        ctx.lineTo(
            this.collisionReading.x,
            this.collisionReading.y
        );
        ctx.arc(this.collisionReading.x, this.collisionReading.y, 2, 0, Math.PI * 2);
        ctx.stroke();
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
            markings.filter(
                m => (m instanceof TrafficLightMarking) &&
                    (m.state !== TrafficLightMarking.states.GREEN)
            )
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
        this.multiSensorRay = null;
        this.roadSensorRays = {
            left45: null,
            left90: null,
            right45: null,
            right90: null,
        }
        this.collisionSensorRays = []; // Sensor Rays for detecting collisions with cars
    }

    #castRays(origin, baseAngle) {
        this.multiSensorRay = new MultiSensorRay(origin, baseAngle);
        this.roadSensorRays.left45 = new RoadSensorRay(origin, baseAngle - Math.PI / 4);
        this.roadSensorRays.right45 = new RoadSensorRay(origin, baseAngle + Math.PI / 4);
        this.roadSensorRays.left90 = new RoadSensorRay(origin, baseAngle - Math.PI / 2);
        this.roadSensorRays.right90 = new RoadSensorRay(origin, baseAngle + Math.PI / 2);
        this.collisionSensorRays.length = 0;
        for (let i = -Math.PI / 2; i <= Math.PI / 2; i += Math.PI / 20) {
            this.collisionSensorRays.push(
                new CarSensorRay(
                    origin,
                    baseAngle + i
                )
            )
        }
    }

    getReadings() {
        const collisionReading = this.collisionSensorRays.length > 0
            ? Math.max(
                ...this.collisionSensorRays.map(
                    ray => ray.collisionReading ? 1 - ray.collisionReading.offset : 0
                )
            )
            : 0;

        return {
            frontRoadReading: this.multiSensorRay.borderReading ? 1 - this.multiSensorRay.borderReading.offset : 0,
            left45RoadReading: this.roadSensorRays.left45.borderReading ? 1 - this.roadSensorRays.left45.borderReading.offset : 0,
            right45RoadReading: this.roadSensorRays.right45.borderReading ? 1 - this.roadSensorRays.right45.borderReading.offset : 0,
            left90RoadReading: this.roadSensorRays.left90.borderReading ? 1 - this.roadSensorRays.left90.borderReading.offset : 0,
            right90RoadReading: this.roadSensorRays.right90.borderReading ? 1 - this.roadSensorRays.right90.borderReading.offset : 0,
            stopSignReading: this.multiSensorRay.stopSignReading ? 1 - this.multiSensorRay.stopSignReading.offset : 0,
            trafficLightReading: this.multiSensorRay.trafficLightReading ? 1 - this.multiSensorRay.trafficLightReading.offset : 0,
            yeildSignReading: this.multiSensorRay.yeildSignReading ? 1 - this.multiSensorRay.yeildSignReading.offset : 0,
            crossingSignReading: this.multiSensorRay.crossingSignReading ? 1 - this.multiSensorRay.crossingSignReading.offset : 0,
            parkingSignReading: this.multiSensorRay.parkingSignReading ? 1 - this.multiSensorRay.parkingSignReading.offset : 0,
            targetSignReading: this.multiSensorRay.targetSignReading ? 1 - this.multiSensorRay.targetSignReading.offset : 0,
            collisionReading: collisionReading,
        };
    }

    update(origin, baseAngle, roadBorders, pathBorders, markings, cars) {
        this.#castRays(origin, baseAngle);
        this.multiSensorRay.detectRoadBorders(roadBorders, pathBorders);
        this.multiSensorRay.detectMarkings(markings);
        this.roadSensorRays.left45.detectRoadBorders(roadBorders, pathBorders);
        this.roadSensorRays.right45.detectRoadBorders(roadBorders, pathBorders);
        this.roadSensorRays.left90.detectRoadBorders(roadBorders, pathBorders);
        this.roadSensorRays.right90.detectRoadBorders(roadBorders, pathBorders);
        this.collisionSensorRays.forEach((collisionSensorRay) => {
            collisionSensorRay.detectCollisions(roadBorders, pathBorders, cars);
        });
    }

    draw(ctx) {
        if (
            !this.multiSensorRay ||
            !this.roadSensorRays.left45 ||
            !this.roadSensorRays.right45 ||
            !this.roadSensorRays.left90 ||
            !this.roadSensorRays.right90) {
            return;
        }
        this.multiSensorRay.draw(ctx);
        this.roadSensorRays.left45.draw(ctx);
        this.roadSensorRays.right45.draw(ctx);
        this.roadSensorRays.left90.draw(ctx);
        this.roadSensorRays.right90.draw(ctx);
        this.collisionSensorRays.forEach((collisionSensorRay) => {
            if (!collisionSensorRay) return;
            collisionSensorRay.draw(ctx);
        });
    }
}