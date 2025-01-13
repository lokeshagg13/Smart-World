class Sensor {
    constructor(car, rayCount = 5, rayLength = 150, raySpread = Math.PI / 2) {
        this.car = car;
        this.rayCount = rayCount;
        this.rayLength = rayLength;
        this.raySpread = raySpread;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, roadDividers) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    roadDividers
                )
            );
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                (this.rayCount == 1) ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            const startPoint = this.car.center;
            const endPoint = new Point(
                startPoint.x + Math.sin(rayAngle) * this.rayLength,
                startPoint.y - Math.cos(rayAngle) * this.rayLength
            );
            this.rays.push(new Segment(startPoint, endPoint));
        }
    }

    #getReading(ray, roadBorders, roadDividers) {
        const touches = []
        for (const roadBorder of roadBorders) {
            const touch = getIntersection(
                ray.p1,
                ray.p2,
                roadBorder.p1,
                roadBorder.p2
            );
            if (touch) {
                touches.push(touch)
            }
        }

        for (const roadDivider of roadDividers) {
            const touch = getIntersection(
                ray.p1,
                ray.p2,
                roadDivider.p1,
                roadDivider.p2
            );
            if (touch) {
                touches.push(touch)
            }
        }

        // Get the touch out of all touches which has the least offset
        if (touches.length === 0) {
            return null;
        } else {
            const offsets = touches.map((t) => t.offset);
            const minOffset = Math.min(...offsets);
            return touches.find((t) => t.offset === minOffset);
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