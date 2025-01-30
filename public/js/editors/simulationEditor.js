class SimulationEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.intent = null;
        this.running = false;

        this.targetMarking = null;
    }

    createMarking(type, center, directionVector) {
        if (type === "start") {
            return new StartMarking(
                center,
                directionVector,
                this.world.settings.roadWidth * 0.4,
                this.world.settings.roadWidth / 4,
                this.world.settings.isLHT,
                true
            );
        } else {
            return new TargetMarking(
                center,
                directionVector,
                this.world.settings.roadWidth,
                this.world.settings.roadWidth * 0.5,
                this.world.settings.isLHT
            );
        }
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.targetMarking = null;
        this.#removeEventListeners();
    }

    #addEventListeners() {
        // Binding is required here so that the 'this' within the function body refers 
        // to the GraphEditor instance and not the Event instance.
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundContextMenu = (ev) => ev.preventDefault();
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseDown(ev) {
        if (ev.button == 0) { // left click
            if (this.intent && !this.running) {
                if (this.intent instanceof TargetMarking) {
                    this.targetMarking = this.intent;
                }
                else {
                    if (!this.targetMarking) {
                        this.targetMarking = this.world.getRandomTargetMarking();
                    }
                    const shortestPath = this.world.graph.getShortestPath(
                        this.intent.center,
                        this.targetMarking.center
                    );
                    const shortestPathBorders = this.world.generateCarPath(
                        this.intent.center,
                        this.intent.angle,
                        shortestPath
                    );
                    for (let i = 0; i < this.world.settings.simulationNumCars; i++) {
                        const startMarking = this.createMarking(
                            "start",
                            this.intent.center,
                            this.intent.directionVector
                        );
                        startMarking.car.target = this.targetMarking;
                        startMarking.car.path = shortestPath;
                        startMarking.car.pathBorders = shortestPathBorders;
                        const bestBrain = new Brain();
                        if (i != 0) {
                            NeuralNetwork.mutate(bestBrain.network, this.world.settings.simulationDiffFactor);
                        }
                        startMarking.car.brain = bestBrain;
                        this.world.markings.push(startMarking);
                    }
                    this.running = true;
                    this.intent = null;
                }
            }
        }
    }

    #handleMouseMove(ev) {
        if (this.running) {
            return;
        }
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
        const nearestSegment = Graph.getNearestSegment(
            this.hoveredPoint,
            this.targetMarking ? this.world.laneGuides : this.world.graph.segments,
            12 * this.viewport.zoom
        );
        if (nearestSegment) {
            const projection = nearestSegment.projectPoint(this.hoveredPoint);
            if (projection.offset >= 0 && projection.offset <= 1) {
                let type = this.targetMarking ? "start" : "target";
                this.intent = this.createMarking(
                    type,
                    projection.point,
                    nearestSegment.directionVector()
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    display() {
        if (this.world.followedCar) {
            for (const segment of this.world.followedCar.pathBorders) {
                segment.draw(this.ctx, { color: "red", width: 4 });
            }
        }
        if (this.targetMarking) {
            this.targetMarking.draw(this.ctx)
        };
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}