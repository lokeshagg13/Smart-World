class MarkingEditor {
    static types = {
        "LANESPREAD": 0,
        "ROADSPREAD": 1
    }

    constructor(viewport, world, type = MarkingEditor.types.LANESPREAD) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.intent = null;

        this.type = type;
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
        const targetSegments = this.type === MarkingEditor.types.ROADSPREAD ? this.world.graph.segments : this.world.laneGuides;
        const nearestSegment = Graph.getNearestSegment(
            this.hoveredPoint,
            targetSegments,
            12 * this.viewport.zoom
        );
        if (nearestSegment) {
            const projection = nearestSegment.projectPoint(this.hoveredPoint);
            if (projection.offset >= 0 && projection.offset <= 1) {
                this.intent = this.createMarking(
                    projection.point,
                    nearestSegment.directionVector()
                );

                // Check for overlapping markings
                if (
                    !(this.intent instanceof StartMarking) &&
                    !(this.intent instanceof TargetMarking)
                ) {
                    const overlappingMarking = this.world.markings.find(
                        (m) => m.polygon.intersectsPolygon(this.intent.polygon)
                    );
                    if (overlappingMarking) {
                        this.intent = null;
                    }
                }
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    #addMarkingToWorld() {
        if (this.intent instanceof TargetMarking) {
            hideAllPopovers();
            if (this.world.selectedCar) {
                // Removal of any unused targets
                if (this.world.selectedCar.target) {
                    let targetInUse = false;
                    for (const marking of this.world.markings) {
                        if (
                            marking instanceof StartMarking &&
                            marking.car !== this.world.selectedCar &&
                            marking.car.target === this.world.selectedCar.target
                        ) {
                            targetInUse = true;
                        }
                    }
                    if (!targetInUse) {
                        this.world.markings = this.world.markings.filter(m => m !== this.world.selectedCar.target);
                    }
                }
                // Update the target of the current car being followed
                this.world.selectedCar.target = this.intent;
                this.world.selectedCar.path = this.world.graph.getShortestPath(
                    this.world.selectedCar.center,
                    this.intent.center
                );
                this.world.selectedCar.pathBorders = this.world.generateCarPath(
                    this.world.selectedCar.center,
                    this.world.selectedCar.angle,
                    this.world.selectedCar.path
                );
                this.world.markings.push(this.intent);
                setMode('world');
            } else {
                if (!this.world.markings.find(m => m instanceof StartMarking)) {
                    showMustAddCarPopover("Add the car first before adding its target");
                } else {
                    showMustAddCarPopover("Select the car first before adding/changing its target");
                }
                setMode('world');
            }
        }
        else if (this.intent instanceof StartMarking) {
            showMustAddTargetPopover();
            this.world.markings.push(this.intent);
            this.world.selectedCar = this.intent.car;
            setMode('target');
        } else {
            this.world.markings.push(this.intent);
        }
    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }

}