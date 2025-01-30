class Segment {
    constructor(p1, p2, oneWay = false) {
        this.p1 = p1;
        this.p2 = p2;
        this.oneWay = oneWay;
    }

    length() {
        return distance(this.p1, this.p2);
    }

    directionVector() {
        return normalize(subtract(this.p2, this.p1));
    }

    equals(segment) {
        return this.includes(segment.p1) && this.includes(segment.p2);
    }

    includes(point) {
        // returns true if a segment includes a point
        return this.p1.equals(point) || this.p2.equals(point);
    }

    angle(segment) {
        let dirSegment1 = this.directionVector();
        let dirSegment2 = segment.directionVector();
        if (this.p1.equals(segment.p2)) {
            dirSegment1 = scale(dirSegment1, -1);
        } else if (this.p2.equals(segment.p1)) {
            dirSegment2 = scale(dirSegment2, -1);
        }
        return Math.acos(dot(dirSegment1, dirSegment2) / (magnitude(dirSegment1) * magnitude(dirSegment2)));
    }

    distanceToPoint(point) {
        const proj = this.projectPoint(point);
        if (proj.offset > 0 && proj.offset < 1) {
            return distance(point, proj.point);
        }
        const distToP1 = distance(point, this.p1);
        const distToP2 = distance(point, this.p2);
        return Math.min(distToP1, distToP2);
    }

    projectPoint(point) {
        const a = subtract(point, this.p1);
        const b = subtract(this.p2, this.p1);
        const normB = normalize(b);
        const scaler = dot(a, normB);
        const proj = {
            point: add(this.p1, scale(normB, scaler)),
            offset: scaler / magnitude(b)
        }
        return proj
    }

    containsPoint(p) {
        const { x: x1, y: y1 } = this.p1;
        const { x: x2, y: y2 } = this.p2;
        const { x, y } = p;

        // Check collinearity using cross-product
        const crossProduct = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
        if (Math.abs(crossProduct) > 1e-10) {
            return false;
        }

        // Check if the point lies within the bounding box
        const withinXBounds = Math.min(x1, x2) <= x && x <= Math.max(x1, x2);
        const withinYBounds = Math.min(y1, y2) <= y && y <= Math.max(y1, y2);

        return withinXBounds && withinYBounds;
    }

    draw(ctx, { width = 2, color = "black", dash = [], cap = "butt" } = {}) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = cap;
        if (this.oneWay) {
            dash = [4, 4];
        }
        ctx.setLineDash(dash);
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}