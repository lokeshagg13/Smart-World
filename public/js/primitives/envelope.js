class Envelope {
    constructor(skeleton, width, roundness = 1) {
        if (skeleton) {
            this.skeleton = skeleton;
            this.polygon = this.#generatePolygon(width, roundness);
        }
    }

    static load(info) {
        const envelope = new Envelope();
        const p1 = new Point(info.skeleton.p1.x, info.skeleton.p1.y);
        const p2 = new Point(info.skeleton.p2.x, info.skeleton.p2.y);
        envelope.skeleton = new Segment(p1, p2);
        envelope.polygon = Polygon.load(info.polygon);
        return envelope;
    }

    #generatePolygon(width, roundness) {
        const { p1, p2 } = this.skeleton;

        const radius = width / 2;
        const alpha = angle(subtract(p1, p2));
        const alpha_ccw = alpha - Math.PI / 2;
        const alpha_cw = alpha + Math.PI / 2;
        const points = [];
        const step = Math.PI / Math.max(1, roundness);
        const eps = step / 2
        for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
            points.push(translate(p1, i, radius));
        }
        for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
            points.push(translate(p2, Math.PI + i, radius));
        }
        return new Polygon(points)
    }

    draw(ctx, options) {
        this.polygon.draw(ctx, options);
    }
}