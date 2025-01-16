class MarkingEditor {
    constructor(viewport, world, targetSegments) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.intent = null;

        this.targetSegments = targetSegments;
    }

    // to be overwritten by subclasses
    createMarking(center, directionVector) {
        return center;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
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
            if (this.intent) {
                this.#addMarkingToWorld();
                this.intent = null;
            }
        }
        if (ev.button == 2) { // right click
            for (let i = 0; i < this.world.markings.length; i++) {
                const polygon = this.world.markings[i].polygon;
                if (polygon.containsPoint(this.hoveredPoint)) {
                    this.world.markings.splice(i, 1);
                    return;
                }
            }
        }
    }

    #handleMouseMove(ev) {
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
                    nearestSegment.directionVector()
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    #addMarkingToWorld() {
        if (this.intent instanceof TargetMarking) {
            const currentTargetMarking = this.world.getTargetMarking();
            if (currentTargetMarking.index >= 0) {
                this.world.markings.splice(currentTargetMarking.index, 1);
            }
            for (const marking of this.world.markings) {
                if (marking instanceof StartMarking) {
                    marking.car.target = this.intent;
                    marking.car.path = this.world.graph.getShortestPath(
                        marking.car.center,
                        this.intent.center
                    );
                }
            }
        }
        if (this.intent instanceof StartMarking) {
            let currentTargetMarking = this.world.getTargetMarking();
            if (currentTargetMarking.index >= 0) {
                currentTargetMarking = currentTargetMarking.element;
                this.intent.car.target = currentTargetMarking;
                this.intent.car.path = this.world.graph.getShortestPath(
                    this.intent.car.center,
                    currentTargetMarking.center
                );
            }
        }
        this.world.markings.push(this.intent);
    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }

}