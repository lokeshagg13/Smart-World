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

        this.targetSegments = world.laneGuides;
    }

    createMarking(center, directionVector) {
        return new StartMarking(
            center,
            directionVector,
            this.world.settings.roadWidth * 0.4,
            this.world.settings.roadWidth / 4,
            this.world.settings.isLHT,
            true
        );
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
                this.targetMarking = this.world.getRandomTargetMarking();
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
                        this.intent.center,
                        this.intent.directionVector,
                        this.world.settings.isLHT
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

    #handleMouseMove(ev) {
        if (this.running) {
            return;
        }
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
        const nearestSegment = Graph.getNearestSegment(
            this.hoveredPoint,
            this.targetSegments,
            12 * this.viewport.zoom
        );
        if (nearestSegment) {
            const projection = nearestSegment.projectPoint(this.hoveredPoint);
            if (projection.offset >= 0 && projection.offset <= 1) {
                this.intent = this.createMarking(
                    projection.point,
                    nearestSegment.directionVector(),
                    this.world.settings.isLHT
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    display() {
        if (this.targetMarking) {
            this.targetMarking.draw(this.ctx)
        };
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}