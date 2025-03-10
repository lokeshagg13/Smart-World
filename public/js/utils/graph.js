class Graph {
    constructor(points = [], segments = []) {
        this.points = points;
        this.segments = segments;
    }

    static load(info) {
        const points = info.points.map((p) => new Point(p.x, p.y));
        const segments = info.segments.map((s) => new Segment(
            points.find((p) => p.equals(s.p1)),
            points.find((p) => p.equals(s.p2)),
            s.oneWay
        ));
        return new Graph(points, segments);
    }

    static getNearestPoint(loc, points, threshold = Number.MAX_SAFE_INTEGER) {
        let minDist = Number.MAX_SAFE_INTEGER;
        let nearestPoint = null;
        for (const point of points) {
            const dist = distance(point, loc);
            if (dist < minDist && dist < threshold) {
                minDist = dist;
                nearestPoint = point;
            }
        }
        return nearestPoint;
    }

    static getNearestSegment(loc, segments, threshold = Number.MAX_SAFE_INTEGER) {
        let minDist = Number.MAX_SAFE_INTEGER;
        let nearestSegment = null;
        for (const segment of segments) {
            const dist = segment.distanceToPoint(loc);
            if (dist < minDist && dist < threshold) {
                minDist = dist;
                nearestSegment = segment;
            }
        }
        return nearestSegment;
    }

    static projectPointOnNearestSegment(point, segments) {
        const nearestSegment = Graph.getNearestSegment(point, segments);
        let projectedPoint = nearestSegment.projectPoint(point);
        if (projectedPoint) {
            projectedPoint = projectedPoint.point;
        }
        return { projectedPoint, nearestSegment };
    }

    hash() {
        return JSON.stringify(this);
    }

    addPoint(point) {
        this.points.push(point)
    }

    containsPoint(point) {
        return this.points.find((p) => p.equals(point));
    }

    tryAddPoint(point) {
        if (!this.containsPoint(point)) {
            this.addPoint(point)
            return true
        }
        return false
    }

    removePoint(point) {
        const associatedSegments = this.getSegmentsWithPoint(point)
        for (const segment of associatedSegments) {
            this.removeSegment(segment)
        }
        this.points.splice(this.points.indexOf(point), 1)
    }

    addSegment(segment) {
        this.segments.push(segment)
    }

    containsSegment(segment) {
        return this.segments.find((s) => s.equals(segment));
    }

    tryAddSegment(segment) {
        // Add segment only if the points of the segment are different and 
        // the segment does not exist already. 
        if (!segment.p1.equals(segment.p2) && !this.containsSegment(segment)) {
            this.addSegment(segment)
            return true
        }
        return false
    }

    removeSegment(segment) {
        this.segments.splice(this.segments.indexOf(segment), 1);
    }

    interpolate(point) {
        const { projectedPoint, nearestSegment } = Graph.projectPointOnNearestSegment(point, this.segments);
        this.tryAddPoint(projectedPoint);
        this.tryAddSegment(new Segment(nearestSegment.p1, projectedPoint));
        this.tryAddSegment(new Segment(projectedPoint, nearestSegment.p2));
        return { projectedPoint, nearestSegment };
    }

    getSegmentsWithPoint(point) {
        const segments = [];
        for (const segment of this.segments) {
            if (segment.includes(point)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    getSegmentsLeavingFromPoint(point) {
        /*
        It takes into consideration the one way segments and involve only 
        those segments which leave from a particular point in order to get 
        the correct flow of traffic and not go on the wrong side in the one
        way roads.
        */
        const segments = [];
        for (const segment of this.segments) {
            if (segment.oneWay) {
                if (segment.p1.equals(point)) {
                    segments.push(segment);
                }
            } else if (segment.includes(point)) {
                segments.push(segment);
            }
        }
        return segments;
    }

    getShortestPath(carCenter, targetCenter) {
        // Add points to graph based on car and target center
        const { projectedPoint: startPoint, nearestSegment: startSegment } = this.interpolate(carCenter);
        const { projectedPoint: endPoint, nearestSegment: endSegment } = this.interpolate(targetCenter);

        // If start point and end point lie on same segment
        if (startSegment.equals(endSegment)) {
            this.tryAddSegment(new Segment(startPoint, endPoint));
        }

        // 'distances' map stores the distance of a point from the startPoint
        const distances = new Map();
        // 'previous' map stores the previous point in the shortest path 
        const previous = new Map();
        // 'queue' is a priority queue which stores points in the increasing 
        // order of their distances from the startPoint.
        const queue = [];

        this.points.forEach(point => {
            distances.set(point, Number.MAX_SAFE_INTEGER);
            previous.set(point, null);
        })

        distances.set(startPoint, 0);
        queue.push({ point: startPoint, distance: 0 });

        while (queue.length > 0) {
            // Sort queue by distance and pop the closest point
            queue.sort((a, b) => a.distance - b.distance);
            const { point: currentPoint } = queue.shift();

            // Reached target point
            if (currentPoint.equals(endPoint)) {
                break;
            }

            const segments = this.getSegmentsLeavingFromPoint(currentPoint);
            for (const segment of segments) {
                const neighborPoint = segment.p1.equals(currentPoint) ? segment.p2 : segment.p1;
                if (neighborPoint) {
                    const altDistance = distances.get(currentPoint) + segment.length();
                    if (altDistance < distances.get(neighborPoint)) {
                        distances.set(neighborPoint, altDistance);
                        previous.set(neighborPoint, currentPoint);
                        queue.push({ point: neighborPoint, distance: altDistance });
                    }
                }
            }
        }

        // Backtracking
        const path = [];
        let currentPoint = endPoint;
        while (currentPoint) {
            path.unshift(currentPoint);
            currentPoint = previous.get(currentPoint);
        }

        // Cleanup
        this.removePoint(startPoint);
        this.removePoint(endPoint);


        return path.length >= 2 ? path : null;
    }

    getCenter() {
        const nodes = this.points;
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y));
        return new Point((minX + maxX) / 2, (minY + maxY) / 2);
    }

    dispose() {
        this.points.length = 0
        this.segments.length = 0
    }

    draw(ctx) {
        for (const segment of this.segments) {
            segment.draw(ctx);
        }

        for (const point of this.points) {
            point.draw(ctx);
        }
    }
}