class MiniMap {
    constructor(editor, world) {
        this.editor = editor;
        this.world = world;
        this.visible = false;
        this.minimized = false;
        this.ctx = editor.canvas.getContext("2d");
    }

    load(world) {
        this.world = world;
        return this;
    }

    show() {
        this.visible = true;
        this.editor.container.style.display = "block";
        this.editor.enable();
    }

    hide() {
        this.editor.disable();
        this.editor.container.style.display = "none";
        this.visible = false;
    }

    minimize() {
        this.minimized = true;
        this.editor.container.querySelector('#maximizeMiniMapBtn').style.display = 'block';
        this.editor.container.querySelector('#maximizedMapContent').style.display = 'none';
    }

    maximize() {
        this.minimized = false;
        this.editor.container.querySelector('#maximizeMiniMapBtn').style.display = 'none';
        this.editor.container.querySelector('#maximizedMapContent').style.display = 'block';

    }

    draw(viewpoint) {
        if (this.visible && !this.minimized) {
            const { width, height } = this.editor.canvas;
            const scaler = this.editor.zoom;
            this.ctx.clearRect(0, 0, width, height);
            const scaledViewpoint = scale(viewpoint, -scaler);
            this.ctx.save();
            this.ctx.translate(
                scaledViewpoint.x + width / 2,
                scaledViewpoint.y + height / 2
            );
            this.ctx.scale(scaler, scaler);

            // Draw roads
            for (const segment of this.world.graph.segments) {
                segment.draw(this.ctx, { width: 3 / scaler, color: "white" });
            }

            // Selected which car to focus on the minimap based on world's mode
            let focusedCar = this.world.selectedCar;
            if (currentMode === "simulation") {
                focusedCar = this.world.followedCar;
            }

            // Draw Current position of car, its Target and the Path to itstarget
            if (focusedCar) {
                // Draw Path to target
                let pathSegments = [];
                const path = focusedCar.path;
                if (path.length > 0) {
                    path[0].draw(this.ctx, { size: 12.5 / scaler, color: "yellow", outline: true, outlineColor: "white" });
                    for (let i = 1; i < path.length; i++) {
                        const segment = new Segment(path[i - 1], path[i]);
                        segment.draw(this.ctx, { width: 2 / scaler, color: "cyan" });
                        pathSegments.push(segment);
                    }
                }

                // Draw Target
                const targetMarking = focusedCar.target;
                if (targetMarking) {
                    new Point(targetMarking.center.x, targetMarking.center.y)
                        .draw(this.ctx, { size: 12.5 / scaler, color: "red", outline: true, outlineColor: "black" });
                    new Point(targetMarking.center.x, targetMarking.center.y)
                        .draw(this.ctx, { size: 7.5 / scaler, color: "white", outline: true, outlineColor: "white" });
                    new Point(targetMarking.center.x, targetMarking.center.y)
                        .draw(this.ctx, { size: 2.5 / scaler, color: "red", outline: true, outlineColor: "red" });

                    // Draw Target Pointer if Target not visible on the minimap
                    const scaledTargetpoint = scale(targetMarking.center, -scaler)
                    const distanceToTarget = distance(scaledViewpoint, scaledTargetpoint);
                    if (distanceToTarget > this.ctx.canvas.width / 2) {
                        const angleToTarget = angle(subtract(scaledViewpoint, scaledTargetpoint));
                        const targetPointer = translate(viewpoint, angleToTarget, width / (2 * scaler));
                        new Arrow(targetPointer, angleToTarget, 20 / scaler, 15 / scaler)
                            .draw(this.ctx, { color: "red", width: 5 / scaler });
                    }
                }

                // Draw Current position of car
                const carProjection = Graph.projectPointOnNearestSegment(
                    focusedCar.center,
                    pathSegments.length > 0 ? pathSegments : this.world.graph.segments
                );
                if (carProjection) {
                    carProjection.projectedPoint.draw(this.ctx, { size: 12.5 / scaler, color: "blue", outline: true, outlineColor: "white" });
                } else {
                    focusedCar.center.draw(this.ctx, { size: 12.5 / scaler, color: "blue", outline: true, outlineColor: "white" });
                }
            }

            this.ctx.restore();
        }
    }
}
