class Viewport {
    constructor(canvas, zoom = 1, offset = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.zoom = zoom;
        this.zoomRange = [1, 5];
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        this.offset = offset ? offset : scale(this.center, -1);

        this.drag = {
            start: new Point(0, 0),
            end: new Point(0, 0),
            offset: new Point(0, 0),
            active: false
        };

        this.pinch = {
            active: false,
            initialDistance: 0,
            initialZoom: zoom
        };

        this.#addEventListeners();
    }

    reset() {
        this.ctx.restore();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }

    getCurrentMousePoint(ev, subtractDragOffset = false) {
        const p = new Point(
            (ev.offsetX - this.center.x) * this.zoom - this.offset.x,
            (ev.offsetY - this.center.y) * this.zoom - this.offset.y
        );
        return subtractDragOffset ? subtract(p, this.drag.offset) : p;
    }

    getCurrentTouchPoint(ev, subtractDragOffset = false) {
        const rect = this.canvas.getBoundingClientRect();
        const p = new Point(
            (ev.touches[0].clientX - rect.left - this.center.x) * this.zoom - this.offset.x,
            (ev.touches[0].clientY - rect.top - this.center.y) * this.zoom - this.offset.y
        );
        return subtractDragOffset ? subtract(p, this.drag.offset) : p;
    }

    getOffset() {
        return add(this.offset, this.drag.offset);
    }

    setOffset(point) {
        if (point instanceof Point) {
            this.offset = scale(point, -1);
        }
    }

    setCustomZoom(zoomVal) {
        this.zoom = Math.max(this.zoomRange[0], Math.min(this.zoomRange[1], zoomVal));
    }

    setMaxZoom() {
        this.zoom = this.zoomRange[1];
    }

    getScreenRadius() {
        const factor = normalizeValue(this.zoom, this.zoomRange[0], this.zoomRange[1], 0.6, 2.5);
        return 2 * this.canvas.width * factor;
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousewheel", this.#handleMouseWheel.bind(this));
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
        this.canvas.addEventListener("touchstart", this.#handleTouchStart.bind(this));
        this.canvas.addEventListener("touchmove", this.#handleTouchMove.bind(this));
        this.canvas.addEventListener("touchend", this.#handleTouchEnd.bind(this));
    }

    #handleMouseDown(ev) {
        if (ev.button == 1) {
            this.drag.start = this.getCurrentMousePoint(ev);
            this.drag.active = true;
        }
    }

    #handleMouseMove(ev) {
        if (this.drag.active) {
            this.drag.end = this.getCurrentMousePoint(ev);
            this.drag.offset = subtract(this.drag.end, this.drag.start);
        }
    }

    #handleMouseUp(ev) {
        if (this.drag.active) {
            this.offset = add(this.offset, this.drag.offset);
            this.drag = {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false
            };
        }
    }

    #handleMouseWheel(ev) {
        // sign() gives +1 for positive number and -1 for negative number
        const dir = Math.sign(ev.deltaY);
        const step = 0.1;
        this.zoom += dir * step;
        this.zoom = Math.max(this.zoomRange[0], Math.min(this.zoomRange[1], this.zoom));
    }

    #handleTouchStart(ev) {
        if (ev.touches.length === 2) {
            this.pinch.initialDistance = this.#getTouchDistance(ev.touches);
            this.pinch.initialZoom = this.zoom;
            this.pinch.active = true;

            this.drag.start = this.#getTouchMidPoint(ev.touches);
            this.drag.active = true;
        }
    }

    #handleTouchMove(ev) {
        if (this.pinch.active && ev.touches.length === 2) {
            ev.preventDefault();
            const newDistance = this.#getTouchDistance(ev.touches);
            const zoomFactor = this.pinch.initialDistance / newDistance;
            this.setCustomZoom(this.pinch.initialZoom * zoomFactor);
        }

        if (this.drag.active && ev.touches.length === 2) {
            ev.preventDefault()
            this.drag.end = this.#getTouchMidPoint(ev.touches);
            this.drag.offset = subtract(this.drag.end, this.drag.start);
        }
    }

    #handleTouchEnd(ev) {
        if (ev.touches.length < 2) {
            if (this.pinch.active) {
                this.pinch.active = false;
            }

            if (this.drag.active) {
                this.offset = add(this.offset, this.drag.offset);
                this.drag = {
                    start: new Point(0, 0),
                    end: new Point(0, 0),
                    offset: new Point(0, 0),
                    active: false
                };
            }
        }
    }

    #getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    #getTouchMidPoint(touches) {
        return average(
            new Point(
                touches[0].clientX,
                touches[0].clientY
            ),
            new Point(
                touches[1].clientX,
                touches[1].clientY
            )
        );
    }
}
