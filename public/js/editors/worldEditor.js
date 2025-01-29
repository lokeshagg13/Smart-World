class WorldEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
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
        if (ev.button == 2) { // right click
            for (let i = 0; i < this.world.markings.length; i++) {
                const marking = this.world.markings[i];
                if (
                    (
                        !(marking instanceof StartMarking) &&
                        marking.polygon.containsPoint(this.hoveredPoint)
                    ) ||
                    (
                        marking instanceof StartMarking &&
                        marking.car.polygon &&
                        marking.car.polygon.containsPoint(this.hoveredPoint)
                    )
                ) {
                    let indicesToRemove = [i]
                    // Remove associated target marking
                    if (marking instanceof StartMarking && marking.car.target) {
                        this.world.markings.forEach((m, index) => {
                            if (m === marking.car.target) {
                                indicesToRemove.push(index);
                            }
                        });
                    }
                    this.world.markings = this.world.markings.filter(
                        (_, idx) => !indicesToRemove.includes(idx)
                    );
                    return;
                }
            }
        }
    }

    #handleMouseMove(ev) {
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
    }

    display() { }
}