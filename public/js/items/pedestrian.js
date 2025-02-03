class Pedestrian {
    static states = {
        "CREATED": 0,
        "MOVING": 1,
        "REACHED": 2
    }

    constructor(crossing, maxSpeed = 0.1) {
        this.crossing = crossing;
        this.maxSpeed = maxSpeed;

        this.speed = 0;
        this.time = 0;
        this.state = Pedestrian.states.CREATED;

        const randomSrcAndDest = this.#calculateSourceAndDestination();
        this.center = randomSrcAndDest.srcPoint;
        this.srcPoint = randomSrcAndDest.srcPoint;
        this.destPoint = randomSrcAndDest.destPoint;
        this.pathSegment = new Segment(this.srcPoint, this.destPoint);
    }

    #calculateSourceAndDestination() {
        const terminalPoints = [
            [
                lerp2D(this.crossing.borders[0].p2, this.crossing.borders[1].p1, 0.25),
                lerp2D(this.crossing.borders[0].p1, this.crossing.borders[1].p2, 0.25)
            ],
            [
                lerp2D(this.crossing.borders[0].p1, this.crossing.borders[1].p2, 0.75),
                lerp2D(this.crossing.borders[0].p2, this.crossing.borders[1].p1, 0.75),
            ]
        ];

        const randomIndex = Math.floor(Math.random() * 2);
        // In LHT mode, passengers cross the crossing from left side to maintain uniformity.
        return {
            srcPoint: terminalPoints[randomIndex][world.settings.isLHT ? 0 : 1],
            destPoint: terminalPoints[randomIndex][world.settings.isLHT ? 1 : 0]
        };
    }

    #move() {
        if (this.state === Pedestrian.states.CREATED) {
            this.state = Pedestrian.states.MOVING;
            this.crossing.pedCount += 1;
        }

        this.speed += 0.005;

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        if (this.speed !== 0) {
            this.center = translate(this.center, angle(this.pathSegment.directionVector()), this.speed);
        }
    }

    update() {
        // Check for any possible car collision



        // Pedestrian time calculation logic
        // if (f % 60 === 0) {
        //     this.time += 1
        // }

        // Movement related 
        this.#move();
        if (!this.crossing.polygon.containsPoint(this.center)) {
            this.state = Pedestrian.states.REACHED;
            this.crossing.pedCount = Math.max(0, this.crossing.pedCount - 1);
            // console.log('Time taken by pedestrian to cross the road: ', this.time);
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(
            this.center.x,
            this.center.y,
            5, // Radius of the pedestrian circle
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "#000"; // Pedestrian color
        ctx.fill();
        ctx.strokeStyle = "#FFF"; // Outline color
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}