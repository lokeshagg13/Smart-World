class Tree {
    constructor(center, size, height = 200) {
        this.center = center;
        this.size = size;
        this.height = height;
        this.base = this.#generateTreeGreen(center, size);
    }

    static load(info) {
        return new Tree(
            new Point(
                info.center.x,
                info.center.y
            ),
            info.size,
            info.height
        );
    }
    #generateTreeGreen(point, size) {
        const points = [];
        const radius = size / 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
            // A random number which remains same for each new tree but 
            // depends on the angle, level and center of tree so that no
            // two tree look the same, no two levels of the same tree look 
            // the same and no two branches of the same level of same tree
            // look the same.
            const kindOfRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
            const noisyRadius = radius * lerp(0.5, 1, kindOfRandom);
            points.push(translate(point, a, noisyRadius));
        }
        return new Polygon(points);
    }

    draw(ctx, viewpoint) {
        const top = getFake3dPoint(this.center, viewpoint, this.height);

        const levelCount = 7;
        for (let level = 0; level < levelCount; level++) {
            const t = level / (levelCount - 1);
            const point = lerp2D(this.center, top, t);
            const greenColor = "rgb(30," + lerp(50, 200, t) + ",70)";
            const greenSize = lerp(this.size, 40, t);
            const greenPoly = this.#generateTreeGreen(point, greenSize);
            greenPoly.draw(ctx, { fill: greenColor, stroke: "rgba(0,0,0,0)" });
        }
    }
}