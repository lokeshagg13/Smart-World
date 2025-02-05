class SelectEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.nearestCar = null;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.hoveredPoint = null;
        this.nearestCar = null;
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
        if (ev.button == 0) {   // Left click
            if (this.nearestCar) {
                this.world.selectedCar = this.nearestCar;
                setMode("world");
            }
        }
    }

    #handleMouseMove(ev) {
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
        const nearestStartMarking = this.world.markings.find(
            m =>
                m instanceof StartMarking &&
                m.car.polygon.containsPoint(this.hoveredPoint)
        );
        if (nearestStartMarking) {
            this.nearestCar = nearestStartMarking.car;
        } else {
            this.nearestCar = null;
        }
    }

    display() {
        const cars = this.world.markings.filter(
            m => m instanceof StartMarking
        ).map(
            m => m.car
        );

        cars.forEach(
            (car) => car.center.draw(
                this.ctx,
                {
                    size: 100 * this.viewport.zoom,
                    color: "rgba(0,0,0,0)",
                    outline: true,
                    outlineProp: 0.05,
                    outlineDash: [4, 4],
                    outlineColor: "black"
                }
            )
        );

        if (this.nearestCar) {
            this.nearestCar.center.draw(
                this.ctx,
                {
                    size: 100 * this.viewport.zoom,
                    color: "rgba(0,0,0,0)",
                    outline: false,
                    innerFill: true,
                    innerFillColor: "rgba(255, 255, 0, 0.5)"
                }
            );
            this.nearestCar.draw(this.ctx);
            this.nearestCar.target?.draw(this.ctx);
        }
    }
}