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

            // Draw target
            let targetMarking = this.world.getTargetMarking();
            if (targetMarking.index >= 0) {
                targetMarking = targetMarking.element;
                new Point(targetMarking.center.x, targetMarking.center.y)
                    .draw(this.ctx, { size: 12.5 / scaler, color: "red", outline: true });
                new Point(targetMarking.center.x, targetMarking.center.y)
                    .draw(this.ctx, { size: 7.5 / scaler, color: "white", outline: true });
                new Point(targetMarking.center.x, targetMarking.center.y)
                    .draw(this.ctx, { size: 2.5 / scaler, color: "red", outline: true });

                const scaledTargetpoint = scale(targetMarking.center, -scaler)
                // Check if target is outside the minimap range
                const distanceToTarget = distance(scaledViewpoint, scaledTargetpoint);
                
                if (distanceToTarget > this.ctx.canvas.width / 2) {
                    const angleToTarget = angle(subtract(scaledViewpoint, scaledTargetpoint));
                    const targetPointer = translate(viewpoint, angleToTarget, width / (2 * scaler));
                    new Arrow(targetPointer, angleToTarget, 20 / scaler, 15 / scaler)
                        .draw(this.ctx, { color: "red" });
                }
            }

            // Draw path to target
            if (this.world.carToFollow && this.world.carToFollow.path.length > 0) {
                const path = this.world.carToFollow.path;
                path[0].draw(this.ctx, { size: 12.5 / scaler, color: "yellow", outline: true });
                for (let i = 1; i < path.length; i++) {
                    new Segment(path[i - 1], path[i]).draw(this.ctx, { width: 2 / scaler, color: "cyan" });
                }
            }

            // Draw car 
            this.ctx.restore();
            if (this.world.carToFollow) {
                new Point(width / 2, height / 2)
                    .draw(this.ctx, { color: "blue", outline: true });
            }
        }
    }
}
