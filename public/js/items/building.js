class Building {
    constructor(basePolygon, height = 200) {
        if (basePolygon) {
            this.base = basePolygon;
            this.height = height;
        }
    }

    static load(info) {
        return new Building(Polygon.load(info.base), info.height);
    }

    draw(ctx, viewpoint) {
        const ceilingPoints = this.base.points.map((p) =>
            getFake3dPoint(p, viewpoint, this.height * 0.6)
        );
        const ceiling = new Polygon(ceilingPoints);

        const walls = [];
        for (let i = 0; i < this.base.points.length; i++) {
            const nextI = (i + 1) % this.base.points.length;
            const wall = new Polygon([
                this.base.points[i],
                this.base.points[nextI],
                ceilingPoints[nextI],
                ceilingPoints[i]
            ]);
            walls.push(wall);
        }

        // Sort the walls so that the walls far from the viewpoint
        // are drawn first and then the nearer walls to overlap them
        walls.sort(
            (wallA, wallB) =>
                wallB.distanceToPoint(viewpoint) -
                wallA.distanceToPoint(viewpoint)
        );

        const baseMidPoints = [
            average(this.base.points[0], this.base.points[1]),
            average(this.base.points[2], this.base.points[3])
        ];

        const ceilingMidPoints = baseMidPoints.map((p) =>
            getFake3dPoint(p, viewpoint, this.height)
        );

        const roofs = [
            new Polygon([
                ceiling.points[0], ceiling.points[3],
                ceilingMidPoints[1], ceilingMidPoints[0]
            ]),
            new Polygon([
                ceiling.points[2], ceiling.points[1],
                ceilingMidPoints[0], ceilingMidPoints[1]
            ])
        ];
        roofs.sort(
            (a, b) =>
                b.distanceToPoint(viewpoint) -
                a.distanceToPoint(viewpoint)
        );

        this.base.draw(ctx, { fill: "white", stroke: "rgba(0,0,0,0.2)", lineWidth: 20 });
        for (const wall of walls) {
            wall.draw(ctx, { fill: "white", stroke: "#AAA" });
        }
        ceiling.draw(ctx, { fill: "white", stroke: "white", lineWidth: 6 });
        for (const roof of roofs) {
            roof.draw(ctx, { fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round" });
        }

    }
}