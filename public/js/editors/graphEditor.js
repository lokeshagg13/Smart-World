class GraphEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.world = world;

        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.selectedPoint = null;
        this.nearestPoint = null;
        this.dragging = false;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.selectedPoint = null;
        this.nearestPoint = null;
    }

    #addEventListeners() {
        // Binding is required here so that the 'this' within the function body refers 
        // to the GraphEditor instance and not the Event instance.
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundMouseUp = () => this.dragging = false;
        this.boundTouchStart = this.#handleTouchStart.bind(this);
        this.boundTouchMove = this.#handleTouchMove.bind(this);
        this.boundContextMenu = (ev) => ev.preventDefault();

        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("mouseup", this.boundMouseUp);
        this.canvas.addEventListener("touchstart", this.boundTouchStart);
        this.canvas.addEventListener("touchmove", this.boundTouchMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("mouseup", this.boundMouseUp);
        this.canvas.removeEventListener("touchstart", this.boundTouchStart);
        this.canvas.removeEventListener("touchmove", this.boundTouchMove);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseDown(ev) {
        if (ev.button == 2) {  // Right click
            if (this.selectedPoint) {
                this.selectedPoint = null;
            }
            else if (this.nearestPoint) {
                this.#removePoint(this.nearestPoint)
            }
        }
        if (ev.button == 0) {   // Left click
            // If clicked on an existing point
            if (this.nearestPoint) {
                this.#select(this.nearestPoint);
                this.dragging = true;
                return
            }
            // Else adding a new point to the graph and selecting it
            if (this.hoveredPoint) {
                this.world.graph.addPoint(this.hoveredPoint);
                this.#select(this.hoveredPoint);
                this.nearestPoint = this.hoveredPoint;
            }
        }
    }

    #handleMouseMove(ev) {
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
        this.nearestPoint = Graph.getNearestPoint(this.hoveredPoint, this.world.graph.points, 24 * this.viewport.zoom);
        if (this.dragging) {
            this.selectedPoint.x = this.hoveredPoint.x;
            this.selectedPoint.y = this.hoveredPoint.y;
        }
    }

    #handleTouchStart(ev) {
        if (ev.touches.length === 2) {
            if (this.selectedPoint) {
                this.selectedPoint = null;
            }
            else if (this.nearestPoint) {
                this.#removePoint(this.nearestPoint)
            }
        }
    }

    #handleTouchMove(ev) {
        if (ev.touches.length === 1) {
            ev.preventDefault();
            if (this.selectedPoint) {
                this.hoveredPoint = this.viewport.getCurrentTouchPoint(ev, true);
                this.selectedPoint.x = this.hoveredPoint.x;
                this.selectedPoint.y = this.hoveredPoint.y;
            }
        }
    }

    #select(point) {
        if (this.selectedPoint) {
            this.world.graph.tryAddSegment(new Segment(this.selectedPoint, point));
        }
        this.selectedPoint = point;
    }

    // This method is made separately since the point is still visible after it is removed
    // as the selectedPoint and nearestPoint are still not set as null
    #removePoint(point) {
        this.world.graph.removePoint(point);
        this.nearestPoint = null;
        if (this.selectedPoint == point) {
            this.selectedPoint = null;
        }
    }

    dispose() {
        this.world.dispose();
        this.hoveredPoint = null;
        this.selectedPoint = null;
        this.nearestPoint = null;
        this.dragging = false;
    }

    display() {
        this.world.graph.draw(this.ctx);
        if (this.nearestPoint) {
            this.nearestPoint.draw(this.ctx, { innerFill: true, innerFillColor: "yellow" })
        }
        if (this.selectedPoint) {
            const intent = this.nearestPoint ? this.nearestPoint : this.hoveredPoint;
            if (!this.nearestPoint) {
                new Point(intent.x, intent.y).draw(this.ctx, { color: "rgba(0,0,0,0.5)" });
            }
            new Segment(this.selectedPoint, intent).draw(this.ctx, { dash: [3, 3] });
            this.selectedPoint.draw(this.ctx, { outline: true });
        }
    }
}